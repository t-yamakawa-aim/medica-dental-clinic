import { SITE } from '../data/site'

export const CalendarSection = () => {
  const calendarId = SITE.googleCalendarId
  const embedSrc = calendarId
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=Asia%2FTokyo&mode=MONTH&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0`
    : ''

  return (
    <section id="calendar" class="section calendar-section">
      <div class="container container-sm">
        <h2 class="section-title">
          <span class="section-title__en">CALENDAR</span>
          <span class="section-title__ja">診療カレンダー</span>
        </h2>

        <div class="calendar-embed">
          {calendarId ? (
            <iframe
              src={embedSrc}
              class="calendar-embed__iframe"
              title="診療カレンダー"
              loading="lazy"
            ></iframe>
          ) : (
            <div class="calendar-embed__placeholder">
              <i class="fa-regular fa-calendar-days"></i>
              <p>
                Googleカレンダーは準備中です。<br />
                最新の休診情報は「お知らせ」をご確認ください。
              </p>
            </div>
          )}
        </div>

        <div class="calendar-grid">
          <div class="calendar-card">
            <h3 class="calendar-card__title">休診日について</h3>
            <p class="calendar-card__note">
              休診日: 木曜・日曜・祝日<br />
              臨時休診等の最新情報は「お知らせ」をご確認ください。
            </p>
          </div>
          <div class="calendar-card">
            <h3 class="calendar-card__title">診療時間</h3>
            <ul class="calendar-card__hours">
              <li><span>月・火・水・金</span>9:00-12:30 / 14:00-18:30</li>
              <li><span>土曜</span>9:00-12:30 / 14:00-17:00</li>
              <li><span>木・日・祝</span>休診</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
