import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { renderer } from './renderer'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HeroSection } from './components/HeroSection'
import { CalendarSection } from './components/CalendarSection'
import { NewsSection, BlogSection, type NewsItem, type BlogItem } from './components/NewsBlogSection'
import { VisionSection } from './components/VisionSection'
import { SymptomsSection } from './components/SymptomsSection'
import { FacilitySection } from './components/FacilitySection'
import { RecruitSection } from './components/RecruitSection'
import { AccessSection } from './components/AccessSection'
import { SymptomsListPage } from './components/SymptomsListPage'
import { SymptomDetailPage } from './components/SymptomDetailPage'
import { MedicalPage } from './components/MedicalPage'
import { ServicePage } from './components/ServicePage'
import { RecruitPage } from './components/RecruitPage'
import { RecruitEntryPage } from './components/RecruitEntryPage'
import { RecruitThanksPage } from './components/RecruitThanksPage'
import { getSymptomDetail } from './data/symptomDetails'
import { PrivacyPage } from './components/PrivacyPage'
import { ReservePage } from './components/ReservePage'
import { AdminReservePage } from './components/AdminReservePage'
import { AdminDashboardPage } from './components/AdminDashboardPage'
import { AdminNewsPage } from './components/AdminNewsPage'
import { AdminBlogPage } from './components/AdminBlogPage'
import { NewsListPage, type NewsListItem } from './components/NewsListPage'
import { NewsDetailPage, type NewsDetailItem } from './components/NewsDetailPage'
import { BlogListPage, type BlogListItem } from './components/BlogListPage'
import { BlogDetailPage, type BlogDetailItem } from './components/BlogDetailPage'

export type Bindings = {
  DB: D1Database
  MEDIA: R2Bucket
  RESEND_API_KEY?: string
  RECRUIT_NOTIFY_EMAIL?: string
  ADMIN_RESERVE_USER?: string
  ADMIN_RESERVE_PASSWORD?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

// ---- API routes ----
app.get('/api/news', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, title, published_at FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT 5'
    ).all()
    return c.json({ items: results })
  } catch (e) {
    return c.json({ items: [] })
  }
})

app.get('/api/blog', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, title, category, thumbnail_url, published_at FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT 4'
    ).all()
    return c.json({ items: results })
  } catch (e) {
    return c.json({ items: [] })
  }
})

app.post('/api/contact', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (!body || !body.name || !body.phone) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    await env.DB.prepare(
      'INSERT INTO contact_messages (name, kana, phone, email, message, type) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(
        body.name,
        body.kana || null,
        body.phone,
        body.email || null,
        body.message || null,
        body.type || 'contact'
      )
      .run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// 採用エントリーフォーム送信APIから通知メールを送信する
// Cloudflare Workers環境ではnodemailer等のSMTPライブラリが使えないため、
// Resend(https://resend.com)のREST APIをfetch経由で呼び出す。
// RESEND_API_KEYが未設定の場合は送信をスキップする(D1への保存は継続する)。
async function sendRecruitNotifyEmail(
  env: Bindings,
  data: { inquiryTypes: string[]; jobTypes: string[]; name: string; kana: string; phone: string; email: string; message: string }
) {
  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    console.log('RESEND_API_KEY未設定のため通知メール送信をスキップしました')
    return
  }
  const toEmail = env.RECRUIT_NOTIFY_EMAIL || 'peacefultomorrow0528@gmail.com'

  const html = `
    <h2>採用エントリーフォームからの送信がありました</h2>
    <table>
      <tr><th align="left">お問い合わせ内容</th><td>${data.inquiryTypes.join('、') || '（未選択）'}</td></tr>
      <tr><th align="left">希望職種</th><td>${data.jobTypes.join('、') || '（未選択）'}</td></tr>
      <tr><th align="left">お名前</th><td>${data.name}</td></tr>
      <tr><th align="left">フリガナ</th><td>${data.kana || ''}</td></tr>
      <tr><th align="left">電話番号</th><td>${data.phone}</td></tr>
      <tr><th align="left">メールアドレス</th><td>${data.email || ''}</td></tr>
      <tr><th align="left">備考</th><td>${(data.message || '').replace(/\n/g, '<br>')}</td></tr>
    </table>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'メディカデンタルクリニック 採用エントリー <onboarding@resend.dev>',
        to: [toEmail],
        subject: `【採用エントリー】${data.name}様よりお問い合わせがありました`,
        html,
      }),
    })
    if (!res.ok) {
      console.log('Resend送信エラー:', res.status, await res.text())
    }
  } catch (e) {
    console.log('Resend送信中に例外発生:', e)
  }
}

app.post('/api/recruit-entry', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (!body || !body.name || !body.phone || !Array.isArray(body.inquiry_types) || body.inquiry_types.length === 0) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }

  const inquiryTypes: string[] = body.inquiry_types
  const jobTypes: string[] = Array.isArray(body.job_types) ? body.job_types : []

  try {
    await env.DB.prepare(
      'INSERT INTO recruit_entries (inquiry_types, job_types, name, kana, phone, email, message) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        JSON.stringify(inquiryTypes),
        JSON.stringify(jobTypes),
        body.name,
        body.kana || null,
        body.phone,
        body.email || null,
        body.message || null
      )
      .run()
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }

  // メール通知はDB保存の成否に関わらずベストエフォートで送信する
  await sendRecruitNotifyEmail(env, {
    inquiryTypes,
    jobTypes,
    name: body.name,
    kana: body.kana || '',
    phone: body.phone,
    email: body.email || '',
    message: body.message || '',
  })

  return c.json({ ok: true })
})

// ==================== Web予約（初診専用・1時間枠） ====================

// 15分間隔の開始時刻から終了時刻(+60分)を計算
const addOneHour = (time: string): string => {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + 60
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const isValidDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const isValidTime = (s: unknown): s is string => typeof s === 'string' && /^\d{2}:\d{2}$/.test(s)

// ---- 患者用: 指定日の予約可能な空き枠一覧 ----
app.get('/api/reserve/slots', async (c) => {
  const { env } = c
  const date = c.req.query('date')
  if (!isValidDate(date)) {
    return c.json({ ok: false, error: 'invalid_date' }, 400)
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, slot_date, start_time, end_time FROM reservation_slots
       WHERE slot_date = ? AND status = 'open' ORDER BY start_time ASC`
    )
      .bind(date)
      .all()
    return c.json({ ok: true, slots: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 患者用: 予約可能な日付一覧（今日以降、空き枠が1つ以上ある日付） ----
app.get('/api/reserve/available-dates', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT slot_date FROM reservation_slots
       WHERE status = 'open' AND slot_date >= date('now', 'localtime') ORDER BY slot_date ASC`
    ).all()
    return c.json({ ok: true, dates: (results as any[]).map((r) => r.slot_date) })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 患者用: 予約登録 ----
app.post('/api/reserve', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (!body || !body.slot_id || !body.name || !body.phone) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }

  const slotId = Number(body.slot_id)
  if (!Number.isInteger(slotId)) {
    return c.json({ ok: false, error: 'invalid_slot' }, 400)
  }

  try {
    // 枠が現在も空いているか確認
    const slot = await env.DB.prepare(`SELECT id, status FROM reservation_slots WHERE id = ?`).bind(slotId).first()
    if (!slot) {
      return c.json({ ok: false, error: 'slot_not_found' }, 404)
    }
    if ((slot as any).status !== 'open') {
      return c.json({ ok: false, error: 'slot_unavailable' }, 409)
    }

    // 枠をbookedに更新 → 予約レコード作成（レース対策として status='open' 条件付きUPDATE）
    const updateResult = await env.DB.prepare(
      `UPDATE reservation_slots SET status = 'booked' WHERE id = ? AND status = 'open'`
    )
      .bind(slotId)
      .run()

    if (!updateResult.meta || updateResult.meta.changes === 0) {
      return c.json({ ok: false, error: 'slot_unavailable' }, 409)
    }

    await env.DB.prepare(
      `INSERT INTO reservations (slot_id, name, kana, phone, email, birth_date, symptom, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        slotId,
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

// ---- クリニック側: 管理画面(予約枠・お知らせ・ブログ)・管理APIをBasic認証で保護 ----
// 予約枠管理から使っていたシークレット(ADMIN_RESERVE_USER / ADMIN_RESERVE_PASSWORD)を
// お知らせ・ブログ管理画面でも共通の管理者アカウントとして使い回す。
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

// ---- 管理用: 指定日の全枠＋予約者情報 ----
app.get('/api/admin/reserve/slots', async (c) => {
  const { env } = c
  const date = c.req.query('date')
  if (!isValidDate(date)) {
    return c.json({ ok: false, error: 'invalid_date' }, 400)
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT s.id, s.slot_date, s.start_time, s.end_time, s.status,
              r.id as reservation_id, r.name, r.kana, r.phone, r.email, r.birth_date, r.symptom, r.message
       FROM reservation_slots s
       LEFT JOIN reservations r ON r.slot_id = s.id
       WHERE s.slot_date = ?
       ORDER BY s.start_time ASC`
    )
      .bind(date)
      .all()
    return c.json({ ok: true, slots: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 管理用: 枠を新規追加(15分間隔の開始時刻を指定) ----
app.post('/api/admin/reserve/slots', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (!body || !isValidDate(body.slot_date) || !isValidTime(body.start_time)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }

  const endTime = addOneHour(body.start_time)

  try {
    await env.DB.prepare(
      `INSERT INTO reservation_slots (slot_date, start_time, end_time, status) VALUES (?, ?, ?, 'open')`
    )
      .bind(body.slot_date, body.start_time, endTime)
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

// ============================================================
// クリニック側: お知らせ管理API（Basic認証は上の app.use('/api/admin/*', adminAuth) で保護済み）
// ============================================================

// ---- 一覧取得（非公開も含む・最新順） ----
app.get('/api/admin/news', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, title, body, published_at, is_published FROM news ORDER BY published_at DESC, id DESC'
    ).all()
    return c.json({ ok: true, items: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 1件取得 ----
app.get('/api/admin/news/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    const item = await env.DB.prepare(
      'SELECT id, title, body, published_at, is_published FROM news WHERE id = ?'
    )
      .bind(id)
      .first()
    if (!item) {
      return c.json({ ok: false, error: 'not_found' }, 404)
    }
    return c.json({ ok: true, item })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 新規作成 ----
app.post('/api/admin/news', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (!body || !body.title || !isValidDate(body.published_at)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    const result = await env.DB.prepare(
      'INSERT INTO news (title, body, published_at, is_published) VALUES (?, ?, ?, ?)'
    )
      .bind(body.title, body.body || null, body.published_at, body.is_published === false ? 0 : 1)
      .run()
    return c.json({ ok: true, id: result.meta.last_row_id })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 更新 ----
app.put('/api/admin/news/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  const body = await c.req.json().catch(() => null)
  if (!Number.isInteger(id) || !body || !body.title || !isValidDate(body.published_at)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    await env.DB.prepare(
      'UPDATE news SET title = ?, body = ?, published_at = ?, is_published = ? WHERE id = ?'
    )
      .bind(body.title, body.body || null, body.published_at, body.is_published === false ? 0 : 1, id)
      .run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 削除 ----
app.delete('/api/admin/news/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    await env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ============================================================
// クリニック側: ブログ管理API（Basic認証は上の app.use('/api/admin/*', adminAuth) で保護済み）
// ============================================================

// ---- 一覧取得 ----
app.get('/api/admin/blog', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, title, body, category, thumbnail_url, published_at, is_published FROM blog_posts ORDER BY published_at DESC, id DESC'
    ).all()
    return c.json({ ok: true, items: results })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 1件取得 ----
app.get('/api/admin/blog/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    const item = await env.DB.prepare(
      'SELECT id, title, body, category, thumbnail_url, published_at, is_published FROM blog_posts WHERE id = ?'
    )
      .bind(id)
      .first()
    if (!item) {
      return c.json({ ok: false, error: 'not_found' }, 404)
    }
    return c.json({ ok: true, item })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 新規作成 ----
app.post('/api/admin/blog', async (c) => {
  const { env } = c
  const body = await c.req.json().catch(() => null)
  if (!body || !body.title || !isValidDate(body.published_at)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    const result = await env.DB.prepare(
      'INSERT INTO blog_posts (title, body, category, thumbnail_url, published_at, is_published) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(
        body.title,
        body.body || null,
        body.category || null,
        body.thumbnail_url || null,
        body.published_at,
        body.is_published === false ? 0 : 1
      )
      .run()
    return c.json({ ok: true, id: result.meta.last_row_id })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 更新 ----
app.put('/api/admin/blog/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  const body = await c.req.json().catch(() => null)
  if (!Number.isInteger(id) || !body || !body.title || !isValidDate(body.published_at)) {
    return c.json({ ok: false, error: 'invalid_request' }, 400)
  }
  try {
    await env.DB.prepare(
      'UPDATE blog_posts SET title = ?, body = ?, category = ?, thumbnail_url = ?, published_at = ?, is_published = ? WHERE id = ?'
    )
      .bind(
        body.title,
        body.body || null,
        body.category || null,
        body.thumbnail_url || null,
        body.published_at,
        body.is_published === false ? 0 : 1,
        id
      )
      .run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ---- 削除 ----
app.delete('/api/admin/blog/:id', async (c) => {
  const { env } = c
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) {
    return c.json({ ok: false, error: 'invalid_id' }, 400)
  }
  try {
    await env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: 'db_error' }, 500)
  }
})

// ============================================================
// クリニック側: 画像アップロードAPI（Cloudflare R2に保存）
// ブログのサムネイル画像などに利用する。Basic認証は /api/admin/* で保護済み。
// ============================================================
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

app.post('/api/admin/upload-image', async (c) => {
  const { env } = c
  const contentType = c.req.header('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return c.json({ ok: false, error: 'invalid_content_type' }, 400)
  }

  try {
    const form = await c.req.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string') {
      return c.json({ ok: false, error: 'file_required' }, 400)
    }

    const ext = ALLOWED_IMAGE_TYPES[file.type]
    if (!ext) {
      return c.json({ ok: false, error: 'unsupported_type' }, 400)
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return c.json({ ok: false, error: 'file_too_large' }, 400)
    }

    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    await env.MEDIA.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    })

    return c.json({ ok: true, url: `/media/${key}` })
  } catch (e) {
    return c.json({ ok: false, error: 'upload_failed' }, 500)
  }
})

// ---- アップロードした画像の配信（R2から読み出し。キャッシュ付き） ----
app.get('/media/*', async (c) => {
  const { env } = c
  const key = c.req.path.replace(/^\/media\//, '')
  if (!key) {
    return c.notFound()
  }
  try {
    const object = await env.MEDIA.get(key)
    if (!object) {
      return c.notFound()
    }
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    return c.notFound()
  }
})

// ==================== Top page ====================
app.get('/', async (c) => {
  const { env } = c
  let newsItems: NewsItem[] = []
  let blogItems: BlogItem[] = []

  try {
    const newsRes = await env.DB.prepare(
      'SELECT id, title, published_at FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT 3'
    ).all<NewsItem>()
    newsItems = newsRes.results
  } catch (e) {
    // DBがまだ無い場合はダミーで表示しない
  }

  try {
    const blogRes = await env.DB.prepare(
      'SELECT id, title, category, thumbnail_url, published_at FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT 4'
    ).all<BlogItem>()
    blogItems = blogRes.results
  } catch (e) {
    // no-op
  }

  return c.render(
    <>
      <Header />
      <main id="top">
        <HeroSection />
        <div id="wrapper">
          <CalendarSection />
          <NewsSection items={newsItems} />
          <VisionSection />
          <SymptomsSection />
          <FacilitySection />
          <BlogSection items={blogItems} />
          <RecruitSection />
        </div>
      </main>
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    { title: undefined }
  )
})

// ---- 当院について ----
app.get('/medical', (c) => {
  return c.render(
    <>
      <Header />
      <MedicalPage />
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: '当院について',
      description:
        '金沢市の歯科医院メディカデンタルクリニックの「当院について」ページ。私たちの目指すもの、院長紹介、当院概要、施設・設備紹介、感染症対策、スタッフ紹介をご案内しています。',
    }
  )
})

// ---- 診療のご案内 ----
app.get('/service', (c) => {
  return c.render(
    <>
      <Header />
      <ServicePage />
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: '診療のご案内',
      description:
        '金沢市の歯科医院メディカデンタルクリニックの「診療のご案内」ページ。ご予約方法やご持参いただくもの、診療の流れをご紹介しています。当院は原則予約制です。事前にご予約のうえご来院ください。',
    }
  )
})

// ---- Web予約（初診専用） ----
app.get('/reserve', (c) => {
  return c.render(
    <>
      <Header />
      <ReservePage />
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: 'Web予約（初診専用）',
      description: 'メディカデンタルクリニック（石川県金沢市）のWeb予約ページです。初診の方専用に、1時間単位でご予約いただけます。',
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

// ---- クリニック側: お知らせ管理画面 ----
app.get('/admin/news', (c) => {
  return c.html(<AdminNewsPage />)
})

// ---- クリニック側: ブログ管理画面 ----
app.get('/admin/blog', (c) => {
  return c.html(<AdminBlogPage />)
})

// ---- プライバシーポリシー ----
app.get('/privacy', (c) => {
  return c.render(
    <>
      <Header />
      <PrivacyPage />
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: 'プライバシーポリシー',
      description: 'メディカデンタルクリニック（石川県金沢市）の個人情報保護方針・プライバシーポリシーについてご案内します。',
    }
  )
})

// ---- 採用情報 ----
app.get('/recruit', (c) => {
  return c.render(
    <>
      <Header />
      <RecruitPage />
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: '採用情報',
      description:
        '金沢市の歯科医院メディカデンタルクリニックの採用情報ページ。院長メッセージ、募集要項(歯科医師・歯科衛生士・歯科助手)をご案内しています。クリニック見学のお申し込みも受付中です。',
    }
  )
})

// ---- 採用エントリーフォーム ----
app.get('/recruit/entry', (c) => {
  return c.render(
    <>
      <Header />
      <RecruitEntryPage />
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: '採用エントリーフォーム',
      description:
        'メディカデンタルクリニックの採用エントリーフォームです。ご応募・クリニック見学のお申し込み・採用に関するお問い合わせを受付しております。',
    }
  )
})

// ---- 応募完了 ----
app.get('/recruit/entry/thanks', (c) => {
  return c.render(
    <>
      <Header />
      <RecruitThanksPage />
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    { title: '応募完了' }
  )
})

// ---- 症状別で探す：一覧ページ ----
app.get('/symptoms', (c) => {
  return c.render(
    <>
      <Header />
      <main id="top">
        <SymptomsListPage />
      </main>
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: '症状別で探す',
      description:
        '虫歯・矯正・インプラント治療など、メンテナンスや審美のお悩みならメディカデンタルクリニック(石川県金沢市)へ。症状別に治療方法をご紹介しています。お気軽にご相談ください。',
    }
  )
})

// ---- 症状別で探す：詳細ページ ----
app.get('/symptoms/:slug', (c) => {
  const slug = c.req.param('slug')
  const detail = getSymptomDetail(slug)

  if (!detail) {
    return c.render(
      <>
        <Header />
        <main id="top">
          <div class="container container-sm section_pdg" style="text-align:center;">
            <h1 class="section-title-lg">準備中です</h1>
            <p style="margin-bottom:32px;">このページは現在準備中です。恐れ入りますが、症状別一覧ページよりお探しください。</p>
            <a href="/symptoms" class="btn btn-primary">
              <i class="fa-solid fa-arrow-left"></i>
              <span>症状別で探すトップへ</span>
            </a>
          </div>
        </main>
        <AccessSection />
        <Footer />
        <a href="#top" id="page-top" aria-label="ページトップへ戻る">
          <i class="fa-solid fa-arrow-up"></i>
        </a>
      </>,
      { title: '準備中' }
    )
  }

  return c.render(
    <>
      <Header />
      <SymptomDetailPage detail={detail} />
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    { title: detail.title, description: detail.metaDescription }
  )
})

// ============================================================
// お知らせ (News) - 投稿型ページ
// D1の news テーブルをWordPressの投稿タイプ/アーカイブ相当として利用する。
// ============================================================
const NEWS_PAGE_SIZE = 10

// 指定した年フィルタ・ページで新着情報一覧を描画する共通処理
async function renderNewsList(
  c: any,
  env: Bindings,
  opts: { year?: number; page: number; basePath: string }
) {
  const { year, page, basePath } = opts
  const offset = (page - 1) * NEWS_PAGE_SIZE

  const yearFilter = year ? 'WHERE is_published = 1 AND substr(published_at,1,4) = ?' : 'WHERE is_published = 1'
  const bindArgs: (string | number)[] = year ? [String(year)] : []

  let items: NewsListItem[] = []
  let totalCount = 0
  let years: number[] = []

  try {
    const countStmt = env.DB.prepare(`SELECT COUNT(*) as cnt FROM news ${yearFilter}`)
    const countRes = await (bindArgs.length ? countStmt.bind(...bindArgs) : countStmt).first<{ cnt: number }>()
    totalCount = countRes?.cnt || 0

    const listStmt = env.DB.prepare(
      `SELECT id, title, published_at FROM news ${yearFilter} ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?`
    )
    const listRes = await listStmt.bind(...bindArgs, NEWS_PAGE_SIZE, offset).all<NewsListItem>()
    items = listRes.results

    const yearsRes = await env.DB.prepare(
      "SELECT DISTINCT substr(published_at,1,4) as y FROM news WHERE is_published = 1 ORDER BY y DESC"
    ).all<{ y: string }>()
    years = yearsRes.results.map((r) => parseInt(r.y, 10)).filter((n) => !isNaN(n))
  } catch (e) {
    // DB未初期化時は空表示
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / NEWS_PAGE_SIZE))

  return c.render(
    <>
      <Header />
      <main id="top">
        <NewsListPage
          items={items}
          years={years}
          currentYear={year}
          currentPage={page}
          totalPages={totalPages}
          basePath={basePath}
        />
      </main>
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: year ? `新着情報 ${year}年` : '新着情報',
      description:
        '金沢市の歯科医院メディカデンタルクリニックの新着情報です。休診日のお知らせや当院からの重要なお知らせをご紹介します。',
    }
  )
}

// ---- お知らせ一覧 ----
app.get('/news', async (c) => {
  return renderNewsList(c, c.env, { page: 1, basePath: '/news' })
})

app.get('/news/page/:page', async (c) => {
  const page = parseInt(c.req.param('page'), 10) || 1
  return renderNewsList(c, c.env, { page, basePath: '/news' })
})

// ---- お知らせ 年別アーカイブ ----
app.get('/news/date/:year', async (c) => {
  const year = parseInt(c.req.param('year'), 10)
  return renderNewsList(c, c.env, { year, page: 1, basePath: `/news/date/${year}` })
})

app.get('/news/date/:year/page/:page', async (c) => {
  const year = parseInt(c.req.param('year'), 10)
  const page = parseInt(c.req.param('page'), 10) || 1
  return renderNewsList(c, c.env, { year, page, basePath: `/news/date/${year}` })
})

// ---- お知らせ詳細 ----
app.get('/news/:id', async (c) => {
  const { env } = c
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.notFound()
  }

  let item: NewsDetailItem | null = null
  let prev: { id: number; title: string } | null = null
  let next: { id: number; title: string } | null = null

  try {
    item = await env.DB.prepare(
      'SELECT id, title, body, published_at FROM news WHERE id = ? AND is_published = 1'
    )
      .bind(id)
      .first<NewsDetailItem>()

    if (item) {
      // 一つ新しい記事（次へ）・一つ古い記事（前へ）を取得
      next = await env.DB.prepare(
        'SELECT id, title FROM news WHERE is_published = 1 AND (published_at > ? OR (published_at = ? AND id > ?)) ORDER BY published_at ASC, id ASC LIMIT 1'
      )
        .bind(item.published_at, item.published_at, item.id)
        .first<{ id: number; title: string }>()

      prev = await env.DB.prepare(
        'SELECT id, title FROM news WHERE is_published = 1 AND (published_at < ? OR (published_at = ? AND id < ?)) ORDER BY published_at DESC, id DESC LIMIT 1'
      )
        .bind(item.published_at, item.published_at, item.id)
        .first<{ id: number; title: string }>()
    }
  } catch (e) {
    // no-op
  }

  if (!item) {
    return c.render(
      <>
        <Header />
        <main id="top">
          <div class="container container-sm section_pdg" style="text-align:center;">
            <h1 class="section-title-lg">記事が見つかりません</h1>
            <p style="margin-bottom:32px;">お探しのお知らせは存在しないか、削除された可能性があります。</p>
            <a href="/news" class="btn btn-primary">
              <i class="fa-solid fa-arrow-left"></i>
              <span>新着情報一覧へ</span>
            </a>
          </div>
        </main>
        <AccessSection />
        <Footer />
        <a href="#top" id="page-top" aria-label="ページトップへ戻る">
          <i class="fa-solid fa-arrow-up"></i>
        </a>
      </>,
      { title: '記事が見つかりません' }
    )
  }

  return c.render(
    <>
      <Header />
      <main id="top">
        <NewsDetailPage item={item} prev={prev} next={next} />
      </main>
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    { title: item.title }
  )
})

// ============================================================
// ブログ (Blog) - 投稿型ページ（カテゴリ・月別アーカイブ対応）
// ============================================================
const BLOG_PAGE_SIZE = 6

async function renderBlogList(
  c: any,
  env: Bindings,
  opts: { category?: string; ym?: string; page: number; basePath: string; headingLabel?: string }
) {
  const { category, ym, page, basePath, headingLabel } = opts
  const offset = (page - 1) * BLOG_PAGE_SIZE

  let whereClause = 'WHERE is_published = 1'
  const bindArgs: (string | number)[] = []
  if (category) {
    whereClause += ' AND category = ?'
    bindArgs.push(category)
  }
  if (ym) {
    whereClause += " AND substr(published_at,1,7) = ?"
    bindArgs.push(ym)
  }

  let items: BlogListItem[] = []
  let totalCount = 0
  let categories: { category: string; count: number }[] = []
  let archiveMonths: { ym: string; count: number }[] = []

  try {
    const countRes = await env.DB.prepare(`SELECT COUNT(*) as cnt FROM blog_posts ${whereClause}`)
      .bind(...bindArgs)
      .first<{ cnt: number }>()
    totalCount = countRes?.cnt || 0

    const listRes = await env.DB.prepare(
      `SELECT id, title, category, thumbnail_url, published_at FROM blog_posts ${whereClause} ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?`
    )
      .bind(...bindArgs, BLOG_PAGE_SIZE, offset)
      .all<BlogListItem>()
    items = listRes.results

    const catRes = await env.DB.prepare(
      "SELECT category, COUNT(*) as count FROM blog_posts WHERE is_published = 1 AND category IS NOT NULL AND category != '' GROUP BY category ORDER BY category ASC"
    ).all<{ category: string; count: number }>()
    categories = catRes.results

    const archRes = await env.DB.prepare(
      "SELECT substr(published_at,1,7) as ym, COUNT(*) as count FROM blog_posts WHERE is_published = 1 GROUP BY ym ORDER BY ym DESC"
    ).all<{ ym: string; count: number }>()
    archiveMonths = archRes.results
  } catch (e) {
    // DB未初期化時は空表示
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / BLOG_PAGE_SIZE))

  return c.render(
    <>
      <Header />
      <main id="top">
        <BlogListPage
          items={items}
          categories={categories}
          archiveMonths={archiveMonths}
          currentCategory={category}
          currentPage={page}
          totalPages={totalPages}
          basePath={basePath}
          headingLabel={headingLabel}
        />
      </main>
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    {
      title: headingLabel ? `ブログ - ${headingLabel}` : 'ブログ',
      description:
        '金沢市の歯科医院メディカデンタルクリニックのブログです。虫歯・矯正・インプラント治療など歯に関するさまざまな知識をご紹介します。',
    }
  )
}

// ---- ブログ一覧 ----
app.get('/blog', async (c) => {
  return renderBlogList(c, c.env, { page: 1, basePath: '/blog' })
})

app.get('/blog/page/:page', async (c) => {
  const page = parseInt(c.req.param('page'), 10) || 1
  return renderBlogList(c, c.env, { page, basePath: '/blog' })
})

// ---- ブログ カテゴリ別 ----
app.get('/blog/category/:cat', async (c) => {
  const category = decodeURIComponent(c.req.param('cat'))
  return renderBlogList(c, c.env, {
    category,
    page: 1,
    basePath: `/blog/category/${encodeURIComponent(category)}`,
    headingLabel: `カテゴリ：${category}`,
  })
})

app.get('/blog/category/:cat/page/:page', async (c) => {
  const category = decodeURIComponent(c.req.param('cat'))
  const page = parseInt(c.req.param('page'), 10) || 1
  return renderBlogList(c, c.env, {
    category,
    page,
    basePath: `/blog/category/${encodeURIComponent(category)}`,
    headingLabel: `カテゴリ：${category}`,
  })
})

// ---- ブログ 月別アーカイブ ----
app.get('/blog/archive/:ym', async (c) => {
  const ym = c.req.param('ym') // 'YYYY-MM'
  const [y, m] = ym.split('-')
  return renderBlogList(c, c.env, {
    ym,
    page: 1,
    basePath: `/blog/archive/${ym}`,
    headingLabel: `${y}年${parseInt(m, 10)}月の記事`,
  })
})

app.get('/blog/archive/:ym/page/:page', async (c) => {
  const ym = c.req.param('ym')
  const [y, m] = ym.split('-')
  const page = parseInt(c.req.param('page'), 10) || 1
  return renderBlogList(c, c.env, {
    ym,
    page,
    basePath: `/blog/archive/${ym}`,
    headingLabel: `${y}年${parseInt(m, 10)}月の記事`,
  })
})

// ---- ブログ詳細 ----
app.get('/blog/:id', async (c) => {
  const { env } = c
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.notFound()
  }

  let item: BlogDetailItem | null = null
  let prev: { id: number; title: string } | null = null
  let next: { id: number; title: string } | null = null

  try {
    item = await env.DB.prepare(
      'SELECT id, title, body, category, thumbnail_url, published_at FROM blog_posts WHERE id = ? AND is_published = 1'
    )
      .bind(id)
      .first<BlogDetailItem>()

    if (item) {
      next = await env.DB.prepare(
        'SELECT id, title FROM blog_posts WHERE is_published = 1 AND (published_at > ? OR (published_at = ? AND id > ?)) ORDER BY published_at ASC, id ASC LIMIT 1'
      )
        .bind(item.published_at, item.published_at, item.id)
        .first<{ id: number; title: string }>()

      prev = await env.DB.prepare(
        'SELECT id, title FROM blog_posts WHERE is_published = 1 AND (published_at < ? OR (published_at = ? AND id < ?)) ORDER BY published_at DESC, id DESC LIMIT 1'
      )
        .bind(item.published_at, item.published_at, item.id)
        .first<{ id: number; title: string }>()
    }
  } catch (e) {
    // no-op
  }

  if (!item) {
    return c.render(
      <>
        <Header />
        <main id="top">
          <div class="container container-sm section_pdg" style="text-align:center;">
            <h1 class="section-title-lg">記事が見つかりません</h1>
            <p style="margin-bottom:32px;">お探しのブログ記事は存在しないか、削除された可能性があります。</p>
            <a href="/blog" class="btn btn-primary">
              <i class="fa-solid fa-arrow-left"></i>
              <span>ブログ一覧へ</span>
            </a>
          </div>
        </main>
        <AccessSection />
        <Footer />
        <a href="#top" id="page-top" aria-label="ページトップへ戻る">
          <i class="fa-solid fa-arrow-up"></i>
        </a>
      </>,
      { title: '記事が見つかりません' }
    )
  }

  return c.render(
    <>
      <Header />
      <main id="top">
        <BlogDetailPage item={item} prev={prev} next={next} />
      </main>
      <AccessSection />
      <Footer />
      <a href="#top" id="page-top" aria-label="ページトップへ戻る">
        <i class="fa-solid fa-arrow-up"></i>
      </a>
    </>,
    { title: item.title }
  )
})

export default app
