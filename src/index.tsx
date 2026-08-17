import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { renderer } from './renderer'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ReservePage } from './components/ReservePage'
import { AdminReservePage } from './components/AdminReservePage'
import { AdminSchedulePage } from './components/AdminSchedulePage'
import { AdminDashboardPage } from './components/AdminDashboardPage'

export type Bindings = {
  DB: D1Database
  ADMIN_RESERVE_USER?: string
  ADMIN_RESERVE_PASSWORD?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

// ==================== Web予約（初診＝歯科医師 / 初診メンテナンス＝歯科衛生士） ====================
// コースの所要時間(30/45/60分)はクリニックごとに course_settings テーブルで設定可能。
// 歯科医師・歯科衛生士は共に staff テーブルで管理し（role列で区別、それぞれ1〜4名程度の増減・休職に対応）、
// 患者側には「担当者」を見せず、時間だけを提示して裏側で自動的に空いているスタッフを割り当てる。

const pad2 = (n: number): string => String(n).padStart(2, '0')

// 開始時刻(HH:MM)から指定分数後の終了時刻を計算
const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${pad2(hh)}:${pad2(mm)}`
}

const isValidDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const isValidTime = (s: unknown): s is string => typeof s === 'string' && /^\d{2}:\d{2}$/.test(s)

// スタッフ（歯科医師・歯科衛生士）の「日付・時間帯単位の休み」を考慮したSQL条件（NOT EXISTS句）を生成する。
// staff_time_off に、対象枠(slot_date, start_time〜end_time)と重なる休みがあれば除外する。
// - start_time/end_timeが両方NULLの休み = 終日休み
// - それ以外は時間帯の重複判定（開始 < 相手の終了 AND 終了 > 相手の開始）
const notOnTimeOffSql = (alias: string): string => `
  NOT EXISTS (
    SELECT 1 FROM staff_time_off t
    WHERE t.staff_id = ${alias}.staff_id
      AND t.off_date = ${alias}.slot_date
      AND (
        (t.start_time IS NULL AND t.end_time IS NULL)
        OR (t.start_time < ${alias}.end_time AND t.end_time > ${alias}.start_time)
      )
  )
`

const isValidTimeOffRange = (startTime: unknown, endTime: unknown): boolean => {
  // どちらも未指定(終日) or どちらも指定(時間帯)のみ許可。片方だけの指定は不可。
  if (startTime === undefined || startTime === null) {
    return endTime === undefined || endTime === null
  }
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false
  }
  return (startTime as string) < (endTime as string)
}

const COURSE_TYPES = ['initial_doctor', 'initial_maintenance'] as const
type CourseType = (typeof COURSE_TYPES)[number]
const isValidCourseType = (s: unknown): s is CourseType => typeof s === 'string' && (COURSE_TYPES as readonly string[]).includes(s)
const ALLOWED_DURATIONS = [30, 45, 60]

const STAFF_ROLES = ['dentist', 'hygienist'] as const
type StaffRole = (typeof STAFF_ROLES)[number]
const isValidStaffRole = (s: unknown): s is StaffRole => typeof s === 'string' && (STAFF_ROLES as readonly string[]).includes(s)

// コース種別ごとに担当できるスタッフの役割（初診=歯科医師 / 初診メンテナンス=歯科衛生士）
const ROLE_FOR_COURSE: Record<CourseType, StaffRole> = {
  initial_doctor: 'dentist',
  initial_maintenance: 'hygienist',
}

async function getCourseSetting(env: Bindings, courseType: CourseType) {
  const row = await env.DB.prepare(
    'SELECT course_type, duration_minutes, label FROM course_settings WHERE course_type = ?'
  )
    .bind(courseType)
    .first()
  return row as { course_type: string; duration_minutes: number; label: string } | null
}

// ---- 患者用・公開: コース一覧（種別・表示名・所要時間） ----
app.get('/api/reserve/courses', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(
      'SELECT course_type, label, duration_minutes FROM course_settings ORDER BY course_type'
    ).all()
    return c.json({ ok: true, courses: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 患者用: 指定コース・指定日の予約可能な時間一覧（担当者は見せず時間のみを集約表示） ----
app.get('/api/reserve/slots', async (c) => {
  const { env } = c
  const date = c.req.query('date')
  const course = c.req.query('course')
  if (!isValidDate(date) || !isValidCourseType(course)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT MIN(id) as id, slot_date, start_time, end_time FROM reservation_slots
       WHERE slot_date = ? AND course_type = ? AND status = 'open'
         AND ${notOnTimeOffSql('reservation_slots')}
       GROUP BY start_time
       ORDER BY start_time ASC`
    )
      .bind(date, course)
      .all()
    return c.json({ ok: true, slots: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 患者用: 指定コースの予約可能な日付一覧（今日以降、空き枠が1つ以上ある日付） ----
app.get('/api/reserve/available-dates', async (c) => {
  const { env } = c
  const course = c.req.query('course')
  if (!isValidCourseType(course)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT slot_date FROM reservation_slots
       WHERE status = 'open' AND course_type = ? AND slot_date >= date('now', 'localtime')
         AND ${notOnTimeOffSql('reservation_slots')}
       ORDER BY slot_date ASC`
    )
      .bind(course)
      .all()
    return c.json({ ok: true, dates: (results as any[]).map((r) => r.slot_date) })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 患者用: 予約登録 ----
// 患者は「日付・時間・コース」だけを指定する。同じ日時に複数のスタッフの枠が
// 空いている場合は、裏側で自動的にどれか1つを選んで確保する（担当者名は患者に見せない）。
// patient_number（院内患者番号）は任意入力。久しぶりの来院の方が分かる場合にご記入いただく。
app.post('/api/reserve', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (
    !body ||
    !isValidDate(body.slot_date) ||
    !isValidTime(body.start_time) ||
    !isValidCourseType(body.course_type) ||
    !body.name ||
    !body.phone
  ) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }

  try {
    // 同じ日付・時間・コースで「空き」になっている候補枠(複数のスタッフがいれば複数件)を取得
    // 担当のスタッフがその日その時間帯に休みの場合は候補から除外する
    const { results: candidates } = await env.DB.prepare(
      `SELECT id FROM reservation_slots
       WHERE slot_date = ? AND start_time = ? AND course_type = ? AND status = 'open'
         AND ${notOnTimeOffSql('reservation_slots')}
       ORDER BY id ASC`
    )
      .bind(body.slot_date, body.start_time, body.course_type)
      .all()

    if (!candidates || candidates.length === 0) {
      return c.json({ ok: false, error: 'slot_unavailable' }, 409)
    }

    // 候補を1件ずつ、レース対策の条件付きUPDATE(status='open'限定)で確保を試みる
    let claimedSlotId: number | null = null
    for (const row of candidates as any[]) {
      const updateResult = await env.DB.prepare(
        `UPDATE reservation_slots SET status = 'booked' WHERE id = ? AND status = 'open'`
      )
        .bind(row.id)
        .run()
      if (updateResult.meta && updateResult.meta.changes > 0) {
        claimedSlotId = row.id
        break
      }
    }

    if (claimedSlotId === null) {
      return c.json({ ok: false, error: 'slot_unavailable' }, 409)
    }

    await env.DB.prepare(
      `INSERT INTO reservations (slot_id, name, kana, phone, email, birth_date, symptom, message, patient_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        claimedSlotId,
        body.name,
        body.kana || null,
        body.phone,
        body.email || null,
        body.birth_date || null,
        body.symptom || null,
        body.message || null,
        body.patient_number || null
      )
      .run()

    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- クリニック側: 管理画面(予約枠)・管理APIをBasic認証で保護 ----
const adminAuth = async (c: any, next: any) => {
  const { env } = c
  if (!env.ADMIN_RESERVE_PASSWORD) {
    return c.text(
      '管理画面のパスワードが設定されていません。Cloudflareのシークレット(ADMIN_RESERVE_USER / ADMIN_RESERVE_PASSWORD)を設定してください。',
      503
    )
  }
  const auth = basicAuth({
    username: env.ADMIN_RESERVE_USER || 'admin',
    password: env.ADMIN_RESERVE_PASSWORD,
  })
  return auth(c, next)
}
app.use('/admin', adminAuth)
app.use('/admin/*', adminAuth)
app.use('/api/admin/*', adminAuth)

// ---- 管理用: コース設定の取得・更新（所要時間を30/45/60分から選べる） ----
app.get('/api/admin/course-settings', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(
      'SELECT course_type, label, duration_minutes FROM course_settings ORDER BY course_type'
    ).all()
    return c.json({ ok: true, courses: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.put('/api/admin/course-settings/:courseType', async (c) => {
  const { env } = c
  const courseType = c.req.param('courseType')
  if (!isValidCourseType(courseType)) {
    return c.json({ ok: false, error: 'invalid_course' }, 400)
  }
  const body = await c.req.json().catch(() => null)
  const duration = Number(body?.duration_minutes)
  if (!ALLOWED_DURATIONS.includes(duration)) {
    return c.json({ ok: false, error: 'invalid_duration' }, 400)
  }
  try {
    await env.DB.prepare('UPDATE course_settings SET duration_minutes = ? WHERE course_type = ?')
      .bind(duration, courseType)
      .run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: スタッフ（歯科医師・歯科衛生士）の一覧・追加・更新・削除 ----
// 歯科医師・歯科衛生士とも1〜4名程度で増減・休職があるため role 付きの staff テーブルで一元管理し、
// 休職は is_active で非表示にする（削除は予約枠に紐づいている場合はできない）。
app.get('/api/admin/staff', async (c) => {
  const { env } = c
  const role = c.req.query('role')
  if (role !== undefined && !isValidStaffRole(role)) {
    return c.json({ ok: false, error: 'invalid_role' }, 400)
  }
  try {
    const query = role
      ? env.DB.prepare(
          `SELECT id, name, role, is_active, sort_order FROM staff WHERE role = ?
           ORDER BY sort_order ASC, id ASC`
        ).bind(role)
      : env.DB.prepare(
          `SELECT id, name, role, is_active, sort_order FROM staff
           ORDER BY CASE role WHEN 'dentist' THEN 0 ELSE 1 END, sort_order ASC, id ASC`
        )
    const { results } = await query.all()
    return c.json({ ok: true, items: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.post('/api/admin/staff', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  const name = String(body?.name || '').trim()
  const role = body?.role
  if (!name || !isValidStaffRole(role)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    const maxRow = await env.DB.prepare(
      'SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM staff WHERE role = ?'
    )
      .bind(role)
      .first()
    const nextOrder = ((maxRow as any)?.maxOrder || 0) + 1
    const result = await env.DB.prepare(
      'INSERT INTO staff (name, role, is_active, sort_order) VALUES (?, ?, 1, ?)'
    )
      .bind(name, role, nextOrder)
      .run()
    return c.json({ ok: true, id: result.meta?.last_row_id })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.put('/api/admin/staff/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  const body = await c.req.json().catch(() => null)
  if (!body) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    const existing = await env.DB.prepare('SELECT id, name, is_active FROM staff WHERE id = ?').bind(id).first()
    if (!existing) {
      return c.json({ ok: false, error: 'not_found' }, 404)
    }
    const name = body.name !== undefined ? String(body.name).trim() : (existing as any).name
    const isActive = body.is_active !== undefined ? (body.is_active ? 1 : 0) : (existing as any).is_active
    await env.DB.prepare('UPDATE staff SET name = ?, is_active = ? WHERE id = ?')
      .bind(name, isActive, id)
      .run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.delete('/api/admin/staff/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    const inUse = await env.DB.prepare('SELECT COUNT(*) as cnt FROM reservation_slots WHERE staff_id = ?')
      .bind(id)
      .first()
    if (((inUse as any)?.cnt || 0) > 0) {
      return c.json({ ok: false, error: 'staff_in_use' }, 409)
    }
    await env.DB.prepare('DELETE FROM staff WHERE id = ?').bind(id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: スタッフの「日付・時間帯単位の休み」一覧取得・追加・削除 ----
// 「稼働中/休職中」のような固定フラグではなく、
// 「Aさんは8/20は終日有給」「Bさんは8/21の10:00〜12:00だけお休み」のように
// 日によって異なる勤務パターン（有給、午前休、時短出勤など）を管理する。歯科医師・歯科衛生士共通。
app.get('/api/admin/staff-time-off', async (c) => {
  const { env } = c
  const staffId = c.req.query('staff_id')
  const from = c.req.query('from') // 一覧表示の絞り込み用（この日付以降のみ返す）
  try {
    let query = `SELECT id, staff_id, off_date, start_time, end_time, reason, created_at FROM staff_time_off`
    const conditions: string[] = []
    const params: (string | number)[] = []
    if (staffId !== undefined) {
      const sid = Number(staffId)
      if (!Number.isInteger(sid)) {
        return c.json({ ok: false, error: 'invalid_staff_id' }, 400)
      }
      conditions.push('staff_id = ?')
      params.push(sid)
    }
    if (from !== undefined) {
      if (!isValidDate(from)) {
        return c.json({ ok: false, error: 'invalid_from' }, 400)
      }
      conditions.push('off_date >= ?')
      params.push(from)
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    query += ' ORDER BY off_date ASC, start_time ASC'
    const stmt = env.DB.prepare(query)
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all()
    return c.json({ ok: true, items: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.post('/api/admin/staff-time-off', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  const staffId = Number(body?.staff_id)
  if (!body || !Number.isInteger(staffId) || !isValidDate(body.off_date)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  // start_time/end_timeは両方省略(終日休み) or 両方指定(時間帯休み)のみ許可
  const startTime = body.start_time === '' ? undefined : body.start_time
  const endTime = body.end_time === '' ? undefined : body.end_time
  if (!isValidTimeOffRange(startTime, endTime)) {
    return c.json({ ok: false, error: 'invalid_time_range' }, 400)
  }
  try {
    const staff = await env.DB.prepare('SELECT id FROM staff WHERE id = ?').bind(staffId).first()
    if (!staff) {
      return c.json({ ok: false, error: 'staff_not_found' }, 404)
    }
    const result = await env.DB.prepare(
      `INSERT INTO staff_time_off (staff_id, off_date, start_time, end_time, reason)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(staffId, body.off_date, startTime || null, endTime || null, body.reason || null)
      .run()
    return c.json({ ok: true, id: result.meta?.last_row_id })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.delete('/api/admin/staff-time-off/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    await env.DB.prepare('DELETE FROM staff_time_off WHERE id = ?').bind(id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 指定日の全枠＋予約者情報（コース・担当スタッフも表示） ----
app.get('/api/admin/reserve/slots', async (c) => {
  const { env } = c
  const date = c.req.query('date')
  if (!isValidDate(date)) {
    return c.json({ ok: false, error: 'invalid_date' }, 400)
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT s.id, s.slot_date, s.start_time, s.end_time, s.status, s.course_type, s.duration_minutes,
              s.staff_id, st.name as staff_name, st.role as staff_role,
              r.id as reservation_id, r.name, r.kana, r.phone, r.email, r.birth_date, r.symptom, r.message, r.patient_number,
              EXISTS (
                SELECT 1 FROM staff_time_off t
                WHERE t.staff_id = s.staff_id
                  AND t.off_date = s.slot_date
                  AND (
                    (t.start_time IS NULL AND t.end_time IS NULL)
                    OR (t.start_time < s.end_time AND t.end_time > s.start_time)
                  )
              ) as staff_is_off
       FROM reservation_slots s
       LEFT JOIN staff st ON st.id = s.staff_id
       LEFT JOIN reservations r ON r.slot_id = s.id
       WHERE s.slot_date = ?
       ORDER BY s.start_time ASC, s.staff_id ASC`
    )
      .bind(date)
      .all()
    return c.json({ ok: true, slots: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 枠を新規追加(15分間隔の開始時刻・コース・担当スタッフを指定) ----
app.post('/api/admin/reserve/slots', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (!body || !isValidDate(body.slot_date) || !isValidTime(body.start_time) || !isValidCourseType(body.course_type)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }

  // コースに応じた担当スタッフ（初診=歯科医師 / 初診メンテナンス=歯科衛生士）が必須
  const staffId = Number(body.staff_id)
  if (!Number.isInteger(staffId)) {
    return c.json({ ok: false, error: 'staff_required' }, 400)
  }

  try {
    const courseSetting = await getCourseSetting(env, body.course_type)
    if (!courseSetting) {
      return c.json({ ok: false, error: 'invalid_course' }, 400)
    }

    const staff = await env.DB.prepare('SELECT id, role FROM staff WHERE id = ?').bind(staffId).first()
    if (!staff) {
      return c.json({ ok: false, error: 'staff_not_found' }, 404)
    }
    if ((staff as any).role !== ROLE_FOR_COURSE[body.course_type as CourseType]) {
      return c.json({ ok: false, error: 'staff_role_mismatch' }, 400)
    }

    const duration = courseSetting.duration_minutes
    const endTime = addMinutes(body.start_time, duration)

    await env.DB.prepare(
      `INSERT INTO reservation_slots (slot_date, start_time, end_time, status, course_type, staff_id, duration_minutes)
       VALUES (?, ?, ?, 'open', ?, ?, ?)`
    )
      .bind(body.slot_date, body.start_time, endTime, body.course_type, staffId, duration)
      .run()
    return c.json({ ok: true })
  } catch (e: any) {
    if (String(e?.message || '').includes('UNIQUE')) {
      return c.json({ ok: false, error: 'slot_already_exists' }, 409)
    }
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 枠を削除（予約が入っていない場合のみ） ----
app.delete('/api/admin/reserve/slots/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    const slot = await env.DB.prepare(`SELECT status FROM reservation_slots WHERE id = ?`).bind(id).first()
    if (!slot) {
      return c.json({ ok: false, error: 'slot_not_found' }, 404)
    }
    if ((slot as any).status === 'booked') {
      return c.json({ ok: false, error: 'slot_booked' }, 409)
    }
    await env.DB.prepare(`DELETE FROM reservation_slots WHERE id = ?`).bind(id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 受付スタッフが既存の空き枠に直接、患者情報を入力して予約登録する ----
// （2回目以降の来院者や電話予約など、Web予約フォームを使わない予約をこの管理画面から登録できるようにする）
app.post('/api/admin/reserve/slots/:id/book', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  const body = await c.req.json().catch(() => null)
  if (!body || !body.name || !body.phone) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    const slot = await env.DB.prepare(
      `SELECT id, status, slot_date, start_time, end_time, staff_id FROM reservation_slots WHERE id = ?`
    )
      .bind(id)
      .first()
    if (!slot) {
      return c.json({ ok: false, error: 'slot_not_found' }, 404)
    }
    if ((slot as any).status !== 'open') {
      return c.json({ ok: false, error: 'slot_unavailable' }, 409)
    }

    // 担当のスタッフがその日その時間帯に休みの場合は登録させない
    if ((slot as any).staff_id) {
      const offRow = await env.DB.prepare(
        `SELECT 1 FROM staff_time_off
         WHERE staff_id = ? AND off_date = ?
           AND (
             (start_time IS NULL AND end_time IS NULL)
             OR (start_time < ? AND end_time > ?)
           )
         LIMIT 1`
      )
        .bind((slot as any).staff_id, (slot as any).slot_date, (slot as any).end_time, (slot as any).start_time)
        .first()
      if (offRow) {
        return c.json({ ok: false, error: 'staff_on_time_off' }, 409)
      }
    }

    // レース対策の条件付きUPDATE(status='open'限定)で確保
    const updateResult = await env.DB.prepare(
      `UPDATE reservation_slots SET status = 'booked' WHERE id = ? AND status = 'open'`
    )
      .bind(id)
      .run()
    if (!updateResult.meta || updateResult.meta.changes === 0) {
      return c.json({ ok: false, error: 'slot_unavailable' }, 409)
    }

    await env.DB.prepare(
      `INSERT INTO reservations (slot_id, name, kana, phone, email, birth_date, symptom, message, patient_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.name,
        body.kana || null,
        body.phone,
        body.email || null,
        body.birth_date || null,
        body.symptom || null,
        body.message || null,
        body.patient_number || null
      )
      .run()

    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 予約キャンセル（枠をopenに戻す） ----
app.post('/api/admin/reserve/slots/:id/cancel', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    await env.DB.prepare(
      `UPDATE reservations SET cancelled_at = CURRENT_TIMESTAMP WHERE slot_id = ? AND cancelled_at IS NULL`
    )
      .bind(id)
      .run()
    await env.DB.prepare(`DELETE FROM reservations WHERE slot_id = ?`).bind(id).run()
    await env.DB.prepare(`UPDATE reservation_slots SET status = 'open' WHERE id = ?`).bind(id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 指定日の「スタッフ×時間帯」担当表（一覧・印刷用） ----
// 時間軸はその日に実際に作成されている予約枠から自動生成する（固定の診療時間設定は持たない）。
// スタッフ軸は歯科医師→歯科衛生士の順、それぞれの登録順（sort_order）で並べる。
app.get('/api/admin/schedule', async (c) => {
  const { env } = c
  const date = c.req.query('date')
  if (!isValidDate(date)) {
    return c.json({ ok: false, error: 'invalid_date' }, 400)
  }
  try {
    const { results: staffList } = await env.DB.prepare(
      `SELECT id, name, role FROM staff
       WHERE is_active = 1
       ORDER BY CASE role WHEN 'dentist' THEN 0 ELSE 1 END, sort_order ASC, id ASC`
    ).all()

    const { results: slots } = await env.DB.prepare(
      `SELECT s.id, s.start_time, s.end_time, s.status, s.course_type, s.staff_id,
              r.name as patient_name, r.patient_number,
              EXISTS (
                SELECT 1 FROM staff_time_off t
                WHERE t.staff_id = s.staff_id
                  AND t.off_date = s.slot_date
                  AND (
                    (t.start_time IS NULL AND t.end_time IS NULL)
                    OR (t.start_time < s.end_time AND t.end_time > s.start_time)
                  )
              ) as staff_is_off
       FROM reservation_slots s
       LEFT JOIN reservations r ON r.slot_id = s.id
       WHERE s.slot_date = ?
       ORDER BY s.start_time ASC`
    )
      .bind(date)
      .all()

    // 時間軸：その日に実際に作成されている枠の開始〜終了時刻の組み合わせを重複なく抽出
    const timeSet = new Map<string, { start_time: string; end_time: string }>()
    for (const s of slots as any[]) {
      const key = `${s.start_time}-${s.end_time}`
      if (!timeSet.has(key)) {
        timeSet.set(key, { start_time: s.start_time, end_time: s.end_time })
      }
    }
    const rows = Array.from(timeSet.values()).sort((a, b) => (a.start_time < b.start_time ? -1 : a.start_time > b.start_time ? 1 : 0))

    // 各行(時間帯)×スタッフ のセル情報を組み立てる
    const scheduleRows = rows.map((row) => {
      const cells: Record<string, any> = {}
      for (const staff of staffList as any[]) {
        const slot = (slots as any[]).find(
          (s) => s.staff_id === staff.id && s.start_time === row.start_time && s.end_time === row.end_time
        )
        if (!slot) {
          cells[staff.id] = { state: 'none' }
        } else if (slot.status === 'booked') {
          cells[staff.id] = {
            state: 'booked',
            patient_name: slot.patient_name,
            patient_number: slot.patient_number,
            course_type: slot.course_type,
          }
        } else if (slot.staff_is_off) {
          cells[staff.id] = { state: 'off' }
        } else {
          cells[staff.id] = { state: 'open' }
        }
      }
      return { start_time: row.start_time, end_time: row.end_time, cells }
    })

    return c.json({ ok: true, date, staff: staffList, rows: scheduleRows })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ==================== ページルーティング ====================

// ---- トップページ：本体サイト(WordPress)がトップを担うため、Web予約ページへリダイレクト ----
app.get('/', (c) => {
  return c.redirect('/reserve', 302)
})

// ---- Web予約（初診専用） ----
app.get('/reserve', (c) => {
  return c.render(
    <>
      <Header />
      <ReservePage />
      <Footer />
    </>,
    {
      title: 'Web予約（初診専用）',
      description: 'メディカデンタルクリニック（石川県金沢市）のWeb予約ページです。初診の方専用に、ご希望のコース・日時をお選びいただけます。',
    }
  )
})

// ---- クリニック側: 管理トップ（画面はAPIと同じBasic認証ミドルウェアで保護済み） ----
app.get('/admin', (c) => {
  return c.html(<AdminDashboardPage />)
})

// ---- クリニック側: 予約枠管理画面 ----
app.get('/admin/reserve', (c) => {
  return c.html(<AdminReservePage />)
})

// ---- クリニック側: 当日・翌日の担当表（スタッフ×時間帯の一覧・印刷用） ----
app.get('/admin/schedule', (c) => {
  return c.html(<AdminSchedulePage />)
})

export default app
