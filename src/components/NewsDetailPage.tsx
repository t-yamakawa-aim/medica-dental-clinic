import { PageHeader } from './PageHeader'

export type NewsDetailItem = {
  id: number
  title: string
  body: string | null
  published_at: string
}

type Props = {
  item: NewsDetailItem
  prev: { id: number; title: string } | null
  next: { id: number; title: string } | null
}

const formatDate = (dateStr: string) => dateStr.replaceAll('-', '.')

// 本文中に以下の記法を使うと、写真・リンク・ボタンを挿入できる。
//   ![説明文](画像URL)               → 横長サイズの写真
//   [ラベル](URL)                    → 通常のテキストリンク
//   [ラベル](URL){button}            → ボタン
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
    const isExternal = href.startsWith('http')
    if (style === 'button') {
      return (
        <p class="blog-detail-page__btn-wrap">
          <a href={href} class="btn btn-primary" target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
            {label}
          </a>
        </p>
      )
    }
    return (
      <p>
        <a href={href} class="blog-detail-page__link" target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
          {label}
        </a>
      </p>
    )
  }

  return line ? <p>{line}</p> : <br />
}

export const NewsDetailPage = ({ item, prev, next }: Props) => {
  return (
    <>
      <PageHeader
        titleJa="新着情報"
        titleEn="news"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: '新着情報', href: '/news' }, { label: item.title }]}
      />

      <div class="container container-sm section_pdg news-detail-page">
        <article>
          <p class="news-detail-page__date">{formatDate(item.published_at)}</p>
          <h1 class="news-detail-page__title">{item.title}</h1>
          <div class="news-detail-page__body">
            {(item.body || '').split('\n').map((line) => renderBodyLine(line))}
          </div>
        </article>

        <nav class="news-detail-page__pager">
          <div class="news-detail-page__pager-item">
            {prev && (
              <a href={`/news/${prev.id}`} class="news-detail-page__pager-link news-detail-page__pager-link--prev">
                <i class="fa-solid fa-angle-left"></i>
                <span>{prev.title}</span>
              </a>
            )}
          </div>
          <div class="news-detail-page__pager-item">
            {next && (
              <a href={`/news/${next.id}`} class="news-detail-page__pager-link news-detail-page__pager-link--next">
                <span>{next.title}</span>
                <i class="fa-solid fa-angle-right"></i>
              </a>
            )}
          </div>
        </nav>

        <div class="news-detail-page__back">
          <a href="/news" class="btn btn-outline">
            <i class="fa-solid fa-arrow-left"></i>
            <span>新着情報一覧へ</span>
          </a>
        </div>
      </div>
    </>
  )
}
