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
import { getSymptomDetail } from './data/symptomDetails'

export type Bindings = {
  DB: D1Database
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
