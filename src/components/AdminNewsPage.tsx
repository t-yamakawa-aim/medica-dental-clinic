import { AdminNav } from './AdminLayout'

// クリニック側: お知らせ管理画面。一覧・追加・編集・削除はすべてフロントJSからAPI経由で行う。
export const AdminNewsPage = () => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>お知らせ管理｜メディカデンタルクリニック</title>
        <meta name="robots" content="noindex, nofollow" />
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>
        <div class="admin-reserve">
          <AdminNav active="news" />
          <header class="admin-reserve__header">
            <h1><i class="fa-regular fa-bell"></i> お知らせ管理</h1>
            <p class="admin-reserve__note">トップページ・お知らせ一覧に表示される記事を管理します。</p>
          </header>

          <main class="admin-reserve__main">
            <section class="admin-reserve__panel">
              <button type="button" id="news-new-btn" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-plus"></i> 新規追加
              </button>

              <div id="news-list" class="admin-post__list">
                <p class="admin-reserve__loading">読み込み中...</p>
              </div>
            </section>
          </main>
        </div>

        {/* 編集用モーダル */}
        <div id="news-modal" class="admin-modal" hidden>
          <div class="admin-modal__box">
            <h2 id="news-modal-title">お知らせを追加</h2>
            <form id="news-form">
              <input type="hidden" id="news-id" />
              <label for="news-title">タイトル<span class="admin-required">必須</span></label>
              <input type="text" id="news-title" required />

              <label for="news-published-at">公開日<span class="admin-required">必須</span></label>
              <input type="date" id="news-published-at" required />

              <label for="news-body">本文</label>
              <textarea id="news-body" rows={8}></textarea>

              <label class="admin-checkbox">
                <input type="checkbox" id="news-is-published" checked />
                公開する（チェックを外すと非公開・サイトには表示されません）
              </label>

              <div id="news-form-msg" class="admin-reserve__msg"></div>

              <div class="admin-modal__actions">
                <button type="button" id="news-cancel-btn" class="btn btn-outline btn-sm">キャンセル</button>
                <button type="submit" id="news-save-btn" class="btn btn-primary btn-sm">保存</button>
              </div>
            </form>
          </div>
        </div>

        <script src="/static/admin-post.js"></script>
        <script src="/static/admin-news.js"></script>
      </body>
    </html>
  )
}
