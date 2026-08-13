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
                {cause.lead.split('\n\n').map((p) => (
                  <p class="symptom-detail__cause-lead">{p}</p>
                ))}

                {cause.leadNote && <p class="symptom-detail__cause-lead">{cause.leadNote}</p>}

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

                {cause.blocks && cause.blocks.length > 0 && (
                  <div class="symptom-detail__blocks">
                    {cause.blocks.map((block) => (
                      <div class="symptom-detail__block">
                        <h4 class="symptom-detail__block-heading">
                          {block.heading}
                          {block.headingNote && <span class="symptom-detail__block-heading-note">{block.headingNote}</span>}
                        </h4>

                        {block.body &&
                          block.body.split('\n\n').map((p) => <p class="symptom-detail__block-body">{p}</p>)}

                        {block.bulletList && block.bulletList.length > 0 && (
                          <ul class="symptom-detail__block-list">
                            {block.bulletList.map((item) => (
                              <li>{item}</li>
                            ))}
                          </ul>
                        )}

                        {block.image && (
                          <figure class="symptom-detail__cause-image">
                            <img src={block.image.src} alt={block.image.alt} loading="lazy" />
                          </figure>
                        )}

                        {block.beforeAfter && (
                          <div class="symptom-detail__before-after">
                            <figure>
                              <img src={block.beforeAfter.before.src} alt={block.beforeAfter.before.alt} loading="lazy" />
                              <figcaption>治療前</figcaption>
                            </figure>
                            <figure>
                              <img src={block.beforeAfter.after.src} alt={block.beforeAfter.after.alt} loading="lazy" />
                              <figcaption>治療後</figcaption>
                            </figure>
                          </div>
                        )}

                        {block.table && block.table.length > 0 && (
                          <table class="symptom-detail__table">
                            <tbody>
                              {block.table.map((row) => (
                                <tr>
                                  <th>{row.label}</th>
                                  <td>{row.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {block.subBlocks && block.subBlocks.length > 0 && (
                          <div class="symptom-detail__subblocks">
                            {block.subBlocks.map((sub) => (
                              <div class="symptom-detail__subblock">
                                <h5 class="symptom-detail__subblock-heading">
                                  {sub.heading}
                                  {sub.headingNote && (
                                    <span class="symptom-detail__block-heading-note">{sub.headingNote}</span>
                                  )}
                                </h5>

                                {sub.body &&
                                  sub.body.split('\n\n').map((p) => <p class="symptom-detail__block-body">{p}</p>)}

                                {sub.bulletList && sub.bulletList.length > 0 && (
                                  <ul class="symptom-detail__block-list">
                                    {sub.bulletList.map((item) => (
                                      <li>{item}</li>
                                    ))}
                                  </ul>
                                )}

                                {sub.image && (
                                  <figure class="symptom-detail__cause-image">
                                    <img src={sub.image.src} alt={sub.image.alt} loading="lazy" />
                                  </figure>
                                )}

                                {sub.beforeAfter && (
                                  <div class="symptom-detail__before-after">
                                    <figure>
                                      <img src={sub.beforeAfter.before.src} alt={sub.beforeAfter.before.alt} loading="lazy" />
                                      <figcaption>治療前</figcaption>
                                    </figure>
                                    <figure>
                                      <img src={sub.beforeAfter.after.src} alt={sub.beforeAfter.after.alt} loading="lazy" />
                                      <figcaption>治療後</figcaption>
                                    </figure>
                                  </div>
                                )}

                                {sub.table && sub.table.length > 0 && (
                                  <table class="symptom-detail__table">
                                    <tbody>
                                      {sub.table.map((row) => (
                                        <tr>
                                          <th>{row.label}</th>
                                          <td>{row.value}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
