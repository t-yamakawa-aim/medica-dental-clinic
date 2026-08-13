export const RecruitSection = () => {
  return (
    <section id="recruit" class="section recruit-section">
      <div class="container container-xs">
        <div class="recruit-box">
          <h2 class="section-title-lg">採用情報</h2>
          <p class="recruit-box__text">
            メディカデンタルクリニックで一緒に働く仲間を募集しています。
            <br />
            お口を通して、地域に貢献しませんか。
          </p>
          <div class="recruit-box__buttons">
            <a href="/recruit" class="btn btn-secondary">
              募集要項を見る
            </a>
            <a href="/recruit/entry" class="btn btn-primary">
              <i class="fa-solid fa-file-pen"></i>
              <span>採用エントリー</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
