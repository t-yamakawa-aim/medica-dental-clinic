import { PageHeader } from './PageHeader'
import {
  RECRUIT_DIRECTOR_MESSAGE,
  RECRUIT_CATCH,
  RECRUIT_JOBS,
  type RecruitJobRow,
} from '../data/site'

// 改行(\n)を<br/>に変換して出力する
const withBr = (text: string) => {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <>
          {i > 0 && <br />}
          {line}
        </>
      ))}
    </>
  )
}

// RecruitJobRow.html の行プレフィックス規則をパースしてJSXに変換する
// '#'   = 見出し(h6相当)
// '-'   = 箇条書きリスト項目(連続する'-'行はまとめて<ul>にする)
// '!'   = 注意テキスト
// '1.' 等の数字始まり = 番号付きリスト項目(連続する行はまとめて<ol>にする)
// それ以外 = 通常の段落
const RowContent = ({ html }: { html: string[] }) => {
  const nodes: any[] = []
  let ulBuffer: string[] = []
  let olBuffer: string[] = []

  const flushUl = () => {
    if (ulBuffer.length > 0) {
      nodes.push(
        <ul class="recruit-job__list">
          {ulBuffer.map((item) => (
            <li>{withBr(item.slice(1))}</li>
          ))}
        </ul>
      )
      ulBuffer = []
    }
  }

  const flushOl = () => {
    if (olBuffer.length > 0) {
      nodes.push(
        <ol class="recruit-job__list recruit-job__list--num">
          {olBuffer.map((item) => (
            <li>{withBr(item.replace(/^\d+\.\s*/, ''))}</li>
          ))}
        </ol>
      )
      olBuffer = []
    }
  }

  const flushAll = () => {
    flushUl()
    flushOl()
  }

  html.forEach((line) => {
    if (line.startsWith('#')) {
      flushAll()
      nodes.push(<h6 class="recruit-job__heading">{line.slice(1)}</h6>)
    } else if (line.startsWith('-')) {
      flushOl()
      ulBuffer.push(line)
    } else if (/^\d+\./.test(line)) {
      flushUl()
      olBuffer.push(line)
    } else if (line.startsWith('!')) {
      flushAll()
      nodes.push(<p class="recruit-job__note">{withBr(line.slice(1))}</p>)
    } else {
      flushAll()
      nodes.push(<p class="recruit-job__paragraph">{withBr(line)}</p>)
    }
  })
  flushAll()

  return <>{nodes}</>
}

const JobTable = ({ rows }: { rows: RecruitJobRow[] }) => (
  <table class="recruit-job__table">
    <tbody>
      {rows.map((row) => (
        <tr>
          <th>{row.label}</th>
          <td>
            <RowContent html={row.html} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

export const RecruitPage = () => {
  return (
    <>
      <PageHeader
        titleJa="採用情報"
        titleEn="RECRUIT"
        breadcrumbs={[{ label: 'ホーム', href: '/' }, { label: '採用情報' }]}
      />

      <main class="recruit-page" id="top">
        {/* ============ 院長メッセージ ============ */}
        <section id="message" class="section_pdg recruit-message">
          <div class="container container-sm">
            <h2 class="section-title-lg">院長メッセージ</h2>
            <div class="recruit-message__inner">
              <div class="recruit-message__image">
                <img src={RECRUIT_DIRECTOR_MESSAGE.image} alt="院長" loading="lazy" />
              </div>
              <div class="recruit-message__body">
                {RECRUIT_DIRECTOR_MESSAGE.paragraphs.map((p) => (
                  <p class="recruit-message__text">{withBr(p)}</p>
                ))}
                <p class="recruit-message__signoff">{RECRUIT_DIRECTOR_MESSAGE.signOff}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ キャッチコピー ============ */}
        <section id="catch" class="section_pdg recruit-catch">
          <div class="container container-sm">
            <h2 class="recruit-catch__title">
              {RECRUIT_CATCH.titleLines.map((line, i) => (
                <>
                  {i > 0 && <br />}
                  {line}
                </>
              ))}
            </h2>
            {RECRUIT_CATCH.paragraphs.map((p) => (
              <p class="recruit-catch__text">{withBr(p)}</p>
            ))}
          </div>
        </section>

        {/* ============ 募集要項 ============ */}
        <section id="jobs" class="section_pdg recruit-jobs">
          <div class="container container-sm">
            <h2 class="section-title-lg">募集要項</h2>

            <div class="recruit-jobs__tabs" role="tablist">
              {RECRUIT_JOBS.map((job, i) => (
                <a href={`#job-${job.id}`} class={`recruit-jobs__tab${i === 0 ? ' is-active' : ''}`}>
                  {job.title}
                </a>
              ))}
            </div>

            {RECRUIT_JOBS.map((job) => (
              <div id={`job-${job.id}`} class="recruit-job">
                <h3 class="recruit-job__title">{job.title}</h3>
                {job.image && (
                  <div class="recruit-job__image">
                    <img src={job.image} alt={job.title} loading="lazy" />
                  </div>
                )}
                {job.note && <p class="recruit-job__note-lead">{job.note}</p>}
                {job.rows.length > 0 && <JobTable rows={job.rows} />}

                <div class="recruit-job__buttons">
                  <a href="/recruit/entry" class="btn btn-primary">
                    <i class="fa-solid fa-file-pen"></i>
                    <span>{job.title}にエントリーする</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ クリニック見学導線 ============ */}
        <section id="tour" class="section_pdg recruit-tour">
          <div class="container container-sm">
            <div class="recruit-tour__box">
              <h2 class="recruit-tour__title">クリニック見学も受付中です</h2>
              <p class="recruit-tour__text">
                「実際の雰囲気を見てから応募したい」という方のために、クリニック見学も受け付けています。
                <br />
                ご希望の方は下記のエントリーフォームより「クリニック見学申し込み」をご選択のうえ、お気軽にお申し込みください。
              </p>
              <div class="recruit-tour__buttons">
                <a href="/recruit/entry" class="btn btn-outline">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  <span>クリニック見学に申し込む</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section class="container container-sm section_pdg recruit-cta">
          <p class="recruit-cta__text">
            ご応募・ご質問など、まずはお気軽にエントリーフォームよりご連絡ください。
          </p>
          <div class="recruit-cta__buttons">
            <a href="/recruit/entry" class="btn btn-primary">
              <i class="fa-solid fa-file-pen"></i>
              <span>採用エントリーフォームへ</span>
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
