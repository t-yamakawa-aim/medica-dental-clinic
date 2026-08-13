import { PageHeader } from './PageHeader'

export type BlogListItem = {
  id: number
  title: string
  category: string | null
  published_at: string
  thumbnail_url: string | null
}

type CategoryCount = { category: string; count: number }
type ArchiveMonth = { ym: string; count: number } // ym: 'YYYY-MM'

type Props = {
  items: BlogListItem[]
  categories: CategoryCount[]
  archiveMonths: ArchiveMonth[]
  currentCategory?: string
  currentPage: number
  totalPages: number
  basePath: string // '/blog' | '/blog/category/xxx' | '/blog/archive/2026-07'
  headingLabel?: string // カテゴリ/アーカイブ絞り込み時の見出し
}

const formatDate = (dateStr: string) => dateStr.replaceAll('-', '.')

const pageHref = (basePath: string, page: number) => {
  if (page <= 1) return basePath || '/blog'
  return `${basePath || '/blog'}/page/${page}`
}

const formatYm = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m, 10)}月`
}

export const BlogListPage = ({
  items,
  categories,
  archiveMonths,
  currentCategory,
  currentPage,
  totalPages,
  basePath,
  headingLabel,
}: Props) => {
  return (
    <>
      <PageHeader
        titleJa="ブログ"
        titleEn="blog"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: 'ブログ' }]}
      />

      <div class="container section_pdg blog-archive-layout">
        <main class="blog-archive-main">
          {headingLabel && <h2 class="blog-archive-main__heading">{headingLabel}</h2>}

          {items.length === 0 && <p class="txt-ctr news-empty">準備中です。</p>}

          <div class="blog-archive-list">
            {items.map((item) => (
              <article class="blog-archive-item">
                <a href={`/blog/${item.id}`} class="blog-archive-item__link">
                  <div class="blog-archive-item__thumb">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} loading="lazy" />
                    ) : (
                      <i class="fa-solid fa-tooth"></i>
                    )}
                  </div>
                  <div class="blog-archive-item__body">
                    {item.category && <span class="blog-card__cat">{item.category}</span>}
                    <p class="blog-card__date">{formatDate(item.published_at)}</p>
                    <h2 class="blog-archive-item__title">{item.title}</h2>
                  </div>
                </a>
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
                    <a
                      class="pagenavi__link pagenavi__next"
                      href={pageHref(basePath, currentPage + 1)}
                      aria-label="次のページ"
                    >
                      <i class="fa-solid fa-angle-right"></i>
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          )}
        </main>

        <aside class="blog-side">
          <section class="blog-side__section">
            <h2 class="blog-side__ttl">
              カテゴリ<small>CATEGORY</small>
            </h2>
            <ul class="blog-side__list">
              {categories.length === 0 && <li class="blog-side__none">カテゴリーなし</li>}
              {categories.map((c) => (
                <li>
                  <a href={`/blog/category/${encodeURIComponent(c.category)}`} class={currentCategory === c.category ? 'is-active' : ''}>
                    {c.category}
                    <span class="blog-side__count">({c.count})</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section class="blog-side__section">
            <h2 class="blog-side__ttl">
              過去記事<small>ARCHIVE</small>
            </h2>
            <ul class="blog-side__list">
              {archiveMonths.length === 0 && <li class="blog-side__none">記事はありません</li>}
              {archiveMonths.map((m) => (
                <li>
                  <a href={`/blog/archive/${m.ym}`}>
                    {formatYm(m.ym)}
                    <span class="blog-side__count">({m.count})</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  )
}
