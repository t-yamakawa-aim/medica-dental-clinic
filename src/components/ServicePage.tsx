import { PageHeader } from './PageHeader'
import { SERVICE_RESERVATION_TABLE, SERVICE_FLOW_STEPS } from '../data/site'

export const ServicePage = () => {
  const { headerColumns, rows } = SERVICE_RESERVATION_TABLE

  return (
    <>
      <PageHeader
        titleJa="診療のご案内"
        titleEn="SERVICE"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: '診療のご案内' }]}
      />

      <main class="service-page" id="top">
        {/* ============ 予約案内 ============ */}
        <section id="reservation" class="section_pdg service-section">
          <div class="container container-sm">
            <p class="service-section__lead">
              メディカデンタルクリニックでは、お一人おひとりの診療時間を確保するため、原則
              <span class="service-attention">「予約診療」</span>
              とさせていただいております。急患の場合、状況によりお待たせしてしまう場合がございますので、あらかじめご了承ください。
            </p>
            <p class="service-section__lead">
              また「車いす」をご利用の方は初診ご予約の際に、その旨お伝えください。スムーズなご案内をさせていただきます。
            </p>
          </div>

          <div class="container service-reservation-wrap">
            <table class="service-reservation-table">
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <ul class="medical-list service-reservation-table__list">
                      {headerColumns[0].items.map((item) => (
                        <li>{item}</li>
                      ))}
                    </ul>
                  </th>
                  <th>
                    <ul class="medical-list service-reservation-table__list">
                      {headerColumns[1].items.map((item) => (
                        <li>
                          {item.split('\n').map((line, i) => (
                            <>
                              {i > 0 && <br />}
                              {line}
                            </>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr>
                    <th>{row.label}</th>
                    {row.columns.map((col) => (
                      <td>
                        {col.empty ? (
                          <span class="service-reservation-table__empty">{col.empty}</span>
                        ) : (
                          <>
                            <ul class="medical-list service-reservation-table__list">
                              {col.items.map((item) => (
                                <li>{item}</li>
                              ))}
                            </ul>
                            {col.note && <p class="service-reservation-table__note">{col.note}</p>}
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============ 診療の流れ ============ */}
        <section id="flow" class="section_pdg service-section bg-blue">
          <div class="container container-sm">
            <h2 class="medical-section__title">診療の流れ</h2>
          </div>

          <div class="container container-sm service-flow">
            {SERVICE_FLOW_STEPS.map((step) => (
              <div class="service-flow__step">
                <div class="service-flow__body">
                  <h3 class="service-flow__title">
                    <span class="service-flow__no">{step.no}</span>
                    <span>
                      {step.title}
                      {step.subtitle && (
                        <>
                          <br />
                          <span class="service-flow__subtitle">{step.subtitle}</span>
                        </>
                      )}
                    </span>
                  </h3>
                  {step.body.map((p) => (
                    <p>{p}</p>
                  ))}
                </div>
                <div class="service-flow__img">
                  <img src={step.image} alt={step.title} loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
