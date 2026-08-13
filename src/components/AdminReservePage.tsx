import { AdminNav } from './AdminLayout'

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
          <AdminNav active="reserve" />
          <header class="admin-reserve__header">
            <h1><i class="fa-regular fa-calendar-check"></i> Web予約枠管理</h1>
            <p class="admin-reserve__note">コースごとに予約枠を登録できます（開始時刻は15分間隔で登録できます）</p>
          </header>

          <main class="admin-reserve__main">
            {/* ---- コース設定パネル ---- */}
            <section class="admin-reserve__panel admin-reserve__panel--settings">
              <h2 class="admin-reserve__panel-title"><i class="fa-solid fa-sliders"></i> コース設定（所要時間）</h2>
              <div id="admin-course-settings-list" class="admin-course-settings">
                <p class="admin-reserve__loading">読み込み中...</p>
              </div>
            </section>

            {/* ---- 歯科衛生士（スタッフ）管理パネル ---- */}
            <section class="admin-reserve__panel admin-reserve__panel--staff">
              <h2 class="admin-reserve__panel-title"><i class="fa-solid fa-user-nurse"></i> 担当スタッフ（歯科衛生士）管理</h2>
              <div id="admin-hygienists-list" class="admin-hygienists">
                <p class="admin-reserve__loading">読み込み中...</p>
              </div>
              <div class="admin-hygienists__add-form">
                <input type="text" id="admin-new-hygienist-name" placeholder="スタッフ名（例：佐藤 花子）" />
                <button type="button" id="admin-add-hygienist-btn" class="btn btn-secondary btn-sm">
                  <i class="fa-solid fa-plus"></i> 追加
                </button>
                <span id="admin-hygienist-msg" class="admin-reserve__msg"></span>
              </div>
            </section>

            {/* ---- スタッフの休み管理パネル（日付・時間帯単位） ---- */}
            <section class="admin-reserve__panel admin-reserve__panel--timeoff">
              <h2 class="admin-reserve__panel-title"><i class="fa-solid fa-calendar-xmark"></i> スタッフの休み管理</h2>
              <p class="admin-reserve__note">
                有給休暇や午後から出勤など、日付・時間帯単位でお休みを登録できます。終日休みの場合は「開始・終了時刻」を空欄のままにしてください。
              </p>

              <div class="admin-timeoff__add-form">
                <div class="admin-timeoff__field">
                  <label for="admin-timeoff-hygienist">スタッフ</label>
                  <select id="admin-timeoff-hygienist"></select>
                </div>
                <div class="admin-timeoff__field">
                  <label for="admin-timeoff-date">日付</label>
                  <input type="date" id="admin-timeoff-date" />
                </div>
                <div class="admin-timeoff__field admin-timeoff__field--checkbox">
                  <label>
                    <input type="checkbox" id="admin-timeoff-allday" checked />
                    終日休み
                  </label>
                </div>
                <div id="admin-timeoff-time-range" class="admin-timeoff__field admin-timeoff__field--range" style="display:none;">
                  <label>時間帯</label>
                  <span class="admin-timeoff__range-inputs">
                    <input type="time" id="admin-timeoff-start" step="900" value="10:00" />
                    <span>〜</span>
                    <input type="time" id="admin-timeoff-end" step="900" value="12:00" />
                  </span>
                </div>
                <div class="admin-timeoff__field">
                  <label for="admin-timeoff-reason">理由（任意）</label>
                  <input type="text" id="admin-timeoff-reason" placeholder="例：有給休暇、通院 など" />
                </div>
                <button type="button" id="admin-timeoff-add-btn" class="btn btn-secondary btn-sm">
                  <i class="fa-solid fa-plus"></i> 休みを追加
                </button>
                <span id="admin-timeoff-msg" class="admin-reserve__msg"></span>
              </div>

              <div id="admin-timeoff-list" class="admin-timeoff__list">
                <p class="admin-reserve__loading">読み込み中...</p>
              </div>
            </section>

            {/* ---- 予約枠管理パネル ---- */}
            <section class="admin-reserve__panel">
              <div class="admin-reserve__course-select">
                <label for="admin-course-select">コース</label>
                <select id="admin-course-select"></select>
                <span id="admin-course-hygienist-wrap" class="admin-reserve__hygienist-wrap" style="display:none;">
                  <label for="admin-course-hygienist">担当スタッフ</label>
                  <select id="admin-course-hygienist"></select>
                </span>
              </div>

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
                  <i class="fa-solid fa-layer-group"></i> コースの所要時間ごとに一括追加
                </button>
              </div>

              <div id="admin-slots-list" class="admin-reserve__slots">
                <p class="admin-reserve__loading">読み込み中...</p>
              </div>
            </section>
          </main>
        </div>

        {/* ---- 受付予約登録モーダル（2回目以降の方などをスタッフが直接登録） ---- */}
        <div id="admin-book-modal" class="admin-book-modal" style="display:none;">
          <div class="admin-book-modal__overlay" id="admin-book-modal-overlay"></div>
          <div class="admin-book-modal__box">
            <h3 class="admin-book-modal__title"><i class="fa-solid fa-user-plus"></i> 受付での予約登録</h3>
            <p class="admin-book-modal__slot-info" id="admin-book-modal-slot-info"></p>

            <form id="admin-book-form" class="admin-book-form">
              <div class="admin-book-form__group">
                <label>お名前 <span class="admin-book-form__req">必須</span></label>
                <input type="text" id="admin-book-name" placeholder="山田 太郎" required />
              </div>
              <div class="admin-book-form__group">
                <label>フリガナ</label>
                <input type="text" id="admin-book-kana" placeholder="ヤマダ タロウ" />
              </div>
              <div class="admin-book-form__group">
                <label>電話番号 <span class="admin-book-form__req">必須</span></label>
                <input type="tel" id="admin-book-phone" placeholder="09012345678" required />
              </div>
              <div class="admin-book-form__group">
                <label>メールアドレス</label>
                <input type="email" id="admin-book-email" placeholder="example@example.com" />
              </div>
              <div class="admin-book-form__group">
                <label>生年月日</label>
                <input type="date" id="admin-book-birth" />
              </div>
              <div class="admin-book-form__group">
                <label>症状・ご相談内容</label>
                <input type="text" id="admin-book-symptom" placeholder="例：歯が痛い、詰め物が取れた など" />
              </div>
              <div class="admin-book-form__group">
                <label>備考</label>
                <textarea id="admin-book-message" rows={3}></textarea>
              </div>
              <div id="admin-book-form-error" class="admin-book-form__error" style="display:none;"></div>
              <div class="admin-book-form__actions">
                <button type="button" id="admin-book-cancel-btn" class="btn btn-outline btn-sm">キャンセル</button>
                <button type="submit" id="admin-book-submit-btn" class="btn btn-primary btn-sm">
                  <i class="fa-regular fa-calendar-check"></i> この内容で登録する
                </button>
              </div>
            </form>
          </div>
        </div>

        <script src="/static/admin-reserve.js"></script>
      </body>
    </html>
  )
}
