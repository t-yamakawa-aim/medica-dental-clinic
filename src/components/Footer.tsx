import { SITE } from '../data/site'

export const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer class="site-footer">
      <div class="site-footer__inner">
        <p class="site-footer__name">{SITE.name}</p>
        <p class="site-footer__address">
          {SITE.addressFull}
        </p>
        <p class="site-footer__tel">
          <a href={SITE.phoneHref}>{SITE.phone}</a>
        </p>
        <p class="site-footer__link">
          <a href={SITE.websiteUrl}>クリニックサイトのトップページへ戻る</a>
        </p>
        <p class="site-footer__copyright">&copy;{year} {SITE.name}</p>
      </div>
    </footer>
  )
}
