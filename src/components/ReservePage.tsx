import { PageHeader } from './PageHeader'
import { SITE } from '../data/site'

export const ReservePage = () => {
  return (
    <>
      <PageHeader
        titleJa="Web予約（初診専用）"
        titleEn="WEB RESERVE"
        breadcrumbs={[{ label: 'ホーム', href: SITE.websiteUrl }, { label: 'Web予約' }]}
      />

      <main class="reserve-page" id="top">
        <section class="container container-sm section_pdg reserve-section">
          <p class="reserve-section__lead">
            当院のWeb予約は<span class="service-attention">初診の方専用</span>のご予約受付です。
          </p>
          <p class="reserve-section__lead">
            通院中の方の次回ご予約や、急なお痛みなどでお急ぎの場合は、お電話（<a href={SITE.phoneHref} class="underline-link">{SITE.phone}</a>）にてご連絡ください。
          </p>
        </section>

        <section class="container container-sm section_pdg reserve-section">
          <div class="reserve-widget" id="reserve-widget" data-step="course">
            {/* STEP 0: コース選択 */}
            <div class="reserve-step" id="reserve-step-course">
              <h2 class="reserve-step__title"><span class="reserve-step__num">1</span>ご希望のコースを選択してください</h2>
              <div class="reserve-course-list" id="reserve-course-list">
                <p class="reserve-loading">読み込み中...</p>
              </div>
            </div>

            {/* STEP 1: 日付選択 */}
            <div class="reserve-step" id="reserve-step-date" style="display:none;">
              <h2 class="reserve-step__title"><span class="reserve-step__num">2</span>ご希望の日付を選択してください</h2>
              <p class="reserve-step__selected-date" id="reserve-selected-course"></p>
              <div class="reserve-calendar" id="reserve-calendar">
                <div class="reserve-calendar__header">
                  <button type="button" id="reserve-cal-prev" class="reserve-calendar__nav" aria-label="前の月">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <span class="reserve-calendar__month" id="reserve-cal-month">-</span>
                  <button type="button" id="reserve-cal-next" class="reserve-calendar__nav" aria-label="次の月">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
                <div class="reserve-calendar__weekdays">
                  <span>日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span>
                </div>
                <div class="reserve-calendar__days" id="reserve-cal-days"></div>
                <p class="reserve-calendar__legend">
                  <span class="reserve-calendar__legend-dot is-available"></span>予約可能
                  <span class="reserve-calendar__legend-dot is-none"></span>予約不可
                </p>
              </div>
              <button type="button" class="reserve-back-btn" data-back-to="course">
                <i class="fa-solid fa-arrow-left"></i>コース選択に戻る
              </button>
            </div>

            {/* STEP 2: 時間選択 */}
            <div class="reserve-step" id="reserve-step-time" style="display:none;">
              <h2 class="reserve-step__title"><span class="reserve-step__num">3</span>ご希望の時間を選択してください</h2>
              <p class="reserve-step__selected-date" id="reserve-selected-date"></p>
              <div class="reserve-time-list" id="reserve-time-list"></div>
              <button type="button" class="reserve-back-btn" data-back-to="date">
                <i class="fa-solid fa-arrow-left"></i>日付選択に戻る
              </button>
            </div>

            {/* STEP 3: 情報入力 */}
            <div class="reserve-step" id="reserve-step-form" style="display:none;">
              <h2 class="reserve-step__title"><span class="reserve-step__num">4</span>お客様情報をご入力ください</h2>
              <p class="reserve-step__selected-date" id="reserve-selected-datetime"></p>

              <form id="reserve-form" class="reserve-form" novalidate>
                <div class="reserve-form__group">
                  <div class="reserve-form__label-row">
                    <label class="reserve-form__label" for="reserve-name">お名前</label>
                    <span class="reserve-form__badge">必須</span>
                  </div>
                  <input type="text" id="reserve-name" name="name" class="reserve-form__input" placeholder="山田 太郎" required />
                </div>

                <div class="reserve-form__group">
                  <div class="reserve-form__label-row">
                    <label class="reserve-form__label" for="reserve-kana">フリガナ</label>
                    <span class="reserve-form__badge reserve-form__badge--optional">任意</span>
                  </div>
                  <input type="text" id="reserve-kana" name="kana" class="reserve-form__input" placeholder="ヤマダ タロウ" />
                </div>

                <div class="reserve-form__group">
                  <div class="reserve-form__label-row">
                    <label class="reserve-form__label" for="reserve-phone">電話番号</label>
                    <span class="reserve-form__badge">必須</span>
                  </div>
                  <input type="tel" id="reserve-phone" name="phone" class="reserve-form__input" placeholder="09012345678" required />
                </div>

                <div class="reserve-form__group">
                  <div class="reserve-form__label-row">
                    <label class="reserve-form__label" for="reserve-email">メールアドレス</label>
                    <span class="reserve-form__badge reserve-form__badge--optional">任意</span>
                  </div>
                  <input type="email" id="reserve-email" name="email" class="reserve-form__input" placeholder="example@example.com" />
                </div>

                <div class="reserve-form__group">
                  <div class="reserve-form__label-row">
                    <label class="reserve-form__label" for="reserve-birth">生年月日</label>
                    <span class="reserve-form__badge reserve-form__badge--optional">任意</span>
                  </div>
                  <input type="date" id="reserve-birth" name="birth_date" class="reserve-form__input" />
                </div>

                <div class="reserve-form__group">
                  <div class="reserve-form__label-row">
                    <label class="reserve-form__label" for="reserve-symptom">症状・ご相談内容</label>
                    <span class="reserve-form__badge reserve-form__badge--optional">任意</span>
                  </div>
                  <input type="text" id="reserve-symptom" name="symptom" class="reserve-form__input" placeholder="例：歯が痛い、詰め物が取れた など" />
                </div>

                <div class="reserve-form__group">
                  <div class="reserve-form__label-row">
                    <label class="reserve-form__label" for="reserve-message">備考</label>
                    <span class="reserve-form__badge reserve-form__badge--optional">任意</span>
                  </div>
                  <textarea id="reserve-message" name="message" class="reserve-form__textarea" rows={4} placeholder="ご質問などがございましたらご記入ください"></textarea>
                </div>

                <div id="reserve-form-error" class="reserve-form__error" style="display:none;"></div>

                <div class="reserve-form__submit-wrap">
                  <button type="button" class="reserve-back-btn" data-back-to="time">
                    <i class="fa-solid fa-arrow-left"></i>時間選択に戻る
                  </button>
                  <button type="submit" id="reserve-submit" class="btn btn-primary">
                    <i class="fa-regular fa-calendar-check"></i>
                    <span>この内容で予約する</span>
                  </button>
                </div>
              </form>
            </div>

            {/* STEP 4: 完了 */}
            <div class="reserve-step" id="reserve-step-done" style="display:none;">
              <div class="reserve-done">
                <i class="fa-solid fa-circle-check reserve-done__icon"></i>
                <h2 class="reserve-done__title">ご予約が完了しました</h2>
                <p class="reserve-done__datetime" id="reserve-done-datetime"></p>
                <p class="reserve-done__text">
                  ご入力いただいた電話番号・メールアドレス宛への確認連絡は行っておりません。当日は開始時間の5分前を目安にご来院ください。
                  <br />
                  ご予約の変更・キャンセルはお電話（{SITE.phone}）にてご連絡ください。
                </p>
                <a href={SITE.websiteUrl} class="btn btn-secondary">トップページへ戻る</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
