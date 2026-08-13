import { PageHeader } from './PageHeader'

export type NewsListItem = {
  id: number
  title: string
  published_at: string
}

type Props = {
  items: NewsListItem[]
  years: number[]
  currentYear?: number
  currentPage: number
  totalPages: number
  basePath: string // '/news' または '/news/date/2025'
}

const formatDate = (dateStr: string) => dateStr.replaceAll('-', '.')

// ページネーションリンクのURLを組み立てる（1ページ目は /news または /news/date/2025、2ページ目以降は /page/2 を付与）
const pageHref = (basePath: string, page: number) => {
  if (page <= 1) return basePath === '' ? '/news' : basePath
  return `${basePath || '/news'}/page/${page}`
}

export const NewsListPage = ({ items, years, currentYear, currentPage, totalPages, basePath }: Props) => {
  return (
    <>
      <PageHeader
        titleJa="新着情報"
        titleEn="news"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: '新着情報' }]}
      />

      <div class="container container-sm section_pdg news-archive-page">
        <div class="archive-filter">
          <span class="archive-filter__label">年で絞る</span>
          <div class="archive-filter__select-wrap">
            <select
              class="archive-filter__select"
              onchange="if(this.value)location.href=this.value"
            >
              <option value="/news" selected={!currentYear}>
                ALL
              </option>
              {years.map((y) => (
                <option value={`/news/date/${y}`} selected={currentYear === y}>
                  {y}年
                </option>
              ))}
            </select>
          </div>
        </div>

        <div class="news-list-page">
          {items.length === 0 && <p class="news-empty">お知らせはありません。</p>}
          {items.map((item) => (
            <article class="news-list-page__item">
              <p class="news-list-page__date">{formatDate(item.published_at)}</p>
              <h2 class="news-list-page__title">
                <a href={`/news/${item.id}`}>{item.title}</a>
              </h2>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <nav class="pagenavi" aria-label="ページネーション">
            <span class="pagenavi__pages">
              {currentPage} / {totalPages}
            </span>
            <ul class="pagenavi__list">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li>
                  {p === currentPage ? (
                    <span class="pagenavi__link is-current" aria-current="page">
                      {p}
                    </span>
                  ) : (
                    <a class="pagenavi__link" href={pageHref(basePath, p)}>
                      {p}
                    </a>
                  )}
                </li>
              ))}
              {currentPage < totalPages && (
                <li>
                  <a class="pagenavi__link pagenavi__next" href={pageHref(basePath, currentPage + 1)} aria-label="次のページ">
                    <i class="fa-solid fa-angle-right"></i>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </>
  )
}
