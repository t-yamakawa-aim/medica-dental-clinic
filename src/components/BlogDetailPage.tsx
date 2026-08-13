import { PageHeader } from './PageHeader'

export type BlogDetailItem = {
  id: number
  title: string
  body: string | null
  category: string | null
  published_at: string
  thumbnail_url: string | null
}

// 本文中に ![説明文](画像URL) と書くと、その位置に横長サイズの写真を挿入できる。
// それ以外の行は通常の段落として表示する。
const IMAGE_LINE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/

const renderBodyLine = (line: string, key: number) => {
  const match = line.match(IMAGE_LINE_RE)
  if (match) {
    const [, alt, src] = match
    return (
      <figure class="blog-detail-page__figure" key={key}>
        <img src={src} alt={alt || ''} loading="lazy" />
        {alt && <figcaption>{alt}</figcaption>}
      </figure>
    )
  }
  return line ? <p key={key}>{line}</p> : <br key={key} />
}

type Props = {
  item: BlogDetailItem
  prev: { id: number; title: string } | null
  next: { id: number; title: string } | null
}

const formatDate = (dateStr: string) => dateStr.replaceAll('-', '.')

export const BlogDetailPage = ({ item, prev, next }: Props) => {
  return (
    <>
      <PageHeader
        titleJa="ブログ"
        titleEn="blog"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: 'ブログ', href: '/blog' }, { label: item.title }]}
      />

      <div class="container container-sm section_pdg blog-detail-page">
        <article>
          {item.category && (
            <a href={`/blog/category/${encodeURIComponent(item.category)}`} class="blog-card__cat">
              {item.category}
            </a>
          )}
          <p class="news-detail-page__date">{formatDate(item.published_at)}</p>
          <h1 class="news-detail-page__title">{item.title}</h1>

          {item.thumbnail_url && (
            <figure class="blog-detail-page__eyecatch">
              <img src={item.thumbnail_url} alt={item.title} />
            </figure>
          )}

          <div class="news-detail-page__body">
            {(item.body || '').split('\n').map((line, i) => renderBodyLine(line, i))}
          </div>
        </article>

        <nav class="news-detail-page__pager">
          <div class="news-detail-page__pager-item">
            {prev && (
              <a href={`/blog/${prev.id}`} class="news-detail-page__pager-link news-detail-page__pager-link--prev">
                <i class="fa-solid fa-angle-left"></i>
                <span>{prev.title}</span>
              </a>
            )}
          </div>
          <div class="news-detail-page__pager-item">
            {next && (
              <a href={`/blog/${next.id}`} class="news-detail-page__pager-link news-detail-page__pager-link--next">
                <span>{next.title}</span>
                <i class="fa-solid fa-angle-right"></i>
              </a>
            )}
          </div>
        </nav>

        <div class="news-detail-page__back">
          <a href="/blog" class="btn btn-outline">
            <i class="fa-solid fa-arrow-left"></i>
            <span>ブログ一覧へ</span>
          </a>
        </div>
      </div>
    </>
  )
}
