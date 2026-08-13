import { PageHeader } from './PageHeader'

export type BlogDetailItem = {
  id: number
  title: string
  body: string | null
  category: string | null
  published_at: string
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
          <div class="news-detail-page__body">
            {(item.body || '').split('\n').map((line) => (line ? <p>{line}</p> : <br />))}
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
