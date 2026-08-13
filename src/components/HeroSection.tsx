import { SITE, SCHEDULE } from '../data/site'

const DAY_LABELS: { key: keyof typeof SCHEDULE[0]['days']; label: string }[] = [
  { key: 'mon', label: '月' },
  { key: 'tue', label: '火' },
  { key: 'wed', label: '水' },
  { key: 'thu', label: '木' },
  { key: 'fri', label: '金' },
  { key: 'sat', label: '土' },
  { key: 'sun', label: '日・祝' },
]

export const ScheduleTable = () => {
  return (
    <table class="schedule-table">
      <thead>
        <tr>
          <th>診療時間</th>
          {DAY_LABELS.map((d) => (
            <th>{d.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {SCHEDULE.map((row) => (
          <tr>
            <th>
              {row.time}
              {row.note && (
                <>
                  <br />
                  <small>{row.note}</small>
                </>
              )}
            </th>
            {DAY_LABELS.map((d) => (
              <td>{row.days[d.key] ? '○' : '-'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const HeroSection = () => {
  return (
    <div class="hero">
      <div class="hero__slides">
        <div class="hero__slide">
          <img src="/static/images/hero-01.jpg" alt={SITE.name} class="hero__img" />
        </div>
        <div class="hero__slide">
          <img src="/static/images/facility-02.jpg" alt={SITE.name} class="hero__img" />
        </div>
        <div class="hero__slide">
          <img src="/static/images/exterior.jpg" alt={SITE.name} class="hero__img" />
        </div>
      </div>

      <div class="hero__catch">
        <p>
          確かな診察・説明・治療から、
          <br />
          導きだせる「答え」があります。
          <br />
          <span>金沢市の歯科の"総合医"が<br />あなたのお口の悩みに向き合います</span>
        </p>
      </div>

      <section class="hero__hours" id="hero-hours">
        <div class="hero__hours-inner">
          <h2 class="hero__hours-title">
            <i class="fa-regular fa-clock"></i>診療時間
          </h2>
          <ScheduleTable />
          <p class="hero__hours-note">
            時間は変更の可能性があります。最新情報は診療カレンダーをご覧ください。
          </p>
          <p class="hero__hours-contact">
            <i class="fa-solid fa-phone"></i> 電話予約: {SITE.phone}　
            <a href="/contact" class="underline-link">
              Web予約 <i class="fa-solid fa-arrow-up-right-from-square fa-xs"></i>
            </a>
          </p>
          <p class="hero__hours-contact">
            <i class="fa-solid fa-location-dot"></i>{' '}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${SITE.mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              class="underline-link"
            >
              {SITE.addressFull}
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
