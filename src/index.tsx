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

export default app
