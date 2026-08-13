import type { SymptomDetail } from '../data/symptomDetails'
import { PageHeader } from './PageHeader'

type Props = {
  detail: SymptomDetail
}

export const SymptomDetailPage = ({ detail }: Props) => {
  return (
    <>
      <PageHeader
        titleJa="症状別で探す"
        titleEn="SYMPTOMS"
        breadcrumbs={[
          { label: 'ホーム', href: '/' },
          { label: '症状別で探す', href: '/symptoms' },
          { label: detail.title },
        ]}
      />

      <main class="symptom-detail" id="top">
        <section class="container container-sm section_pdg symptom-detail__intro">
          <h2 class="symptom-detail__title">{detail.title}</h2>

          <div class="symptom-detail__lead">
            {detail.intro.map((p) => (
              <p>{p}</p>
            ))}
          </div>

          <div class="symptom-detail__jump-buttons">
            {detail.causes.map((cause) => (
              <a href={`#${cause.id}`} class="symptom-detail__jump-btn">
                {cause.jumpLabel}
              </a>
            ))}
          </div>
        </section>

        <section class="container container-sm section_pdg symptom-detail__causes-heading">
          <h2 class="symptom-detail__section-title">考えられる原因と主な治療法</h2>
        </section>

        {detail.causes.map((cause) => (
          <section id={cause.id} class="symptom-detail__cause">
            <div class="container container-sm">
              <h3 class="symptom-detail__cause-title">
                {cause.title}
                {cause.titleSub && <span class="symptom-detail__cause-title-sub">{cause.titleSub}</span>}
              </h3>

              <div class="symptom-detail__cause-box">
                <p class="symptom-detail__cause-lead">{cause.lead}</p>

                {cause.image && (
                  <figure class="symptom-detail__cause-image">
                    <img src={cause.image.src} alt={cause.image.alt} loading="lazy" />
                  </figure>
                )}

                {cause.treatments && cause.treatments.length > 0 && (
                  <div class="symptom-detail__treatment">
                    <h4 class="symptom-detail__treatment-heading">
                      <i class="fa-solid fa-notes-medical"></i> 治療
                    </h4>
                    {cause.treatments.map((t) => (
                      <div class="symptom-detail__treatment-block">
                        {t.heading && <h5 class="symptom-detail__treatment-sub">{t.heading}</h5>}
                        <p>{t.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                {cause.table && cause.table.length > 0 && (
                  <table class="symptom-detail__table">
                    <tbody>
                      {cause.table.map((row) => (
                        <tr>
                          <th>{row.label}</th>
                          <td>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {cause.note && <p class="symptom-detail__note">{cause.note}</p>}
              </div>
            </div>
          </section>
        ))}

        <section class="container container-sm section_pdg symptom-detail__cta">
          <p class="symptom-detail__cta-text">
            上記はあくまで一例です。気になる症状がございましたら、まずはお気軽にご相談ください。
          </p>
          <div class="symptom-detail__cta-buttons">
            <a href="/contact" class="btn btn-primary">
              <i class="fa-regular fa-calendar-check"></i>
              <span>Web予約・お問い合わせ</span>
            </a>
            <a href="/symptoms" class="btn btn-outline">
              <i class="fa-solid fa-arrow-left"></i>
              <span>症状別で探すトップへ</span>
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
