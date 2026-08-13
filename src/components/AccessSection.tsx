import { SITE } from '../data/site'

export const AccessSection = () => {
  return (
    <section id="access" class="section access-section">
      <div class="container">
        <h2 class="section-title">
          <span class="section-title__en">ACCESS</span>
          <span class="section-title__ja">アクセス</span>
        </h2>

        <p class="access-address">
          <i class="fa-solid fa-location-dot"></i> {SITE.addressFull}{' '}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${SITE.mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            class="underline-link"
          >
            Googleマップ
          </a>
        </p>

        <div class="access-grid">
          <div class="access-map">
            <iframe
              src={`https://maps.google.com/maps?q=${SITE.mapQuery}&z=16&output=embed`}
              width="100%"
              height="380"
              style="border:0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div class="access-info">
            <div class="access-info__block">
              <h3>お車でお越しの場合</h3>
              <p>専用駐車場をご用意しております。<br />お気軽にお車でお越しください。</p>
            </div>
            <div class="access-info__block">
              <h3>診療時間・電話番号</h3>
              <p>
                <i class="fa-solid fa-phone"></i>{' '}
                <a href={SITE.phoneHref} class="underline-link">
                  {SITE.phone}
                </a>
                <br />
                ［受付時間］{SITE.receptionHours}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
