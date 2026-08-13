export type Breadcrumb = {
  label: string
  href?: string // 最後の要素はhrefなし(現在ページ)
}

type Props = {
  titleJa: string
  titleEn: string
  breadcrumbs: Breadcrumb[]
  bgImage?: string
}

export const PageHeader = ({ titleJa, titleEn, breadcrumbs, bgImage = '/static/images/hero-01.jpg' }: Props) => {
  return (
    <>
      <div class="page-header" style={`background-image:url(${bgImage});`}>
        <div class="page-header__overlay"></div>
        <div class="container page-header__inner">
          <h1 class="page-header__title-ja">{titleJa}</h1>
          <span class="page-header__title-en">{titleEn}</span>
        </div>
      </div>
      <nav class="breadcrumbs" aria-label="breadcrumb">
        <div class="container">
          <ol class="breadcrumbs__list">
            {breadcrumbs.map((item, i) => (
              <li class="breadcrumbs__item">
                {item.href ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <i class="fa-solid fa-angle-right breadcrumbs__sep"></i>}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  )
}
