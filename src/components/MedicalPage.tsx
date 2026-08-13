import { PageHeader } from './PageHeader'
import {
  MEDICAL_PROMISES,
  DIRECTOR,
  CLINIC_OUTLINE,
  FACILITY_ROOMS,
  FACILITY_EQUIPMENTS,
  HYGIENE_MEASURES,
  STAFF_MEMBERS,
} from '../data/site'

export const MedicalPage = () => {
  return (
    <>
      <PageHeader
        titleJa="当院について"
        titleEn="MEDICAL"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: '当院について' }]}
      />

      <main class="medical-page" id="top">
        {/* ============ 私たちの目指すもの ============ */}
        <section id="vision" class="section_pdg medical-section">
          <div class="container container-sm">
            <h2 class="medical-section__title">私たちの目指すもの</h2>
            <p class="medical-section__lead">
              メディカデンタルクリニックでは、患者様にとって最適な選択肢をご提案し、
              <br class="pc-only" />
              お口の健康が長続きするための歯科医療を提供します。
              <br />
              そして、地域に必要とされ、最終的な受け皿となり得るデンタルクリニックを目指します。
              <br class="pc-only" />
              そのために以下の3つを皆様にお約束します。
            </p>
          </div>

          {MEDICAL_PROMISES.map((item, i) => (
            <div class={`medical-promise container${i % 2 === 1 ? ' medical-promise--reverse' : ''}`}>
              <div class="medical-promise__img">
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
              <div class="medical-promise__body">
                <h3 class="medical-promise__title">
                  <span class="medical-promise__no">{item.no}.</span>
                  <br />
                  {item.title}
                </h3>
                <p>{item.body}</p>
              </div>
            </div>
          ))}

          <div class="container medical-jump-buttons">
            <a href="#director" class="btn btn-outline">
              院長紹介
            </a>
            <a href="#outline" class="btn btn-outline">
              当院概要
            </a>
            <a href="#facility" class="btn btn-outline">
              施設・設備紹介
            </a>
            <a href="#hygiene" class="btn btn-outline">
              当院の感染症対策
            </a>
            <a href="#staff" class="btn btn-outline">
              スタッフ紹介
            </a>
          </div>
        </section>

        {/* ============ 院長紹介 ============ */}
        <section id="director" class="section_pdg medical-section bg-blue">
          <div class="container container-sm">
            <h2 class="medical-section__title">院長紹介</h2>
          </div>

          <div class="medical-director__intro container">
            <div class="medical-director__img">
              <img src={DIRECTOR.image} alt={DIRECTOR.name} loading="lazy" />
            </div>
            <div class="medical-director__body">
              <h3 class="medical-promise__title">{DIRECTOR.greetingTitle}</h3>
              {DIRECTOR.greetingParagraphs.map((p) => (
                <p>{p}</p>
              ))}
            </div>
          </div>

          <div class="container container-sm medical-director__beliefs">
            {DIRECTOR.beliefs.map((b) => (
              <div class="medical-director__belief">
                <h4 class="medical-director__belief-title">{b.title}</h4>
                {b.paragraphs.map((p) => (
                  <p>{p}</p>
                ))}
              </div>
            ))}
            <p class="medical-director__signoff">{DIRECTOR.signOff}</p>
          </div>

          <div class="container container-sm medical-director__grid">
            <div class="medical-info-box">
              <h4 class="medical-info-box__title">経歴</h4>
              <table class="medical-table">
                <tbody>
                  {DIRECTOR.career.map((row) => (
                    <tr>
                      <th>{row.year}</th>
                      <td>{row.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div class="medical-info-box">
              <h4 class="medical-info-box__title">所属研究会</h4>
              <ul class="medical-list">
                {DIRECTOR.societies.map((s) => (
                  <li>{s}</li>
                ))}
              </ul>
            </div>

            <div class="medical-info-box">
              <h4 class="medical-info-box__title">講演・発表実績</h4>
              <ul class="medical-list">
                {DIRECTOR.achievements.map((s) => (
                  <li>{s}</li>
                ))}
              </ul>
            </div>

            <div class="medical-info-box">
              <h4 class="medical-info-box__title">修了コース</h4>
              <div class="medical-course-box">
                <h5>JIADS</h5>
                <ul class="medical-list">
                  {DIRECTOR.courses.jiads.map((c) => (
                    <li>{c}</li>
                  ))}
                </ul>
              </div>
              <div class="medical-course-box">
                <h5>他</h5>
                <ul class="medical-list">
                  {DIRECTOR.courses.others.map((c) => (
                    <li>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 当院概要 ============ */}
        <section id="outline" class="section_pdg medical-section">
          <div class="container container-sm">
            <h2 class="medical-section__title">当院概要</h2>
            <table class="medical-table medical-table--outline">
              <tbody>
                {CLINIC_OUTLINE.map((row) => (
                  <tr>
                    <th>{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============ 施設・設備紹介 ============ */}
        <section id="facility" class="section_pdg medical-section bg-blue">
          <div class="container container-sm">
            <h2 class="medical-section__title">施設・設備紹介</h2>
            <p class="medical-section__lead">
              患者様のことを考えた、こだわりの医療・衛生設備をご用意しています。
            </p>
            <p class="medical-section__body">
              最新のCT・レントゲン設備に加え、治療中にお口に入る「水」の衛生・消毒管理や、室内の「空気循環」を重視した専用機器を導入しています。
              <br />
              当院はバリアフリー環境も整えております。車椅子に座ったまま治療が可能です。院内にはキッズスペースを併設し、お子様連れの方やベビーカーをご使用の方もご来院いただけます。
            </p>
          </div>

          <div class="container medical-facility-grid">
            {FACILITY_ROOMS.map((item) => (
              <div class="medical-facility-card">
                <div class="medical-facility-card__img">
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
                <h4 class="medical-facility-card__title">{item.title}</h4>
                <p>{item.body}</p>
              </div>
            ))}
          </div>

          <div class="container medical-facility-grid">
            {FACILITY_EQUIPMENTS.map((item) => (
              <div class="medical-facility-card">
                <div class="medical-facility-card__img">
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
                <h4 class="medical-facility-card__title">{item.title}</h4>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 当院の感染症対策 ============ */}
        <section id="hygiene" class="section_pdg medical-section">
          <div class="container container-sm">
            <h2 class="medical-section__title">
              当院の新型
              <br class="pc-only" />
              コロナ感染対策
            </h2>
            <p class="medical-section__lead">
              安心で安全な医療を提供するため、院内感染を起こさない取り組みを行っております。
              <br />
              治療に使用する器具の洗浄・滅菌を徹底し、清潔で安全な環境を維持しています。
            </p>

            <div class="medical-hygiene-grid">
              <div class="medical-info-box medical-info-box--white">
                <h4 class="medical-info-box__title">通常時から行っている取り組み</h4>
                <ul class="medical-list">
                  {HYGIENE_MEASURES.normal.map((s) => (
                    <li>{s}</li>
                  ))}
                </ul>
              </div>
              <div class="medical-info-box medical-info-box--white">
                <h4 class="medical-info-box__title">感染症対策として加えて行っている取り組み</h4>
                <ul class="medical-list">
                  <li>
                    来院の際は必ずマスクの着用をお願いします。
                    <br />
                    <span class="medical-attention">
                      37.5度以上の発熱、強い倦怠感（だるさ）、咳、喉の痛みなどの症状がある方は、ご来院前にお電話にて必ずご連絡ください。
                    </span>
                  </li>
                  {HYGIENE_MEASURES.additional.map((s) => (
                    <li>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============ スタッフ紹介 ============ */}
        <section id="staff" class="section_pdg medical-section bg-blue">
          <div class="container container-sm">
            <h2 class="medical-section__title">スタッフ紹介</h2>
          </div>

          {STAFF_MEMBERS.map((member) => (
            <div class="medical-director__intro container">
              <div class="medical-director__img">
                <img src={member.image} alt={member.name} loading="lazy" />
              </div>
              <div class="medical-director__body">
                <h3 class="medical-promise__title">{member.role}</h3>
                <table class="medical-table">
                  <tbody>
                    <tr>
                      <th>名前</th>
                      <td>{member.name}</td>
                    </tr>
                    <tr>
                      <th>メッセージ</th>
                      <td>{member.message}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  )
}
