import { SITE, FOOTER_NAV } from '../data/site'

export const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer class="site-footer">
      <div class="site-footer__top">
        <div class="container">
          <nav class="fnav">
            <ul>
              {FOOTER_NAV.map((item) => (
                <li>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div class="site-footer__bottom">
        <div class="container site-footer__bottom-inner">
          <p class="site-footer__copyright">&copy;{year} {SITE.name}</p>
        </div>
      </div>
    </footer>
  )
}
