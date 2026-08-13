export type NewsItem = {
  id: number
  title: string
  published_at: string
}

export type BlogItem = {
  id: number
  title: string
  category: string | null
  published_at: string
  thumbnail_url: string | null
}

const formatDate = (dateStr: string) => {
  return dateStr.replaceAll('-', '.')
}

export const NewsSection = ({ items }: { items: NewsItem[] }) => {
  return (
    <section id="news" class="section news-section">
      <div class="container news-section__inner">
        <h2 class="section-title section-title--row">
          <span class="section-title__en">NEWS</span>
          <span class="section-title__ja">お知らせ</span>
        </h2>

        <div class="news-list">
          {items.length === 0 && <p class="news-empty">現在お知らせはありません。</p>}
          {items.map((item) => (
            <article class="news-item">
              <p class="news-item__date">{formatDate(item.published_at)}</p>
              <h3 class="news-item__title">
                <a href={`/news/${item.id}`}>{item.title}</a>
              </h3>
            </article>
          ))}
        </div>

        <div class="section-more">
          <a href="/news" class="btn btn-outline">
            お知らせ一覧を見る
          </a>
        </div>
      </div>
    </section>
  )
}

export const BlogSection = ({ items }: { items: BlogItem[] }) => {
  return (
    <section id="blog" class="section blog-section">
      <div class="container">
        <h2 class="section-title section-title--row">
          <span class="section-title__en">BLOG</span>
          <span class="section-title__ja">ブログ</span>
        </h2>

        <div class="blog-grid">
          {items.length === 0 && <p class="news-empty">現在ブログ記事はありません。</p>}
          {items.map((item) => (
            <article class="blog-card">
              <a href={`/blog/${item.id}`}>
                <div class="blog-card__thumb">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} loading="lazy" />
                  ) : (
                    <i class="fa-solid fa-tooth"></i>
                  )}
                </div>
                <div class="blog-card__body">
                  {item.category && <span class="blog-card__cat">{item.category}</span>}
                  <p class="blog-card__date">{formatDate(item.published_at)}</p>
                  <h3 class="blog-card__title">{item.title}</h3>
                </div>
              </a>
            </article>
          ))}
        </div>

        <div class="section-more">
          <a href="/blog" class="btn btn-outline">
            ブログ一覧を見る
          </a>
        </div>
      </div>
    </section>
  )
}
