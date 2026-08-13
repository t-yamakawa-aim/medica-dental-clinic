import { SYMPTOMS } from '../data/site'

export const SymptomsSection = () => {
  return (
    <section id="symptoms" class="section symptoms-section">
      <div class="container container-sm">
        <h2 class="section-title-lg">
          痛み以外の症状にも、
          <br />
          耳を傾けて。
        </h2>

        <div class="symptoms-section__text">
          <p>
            お口のお悩みで特に多いものが「痛み」の症状です。
            <br />
            しかし、そうした「痛みの強さ」と「病気の重症度」は必ずしも一致しません。
            <br />
            痛くても病気は軽度なこともあれば、痛くないのに重度の歯周病が隠れていることも。
          </p>
          <p>
            歯やお口のお悩み・ご不安がございましたら、当院までお気軽にご相談ください。
            <br />
            術中の痛み・不快感にも最大限配慮した治療を行ってまいります。
          </p>
        </div>

        <div class="symptoms-grid">
          {SYMPTOMS.map((item) => (
            <a href={item.href} class="symptom-card">
              <div class="symptom-card__icon">
                <i class={item.icon}></i>
              </div>
              <p class="symptom-card__title">{item.title}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
