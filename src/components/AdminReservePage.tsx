export const AdminReservePage = () => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>予約枠管理｜メディカデンタルクリニック</title>
        <meta name="robots" content="noindex, nofollow" />
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>
        <div class="admin-reserve">
          <header class="admin-reserve__header">
            <h1><i class="fa-regular fa-calendar-check"></i> Web予約枠管理</h1>
            <p class="admin-reserve__note">初診専用・1時間枠（開始時刻は15分間隔で登録できます）</p>
          </header>

          <main class="admin-reserve__main">
            <section class="admin-reserve__panel">
              <div class="admin-reserve__date-nav">
                <button type="button" id="admin-date-prev" class="admin-reserve__nav-btn" aria-label="前の日">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                <input type="date" id="admin-date-input" class="admin-reserve__date-input" />
                <button type="button" id="admin-date-next" class="admin-reserve__nav-btn" aria-label="次の日">
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
                <button type="button" id="admin-date-today" class="admin-reserve__today-btn">今日</button>
              </div>

              <div class="admin-reserve__add-form">
                <label for="admin-new-slot-time">枠を追加（開始時刻・15分間隔）</label>
                <input type="time" id="admin-new-slot-time" step="900" value="09:00" />
                <button type="button" id="admin-add-slot-btn" class="btn btn-primary btn-sm">
                  <i class="fa-solid fa-plus"></i> 追加
                </button>
                <span id="admin-add-slot-msg" class="admin-reserve__msg"></span>
              </div>

              <div class="admin-reserve__bulk-form">
                <span>一括追加：</span>
                <input type="time" id="admin-bulk-start" step="900" value="09:00" />
                <span>〜</span>
                <input type="time" id="admin-bulk-end" step="900" value="18:00" />
                <button type="button" id="admin-bulk-add-btn" class="btn btn-secondary btn-sm">
                  <i class="fa-solid fa-layer-group"></i> 1時間ごとに一括追加
                </button>
              </div>

              <div id="admin-slots-list" class="admin-reserve__slots">
                <p class="admin-reserve__loading">読み込み中...</p>
              </div>
            </section>
          </main>
        </div>

        <script src="/static/admin-reserve.js"></script>
      </body>
    </html>
  )
}
