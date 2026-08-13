import { PageHeader } from './PageHeader'
import { RECRUIT_INQUIRY_TYPES, RECRUIT_JOB_TYPES } from '../data/site'

export const RecruitEntryPage = () => {
  return (
    <>
      <PageHeader
        titleJa="採用エントリーフォーム"
        titleEn="ENTRY FORM"
        breadcrumbs={[
          { label: 'ホーム', href: '/' },
          { label: '採用情報', href: '/recruit' },
          { label: '採用エントリーフォーム' },
        ]}
      />

      <main class="recruit-entry-page" id="top">
        <section class="container container-sm section_pdg recruit-entry">
          <p class="recruit-entry__lead">
            採用エントリー（応募）・クリニック見学のお申し込み・採用に関するお問い合わせは、下記フォームよりご連絡ください。
            <br />
            担当者より追ってご連絡いたします。
          </p>

          <form id="recruit-entry-form" class="recruit-entry-form" novalidate>
            {/* お問い合わせ内容 */}
            <div class="recruit-entry-form__group" data-required-group="inquiry">
              <div class="recruit-entry-form__label-row">
                <span class="recruit-entry-form__label">お問い合わせ内容</span>
                <span class="recruit-entry-form__badge">必須</span>
              </div>
              <div class="recruit-entry-form__checkboxes">
                {RECRUIT_INQUIRY_TYPES.map((item, i) => (
                  <label class="recruit-entry-form__checkbox">
                    <input type="checkbox" name="inquiry_types" value={item} data-required-track="inquiry" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 希望職種 */}
            <div class="recruit-entry-form__group">
              <div class="recruit-entry-form__label-row">
                <span class="recruit-entry-form__label">希望職種</span>
                <span class="recruit-entry-form__badge recruit-entry-form__badge--optional">任意</span>
              </div>
              <div class="recruit-entry-form__checkboxes">
                {RECRUIT_JOB_TYPES.map((item) => (
                  <label class="recruit-entry-form__checkbox">
                    <input type="checkbox" name="job_types" value={item} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* お名前 */}
            <div class="recruit-entry-form__group">
              <div class="recruit-entry-form__label-row">
                <label class="recruit-entry-form__label" for="entry-name">お名前</label>
                <span class="recruit-entry-form__badge">必須</span>
              </div>
              <input
                type="text"
                id="entry-name"
                name="name"
                class="recruit-entry-form__input"
                placeholder="山田 太郎"
                data-required-track="field"
                required
              />
            </div>

            {/* フリガナ */}
            <div class="recruit-entry-form__group">
              <div class="recruit-entry-form__label-row">
                <label class="recruit-entry-form__label" for="entry-kana">フリガナ</label>
                <span class="recruit-entry-form__badge recruit-entry-form__badge--optional">任意</span>
              </div>
              <input
                type="text"
                id="entry-kana"
                name="kana"
                class="recruit-entry-form__input"
                placeholder="ヤマダ タロウ"
              />
            </div>

            {/* 電話番号 */}
            <div class="recruit-entry-form__group">
              <div class="recruit-entry-form__label-row">
                <label class="recruit-entry-form__label" for="entry-phone">電話番号</label>
                <span class="recruit-entry-form__badge">必須</span>
              </div>
              <input
                type="tel"
                id="entry-phone"
                name="phone"
                class="recruit-entry-form__input"
                placeholder="09012345678"
                data-required-track="field"
                required
              />
            </div>

            {/* メールアドレス */}
            <div class="recruit-entry-form__group">
              <div class="recruit-entry-form__label-row">
                <label class="recruit-entry-form__label" for="entry-email">メールアドレス</label>
                <span class="recruit-entry-form__badge">必須</span>
              </div>
              <input
                type="email"
                id="entry-email"
                name="email"
                class="recruit-entry-form__input"
                placeholder="example@example.com"
                data-required-track="field"
                required
              />
            </div>

            {/* 備考 */}
            <div class="recruit-entry-form__group">
              <div class="recruit-entry-form__label-row">
                <label class="recruit-entry-form__label" for="entry-message">備考</label>
                <span class="recruit-entry-form__badge recruit-entry-form__badge--optional">任意</span>
              </div>
              <textarea
                id="entry-message"
                name="message"
                class="recruit-entry-form__textarea"
                rows={6}
                placeholder="ご質問やご希望などがございましたらご記入ください"
              ></textarea>
            </div>

            <div id="recruit-entry-form__error" class="recruit-entry-form__error" style="display:none;"></div>

            <div class="recruit-entry-form__submit-wrap">
              <p class="recruit-entry-form__counter">
                残り<span id="recruit-entry-remaining">4</span>/<span id="recruit-entry-total">4</span>の必須項目があります
              </p>
              <button type="submit" id="recruit-entry-submit" class="btn btn-primary recruit-entry-form__submit" disabled>
                <i class="fa-solid fa-paper-plane"></i>
                <span id="recruit-entry-submit-label">入力が完了していません</span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  )
}
