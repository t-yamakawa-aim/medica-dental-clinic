import { PageHeader } from './PageHeader'
import { SITE, DIRECTOR } from '../data/site'

export const PrivacyPage = () => {
  return (
    <>
      <PageHeader
        titleJa="プライバシーポリシー"
        titleEn="PRIVACY POLICY"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: 'プライバシーポリシー' }]}
      />

      <main class="privacy-page" id="top">
        <section class="container container-sm section_pdg privacy-section">
          <h2 class="medical-section__title">個人情報保護方針</h2>
          <p class="privacy-section__lead">
            {SITE.name}（以下「当院」）は、事業において個人情報を取り扱う医院として、個人情報を大切に保護することを重要な社会的使命と認識し、業務を通じて取り扱う個人情報に関して、以下のとおりプライバシーポリシーを定め運用いたします。
          </p>
        </section>

        <section class="container container-sm section_pdg privacy-section">
          <h3 class="privacy-section__title">1. 個人情報取扱いに関する基本方針</h3>
          <ol class="privacy-list">
            <li>個人情報の取得・利用は、その目的をできる限り明確化し、当院が定める範囲（2.個人情報の取扱い・利用目的）において利用致します。</li>
            <li>
              取得した個人情報を適切に管理し、次のいずれかに該当する場合を除き、個人情報を第三者に開示いたしません。
              <br />
              ・ 患者様の同意がある場合
              <br />
              ・ 患者様が希望されるサービスをおこなうために当院が業務を委託する業者に対して開示する場合
              <br />
              ・ 法令に基づき開示することが必要である場合
            </li>
            <li>
              患者様の個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備・職員・スタッフ教育の徹底などの必要な措置を講じ、個人情報の厳重な管理を行ないます。
            </li>
            <li>個人情報の処理を外部へ委託する場合、契約により、漏洩や第三者への提供を行わない等を義務づけ、委託先に対する適切な管理を実施いたします。</li>
            <li>
              保有する個人情報に関して適用される日本の法令、その他規範を遵守いたします。また、本ポリシーの内容を適宜見直し更新していくとともに、本ポリシーの重要な変更は、当院のウェブサイト（本ページ）にて告知いたします。
            </li>
          </ol>
        </section>

        <section class="container container-sm section_pdg privacy-section">
          <h3 class="privacy-section__title">2. 個人情報の取扱い・利用目的</h3>
          <p class="privacy-section__lead">
            当院が取得した個人情報は、次の目的の範囲内で利用いたします。
            <br />
            ただし利用目的が次の範囲に含まれない場合や、間接的・またはそれ以外の手段で取得した場合には、ご本人の同意を得たうえで、利用いたします。
          </p>
          <div class="privacy-table-wrap">
            <table class="privacy-table">
              <thead>
                <tr>
                  <th>対象の個人情報</th>
                  <th>利用目的</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>問診表（予診表）、カルテ、検査記録、健康保険証の写し、エックス線写真、口腔内・顔貌写真、歯型、紹介状など、医療に関わる個人情報</td>
                  <td>患者様への適切な医療提供、ならびに歯科医療の質の向上（学会発表、論文発表、講演等への利用の際は、個人が特定されないように致します。）のために利用します。</td>
                </tr>
                <tr>
                  <td>職員・退職者に関する個人情報</td>
                  <td>雇用及び人事管理に利用します。</td>
                </tr>
                <tr>
                  <td>採用応募者に関する個人情報</td>
                  <td>選考および採否に関するご連絡に利用します。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="container container-sm section_pdg privacy-section">
          <h3 class="privacy-section__title">3. 個人情報の開示等について</h3>
          <ol class="privacy-list">
            <li>
              当院は、開示した本人から求められる開示、内容の訂正、追加又は削除、利用の停止、および第三者への提供の停止、利用目的の通知（以下、開示等という）の求めのすべてに応じることができる権限を有する個人情報を「開示対象個人情報」として、開示本人からの求めに対し、遅滞なく対応いたします。
            </li>
            <li>当院は、開示対象個人情報についてご本人様から開示等のお申出があった場合、ご本人様の本人確認をおこなった後、開示等の対応をいたします。</li>
            <li>
              本人確認について 当院では、以下のいずれかの方法にて本人確認をさせていただいております。
              <br />
              3.1. 開示本人から既に提供を受けている電話番号にて、本人を確認する。
              <br />
              3.2. 開示本人から既に提供を受けているEメールアドレスにEメールを送信し、当該メールに返信して頂くことで本人を確認する。
              <br />
              3.3. 手続き時に、氏名、住所、電話番号、生年月日を確認することで、本人を確認する。
            </li>
            <li>代理人の本人確認については、代理人が当院へ来院のうえ、運転免許証またはパスポート、及び委任状をご提示頂くことで本人を確認する。</li>
            <li>
              当院では、開示等の求めに応じる手続きについて、本人確認を行なった後、開示本人に対して「個人情報開示等請求書」を郵送させていただきます。開示本人より「個人情報開示等請求書」を返送いただきましたら、開示等に対して遅滞なく回答させていただきます。請求内容への回答は、電話、または「個人情報開示等回答書」の送付により対応させていただきます。
              <br />
              なお開示等の請求にあたり、印刷、郵送費等の実費、手数料がかかる場合があります。
            </li>
          </ol>
        </section>

        <section class="container container-sm section_pdg privacy-section">
          <h3 class="privacy-section__title">4. お問合せ先</h3>
          <p class="privacy-section__lead">当院の個人情報の取扱に関するお問い合せは下記までご連絡ください。</p>
          <div class="privacy-table-wrap">
            <table class="privacy-table privacy-table--info">
              <tbody>
                <tr>
                  <th>名称</th>
                  <td>{SITE.name}</td>
                </tr>
                <tr>
                  <th>所在地</th>
                  <td>{SITE.addressFull}</td>
                </tr>
                <tr>
                  <th>個人情報保護管理者</th>
                  <td>{DIRECTOR.name}</td>
                </tr>
                <tr>
                  <th>連絡先</th>
                  <td>TEL: {SITE.phone}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="privacy-section__signoff">
            最終更新日：2026年8月
            <br />
            {SITE.name}　院長　{DIRECTOR.name}
          </p>
        </section>
      </main>
    </>
  )
}
