import { SITE, NAV_ITEMS } from '../data/site'

export const Header = () => {
  return (
    <>
      <header class="site-header" id="site-header">
        <div class="site-header__inner">
          <h1 class="site-header__logo">
            <a href="/">
              <img src="/static/images/logo.png" alt={SITE.name} width="220" height="60" />
            </a>
          </h1>

          <button class="gnav-btn" id="gnav-btn" aria-label="メニューを開く">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="gnav" id="gnav">
            <ul class="gnav__menu">
              {NAV_ITEMS.map((item) => (
                <li class="gnav__item">
                  <a href={item.href} class="gnav__link">
                    {item.label}
                  </a>
                  {item.children && (
                    <ul class="gnav__sub">
                      {item.children.map((child) => (
                        <li>
                          <a href={child.href}>{child.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div class="gnav__cta">
              <a href={SITE.phoneHref} class="gnav__tel">
                <span class="gnav__tel-num">
                  <i class="fa-solid fa-phone-volume"></i>
                  TEL.{SITE.phone}
                </span>
                <span class="gnav__tel-hours">［受付時間］ {SITE.receptionHours}</span>
              </a>
              <a href="/reserve" class="btn btn-reserve">
                <i class="fa-regular fa-calendar-check"></i>
                <span>Web予約・お問い合わせ</span>
              </a>
            </div>
          </nav>
        </div>
      </header>
      <div class="gnav-overlay" id="gnav-overlay"></div>

      {/* スマホ用 固定フッターナビ */}
      <nav class="sp-fixed-nav">
        <a href="/reserve" class="sp-fixed-nav__item sp-fixed-nav__item--cta">
          <i class="fa-regular fa-calendar-check"></i>
          <span>Web予約</span>
        </a>
        <a href={SITE.phoneHref} class="sp-fixed-nav__item">
          <i class="fa-solid fa-phone"></i>
          <span>電話する</span>
        </a>
        <a href="#access" class="sp-fixed-nav__item">
          <i class="fa-solid fa-location-dot"></i>
          <span>アクセス</span>
        </a>
      </nav>
    </>
  )
}
