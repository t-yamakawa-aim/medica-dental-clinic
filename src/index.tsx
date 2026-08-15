import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { renderer } from './renderer'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ReservePage } from './components/ReservePage'
import { AdminReservePage } from './components/AdminReservePage'
import { AdminDashboardPage } from './components/AdminDashboardPage'

export type Bindings = {
  DB: D1Database
  ADMIN_RESERVE_USER?: string
  ADMIN_RESERVE_PASSWORD?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

// ==================== Web予約（初診＝院長 / 初診メンテナンス＝歯科衛生士） ====================
// コースの所要時間(30/45/60分)はクリニックごとに course_settings テーブルで設定可能。
// 歯科衛生士は1〜5名程度で増減・休職があるため hygienists テーブルで管理し、
// 患者側には「担当者」を見せず、時間だけを提示して裏側で自動的に空いている衛生士を割り当てる。

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

// 歯科衛生士の「日付・時間帯単位の休み」を考慮したSQL条件（NOT EXISTS句）を生成する。
// hygienist_time_off に、対象枠(slot_date, start_time〜end_time)と重なる休みがあれば除外する。
// - start_time/end_timeが両方NULLの休み = 終日休み
// - それ以外は時間帯の重複判定（開始 < 相手の終了 AND 終了 > 相手の開始）
// - hygienist_id が NULL の枠（院長担当の初診など）は対象外＝常に通過する
const notOnTimeOffSql = (alias: string): string => `
  NOT EXISTS (
    SELECT 1 FROM hygienist_time_off t
    WHERE t.hygienist_id = ${alias}.hygienist_id
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
// 患者は「日付・時間・コース」だけを指定する。同じ日時に複数の歯科衛生士の枠が
// 空いている場合は、裏側で自動的にどれか1つを選んで確保する（担当者名は患者に見せない）。
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
    // 同じ日付・時間・コースで「空き」になっている候補枠(複数の衛生士がいれば複数件)を取得
    // 担当の歯科衛生士がその日その時間帯に休みの場合は候補から除外する
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
      `INSERT INTO reservations (slot_id, name, kana, phone, email, birth_date, symptom, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        claimedSlotId,
        body.name,
        body.kana || null,
        body.phone,
        body.email || null,
        body.birth_date || null,
        body.symptom || null,
        body.message || null
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

// ---- 管理用: 歯科衛生士の一覧・追加・更新・削除（1〜5名程度、休職はis_activeで非表示にする） ----
app.get('/api/admin/hygienists', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, name, is_active, sort_order FROM hygienists ORDER BY sort_order ASC, id ASC'
    ).all()
    return c.json({ ok: true, items: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.post('/api/admin/hygienists', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  const name = String(body?.name || '').trim()
  if (!name) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    const maxRow = await env.DB.prepare('SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM hygienists').first()
    const nextOrder = ((maxRow as any)?.maxOrder || 0) + 1
    const result = await env.DB.prepare(
      'INSERT INTO hygienists (name, is_active, sort_order) VALUES (?, 1, ?)'
    )
      .bind(name, nextOrder)
      .run()
    return c.json({ ok: true, id: result.meta?.last_row_id })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.put('/api/admin/hygienists/:id', async (c) => {
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
    const existing = await env.DB.prepare('SELECT id, name, is_active FROM hygienists WHERE id = ?').bind(id).first()
    if (!existing) {
      return c.json({ ok: false, error: 'not_found' }, 404)
    }
    const name = body.name !== undefined ? String(body.name).trim() : (existing as any).name
    const isActive = body.is_active !== undefined ? (body.is_active ? 1 : 0) : (existing as any).is_active
    await env.DB.prepare('UPDATE hygienists SET name = ?, is_active = ? WHERE id = ?')
      .bind(name, isActive, id)
      .run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.delete('/api/admin/hygienists/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    const inUse = await env.DB.prepare('SELECT COUNT(*) as cnt FROM reservation_slots WHERE hygienist_id = ?')
      .bind(id)
      .first()
    if (((inUse as any)?.cnt || 0) > 0) {
      return c.json({ ok: false, error: 'hygienist_in_use' }, 409)
    }
    await env.DB.prepare('DELETE FROM hygienists WHERE id = ?').bind(id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 歯科衛生士の「日付・時間帯単位の休み」一覧取得・追加・削除 ----
// 「稼働中/休職中」のような固定フラグではなく、
// 「Aさんは8/20は終日有給」「Bさんは8/21の10:00〜12:00だけお休み」のように
// 日によって異なる勤務パターン（有給、午前休、時短出勤など）を管理する。
app.get('/api/admin/hygienist-time-off', async (c) => {
  const { env } = c
  const hygienistId = c.req.query('hygienist_id')
  const from = c.req.query('from') // 一覧表示の絞り込み用（この日付以降のみ返す）
  try {
    let query = `SELECT id, hygienist_id, off_date, start_time, end_time, reason, created_at FROM hygienist_time_off`
    const conditions: string[] = []
    const params: (string | number)[] = []
    if (hygienistId !== undefined) {
      const hid = Number(hygienistId)
      if (!Number.isInteger(hid)) {
        return c.json({ ok: false, error: 'invalid_hygienist_id' }, 400)
      }
      conditions.push('hygienist_id = ?')
      params.push(hid)
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

app.post('/api/admin/hygienist-time-off', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  const hygienistId = Number(body?.hygienist_id)
  if (!body || !Number.isInteger(hygienistId) || !isValidDate(body.off_date)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  // start_time/end_timeは両方省略(終日休み) or 両方指定(時間帯休み)のみ許可
  const startTime = body.start_time === '' ? undefined : body.start_time
  const endTime = body.end_time === '' ? undefined : body.end_time
  if (!isValidTimeOffRange(startTime, endTime)) {
    return c.json({ ok: false, error: 'invalid_time_range' }, 400)
  }
  try {
    const hygienist = await env.DB.prepare('SELECT id FROM hygienists WHERE id = ?').bind(hygienistId).first()
    if (!hygienist) {
      return c.json({ ok: false, error: 'hygienist_not_found' }, 404)
    }
    const result = await env.DB.prepare(
      `INSERT INTO hygienist_time_off (hygienist_id, off_date, start_time, end_time, reason)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(hygienistId, body.off_date, startTime || null, endTime || null, body.reason || null)
      .run()
    return c.json({ ok: true, id: result.meta?.last_row_id })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

app.delete('/api/admin/hygienist-time-off/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    await env.DB.prepare('DELETE FROM hygienist_time_off WHERE id = ?').bind(id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 指定日の全枠＋予約者情報（コース・担当衛生士も表示） ----
app.get('/api/admin/reserve/slots', async (c) => {
  const { env } = c
  const date = c.req.query('date')
  if (!isValidDate(date)) {
    return c.json({ ok: false, error: 'invalid_date' }, 400)
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT s.id, s.slot_date, s.start_time, s.end_time, s.status, s.course_type, s.duration_minutes,
              s.hygienist_id, h.name as hygienist_name,
              r.id as reservation_id, r.name, r.kana, r.phone, r.email, r.birth_date, r.symptom, r.message,
              EXISTS (
                SELECT 1 FROM hygienist_time_off t
                WHERE t.hygienist_id = s.hygienist_id
                  AND t.off_date = s.slot_date
                  AND (
                    (t.start_time IS NULL AND t.end_time IS NULL)
                    OR (t.start_time < s.end_time AND t.end_time > s.start_time)
                  )
              ) as hygienist_is_off
       FROM reservation_slots s
       LEFT JOIN hygienists h ON h.id = s.hygienist_id
       LEFT JOIN reservations r ON r.slot_id = s.id
       WHERE s.slot_date = ?
       ORDER BY s.start_time ASC, s.hygienist_id ASC`
    )
      .bind(date)
      .all()
    return c.json({ ok: true, slots: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 枠を新規追加(15分間隔の開始時刻・コース・担当衛生士を指定) ----
app.post('/api/admin/reserve/slots', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (!body || !isValidDate(body.slot_date) || !isValidTime(body.start_time) || !isValidCourseType(body.course_type)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }

  // 初診メンテナンスは担当の歯科衛生士が必須
  let hygienistId: number | null = null
  if (body.course_type === 'initial_maintenance') {
    hygienistId = Number(body.hygienist_id)
    if (!Number.isInteger(hygienistId)) {
      return c.json({ ok: false, error: 'hygienist_required' }, 400)
    }
  }

  try {
    const courseSetting = await getCourseSetting(env, body.course_type)
    if (!courseSetting) {
      return c.json({ ok: false, error: 'invalid_course' }, 400)
    }
    const duration = courseSetting.duration_minutes
    const endTime = addMinutes(body.start_time, duration)

    await env.DB.prepare(
      `INSERT INTO reservation_slots (slot_date, start_time, end_time, status, course_type, hygienist_id, duration_minutes)
       VALUES (?, ?, ?, 'open', ?, ?, ?)`
    )
      .bind(body.slot_date, body.start_time, endTime, body.course_type, hygienistId, duration)
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
      `SELECT id, status, slot_date, start_time, end_time, hygienist_id FROM reservation_slots WHERE id = ?`
    )
      .bind(id)
      .first()
    if (!slot) {
      return c.json({ ok: false, error: 'slot_not_found' }, 404)
    }
    if ((slot as any).status !== 'open') {
      return c.json({ ok: false, error: 'slot_unavailable' }, 409)
    }

    // 担当の歯科衛生士がその日その時間帯に休みの場合は登録させない
    if ((slot as any).hygienist_id) {
      const offRow = await env.DB.prepare(
        `SELECT 1 FROM hygienist_time_off
         WHERE hygienist_id = ? AND off_date = ?
           AND (
             (start_time IS NULL AND end_time IS NULL)
             OR (start_time < ? AND end_time > ?)
           )
         LIMIT 1`
      )
        .bind((slot as any).hygienist_id, (slot as any).slot_date, (slot as any).end_time, (slot as any).start_time)
        .first()
      if (offRow) {
        return c.json({ ok: false, error: 'hygienist_on_time_off' }, 409)
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
      `INSERT INTO reservations (slot_id, name, kana, phone, email, birth_date, symptom, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.name,
        body.kana || null,
        body.phone,
        body.email || null,
        body.birth_date || null,
        body.symptom || null,
        body.message || null
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

export default app
