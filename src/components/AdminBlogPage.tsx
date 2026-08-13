import { AdminNav } from './AdminLayout'

// クリニック側: ブログ管理画面。サムネイル画像はR2にアップロードして保存する。
export const AdminBlogPage = () => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ブログ管理｜メディカデンタルクリニック</title>
        <meta name="robots" content="noindex, nofollow" />
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>
        <div class="admin-reserve">
          <AdminNav active="blog" />
          <header class="admin-reserve__header">
            <h1><i class="fa-regular fa-newspaper"></i> ブログ管理</h1>
            <p class="admin-reserve__note">ブログ記事の追加・編集・削除、サムネイル画像のアップロードができます。</p>
          </header>

          <main class="admin-reserve__main">
            <section class="admin-reserve__panel">
              <button type="button" id="blog-new-btn" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-plus"></i> 新規追加
              </button>

              <div id="blog-list" class="admin-post__list">
                <p class="admin-reserve__loading">読み込み中...</p>
              </div>
            </section>
          </main>
        </div>

        {/* 編集用モーダル */}
        <div id="blog-modal" class="admin-modal" hidden>
          <div class="admin-modal__box">
            <h2 id="blog-modal-title">ブログ記事を追加</h2>
            <form id="blog-form">
              <input type="hidden" id="blog-id" />
              <label for="blog-title">タイトル<span class="admin-required">必須</span></label>
              <input type="text" id="blog-title" required />

              <label for="blog-published-at">公開日<span class="admin-required">必須</span></label>
              <input type="date" id="blog-published-at" required />

              <label for="blog-category">カテゴリ</label>
              <input type="text" id="blog-category" placeholder="例：虫歯治療、矯正、インプラント" />

              <label for="blog-thumbnail">サムネイル画像</label>
              <div class="admin-post__thumb-row">
                <img id="blog-thumbnail-preview" class="admin-post__thumb-preview" hidden />
                <input type="file" id="blog-thumbnail-file" accept="image/jpeg,image/png,image/webp,image/gif" />
                <button type="button" id="blog-thumbnail-clear" class="btn btn-outline btn-sm" hidden>画像を削除</button>
              </div>
              <input type="hidden" id="blog-thumbnail-url" />
              <p id="blog-upload-msg" class="admin-reserve__msg"></p>

              <label for="blog-body">本文</label>
              <textarea id="blog-body" rows={10}></textarea>

              <label class="admin-checkbox">
                <input type="checkbox" id="blog-is-published" checked />
                公開する（チェックを外すと非公開・サイトには表示されません）
              </label>

              <div id="blog-form-msg" class="admin-reserve__msg"></div>

              <div class="admin-modal__actions">
                <button type="button" id="blog-cancel-btn" class="btn btn-outline btn-sm">キャンセル</button>
                <button type="submit" id="blog-save-btn" class="btn btn-primary btn-sm">保存</button>
              </div>
            </form>
          </div>
        </div>

        <script src="/static/admin-post.js"></script>
        <script src="/static/admin-blog.js"></script>
      </body>
    </html>
  )
}
