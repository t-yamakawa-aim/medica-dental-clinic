import { AdminNav } from './AdminLayout'

// スタッフ×時間帯の当日担当表。印刷してオフライン時にも使えるようにする。
export const AdminSchedulePage = () => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>当日担当表｜メディカデンタルクリニック</title>
        <meta name="robots" content="noindex, nofollow" />
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>
        <div class="admin-reserve" id="admin-schedule-root">
          <div class="admin-schedule__no-print">
            <AdminNav active="schedule" />
            <header class="admin-reserve__header">
              <h1><i class="fa-solid fa-table-list"></i> 当日担当表</h1>
              <p class="admin-reserve__note">
                スタッフ（歯科医師・歯科衛生士）ごとの担当患者を時間帯別に一覧できます。インターネットがつながらない場合に備えて、印刷して紙で保管することもできます。
              </p>
            </header>

            <div class="admin-schedule__toolbar">
              <div class="admin-schedule__date-nav">
                <button type="button" id="admin-schedule-prev" class="admin-reserve__nav-btn" aria-label="前の日">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                <input type="date" id="admin-schedule-date" class="admin-reserve__date-input" />
                <button type="button" id="admin-schedule-next" class="admin-reserve__nav-btn" aria-label="次の日">
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>
              <div class="admin-schedule__quick-btns">
                <button type="button" id="admin-schedule-today" class="btn btn-outline btn-sm">本日</button>
                <button type="button" id="admin-schedule-tomorrow" class="btn btn-outline btn-sm">翌日</button>
              </div>
              <button type="button" id="admin-schedule-print" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-print"></i> この担当表を印刷
              </button>
            </div>
          </div>

          <div class="admin-schedule__print-header">
            <h2 id="admin-schedule-print-title">当日担当表</h2>
          </div>

          <div id="admin-schedule-table-wrap" class="admin-schedule__table-wrap">
            <p class="admin-reserve__loading">読み込み中...</p>
          </div>
        </div>

        <script src="/static/admin-schedule.js"></script>
      </body>
    </html>
  )
}
