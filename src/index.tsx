import { Hono } from 'hono'
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

export type Bindings = {
  DB: D1Database
  RESEND_API_KEY?: string
  RECRUIT_NOTIFY_EMAIL?: string
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
      'SELECT id, title, category, published_at FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT 4'
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

// ---- Top page ----
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
      'SELECT id, title, category, published_at FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT 4'
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

export default app
