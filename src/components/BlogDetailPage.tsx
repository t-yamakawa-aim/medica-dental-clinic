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

const LINK_LINE_RE = /^\[([^\]]*)\]\(([^)]+)\)(?:\{(button|link)\})?$/

const renderBodyLine = (line: string) => {
  const imgMatch = line.match(IMAGE_LINE_RE)
  if (imgMatch) {
    const [, alt, src] = imgMatch
    return (
      <figure class="blog-detail-page__figure">
        <img src={src} alt={alt || ''} loading="lazy" />
        {alt && <figcaption>{alt}</figcaption>}
      </figure>
    )
  }

  const linkMatch = line.match(LINK_LINE_RE)
  if (linkMatch) {
    const [, label, href, style] = linkMatch
    if (style === 'button') {
      return (
        <p class="blog-detail-page__btn-wrap">
          <a href={href} class="btn btn-primary" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
            {label}
          </a>
        </p>
      )
    }
    return (
      <p>
        <a href={href} class="blog-detail-page__link" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
          {label}
        </a>
      </p>
    )
  }

  return line ? <p>{line}</p> : <br />
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
            {(item.body || '').split('\n').map((line) => renderBodyLine(line))}
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
