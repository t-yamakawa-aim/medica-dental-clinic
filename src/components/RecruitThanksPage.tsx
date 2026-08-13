import { PageHeader } from './PageHeader'
import { SITE } from '../data/site'

export const RecruitThanksPage = () => {
  return (
    <>
      <PageHeader
        titleJa="応募完了"
        titleEn="THANKS"
        breadcrumbs={[
          { label: 'ホーム', href: '/' },
          { label: '採用情報', href: '/recruit' },
          { label: '応募完了' },
        ]}
      />

      <main class="recruit-thanks-page" id="top">
        <section class="container container-sm section_pdg recruit-thanks">
          <div class="recruit-thanks__icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h2 class="recruit-thanks__title">送信が完了しました</h2>
          <p class="recruit-thanks__text">
            ご応募・お問い合わせいただき、誠にありがとうございます。
            <br />
            内容を確認のうえ、担当者より追ってご連絡させていただきます。
          </p>
          <p class="recruit-thanks__note">
            数日経ってもご連絡がない場合は、お手数をおかけいたしますが下記お電話番号までご連絡ください。
            <br />
            電話番号：<a href={SITE.phoneHref}>{SITE.phone}</a>（受付時間 {SITE.receptionHours}）
          </p>
          <div class="recruit-thanks__buttons">
            <a href="/recruit" class="btn btn-outline">
              <i class="fa-solid fa-arrow-left"></i>
              <span>採用情報ページへ戻る</span>
            </a>
            <a href="/" class="btn btn-primary">
              <i class="fa-solid fa-house"></i>
              <span>トップページへ</span>
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
