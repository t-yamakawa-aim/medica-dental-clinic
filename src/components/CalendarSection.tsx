export const CalendarSection = () => {
  return (
    <section id="calendar" class="section calendar-section">
      <div class="container container-sm">
        <h2 class="section-title">
          <span class="section-title__en">CALENDAR</span>
          <span class="section-title__ja">診療カレンダー</span>
        </h2>

        <div class="calendar-grid">
          <div class="calendar-card">
            <h3 class="calendar-card__title">今月の診療日</h3>
            <div class="calendar-card__legend">
              <span><i class="fa-solid fa-circle-check"></i> 診療</span>
              <span><i class="fa-solid fa-circle-xmark"></i> 休診</span>
            </div>
            <p class="calendar-card__note">
              休診日: 木曜・日曜・祝日<br />
              最新の休診情報は「お知らせ」をご確認ください。
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
