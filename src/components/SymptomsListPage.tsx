import { SYMPTOMS } from '../data/site'
import { PageHeader } from './PageHeader'

export const SymptomsListPage = () => {
  return (
    <>
      <PageHeader
        titleJa="症状別で探す"
        titleEn="SYMPTOMS"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: '症状別で探す' }]}
      />
      <div class="container container-sm section_pdg symptoms-list-page">
        <div class="symptoms-list-grid">
          {SYMPTOMS.map((item) => (
            <a href={item.href} class="symptoms-list-card">
              <div class="symptoms-list-card__icon">
                <i class={item.icon}></i>
              </div>
              <p class="symptoms-list-card__title">{item.title}</p>
              {!item.ready && <span class="symptoms-list-card__badge">近日公開</span>}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
