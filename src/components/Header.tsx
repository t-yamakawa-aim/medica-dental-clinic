import { SITE } from '../data/site'

// Web予約システム専用のシンプルなヘッダー
export const Header = () => {
  return (
    <header class="site-header" id="site-header">
      <div class="site-header__inner">
        <a href="/reserve" class="site-header__brand">
          <img src="/static/images/logo.png" alt={SITE.name} class="site-header__logo-img" />
          <span class="site-header__sub">Web予約システム</span>
        </a>
        <nav class="site-header__nav">
          <a href={SITE.websiteUrl} class="site-header__nav-link">
            <i class="fa-solid fa-house"></i>
            <span>クリニックサイトへ</span>
          </a>
          <a href={SITE.phoneHref} class="site-header__tel">
            <i class="fa-solid fa-phone"></i>
            <span>{SITE.phone}</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
