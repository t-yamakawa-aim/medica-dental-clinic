export const FacilitySection = () => {
  return (
    <section id="facility" class="section facility-section">
      <div class="container">
        <h2 class="section-title-lg">患者様との向き合い方</h2>

        <div class="facility-section__text">
          <p>
            当院では、最新のCT・レントゲン設備に加え、患者様のプライバシーを重視し、
            <br />
            診療室と手術室（オペ室）をそれぞれ半個室・個室に設計。
          </p>
          <p>キッズスペースを併設しており、車いす、ベビーカーでのご来院も可能です。</p>
          <p>また感染対策として、治療でお口に入る「水」や室内の「空気循環」にも配慮。</p>
          <p>安心の治療環境で皆様をお待ちしております。</p>
        </div>

        <div class="btn-wrap">
          <a href="/service" class="btn btn-secondary">
            診療のご案内
          </a>
        </div>
      </div>

      <div class="facility-gallery">
        <div class="facility-gallery__item">
          <img src="/static/images/facility-01.png" alt="メディカデンタルクリニック外観" />
        </div>
        <div class="facility-gallery__item">
          <img src="/static/images/facility-02.png" alt="メディカデンタルクリニック待合室" />
        </div>
        <div class="facility-gallery__item">
          <img src="/static/images/facility-03.png" alt="メディカデンタルクリニックデンタルユニット" />
        </div>
      </div>
    </section>
  )
}
