import { AdminNav } from './AdminLayout'

// クリニック管理者向けの管理トップページ。
export const AdminDashboardPage = () => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>管理トップ｜メディカデンタルクリニック 予約システム</title>
        <meta name="robots" content="noindex, nofollow" />
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>
        <div class="admin-reserve">
          <AdminNav active="dashboard" />
          <header class="admin-reserve__header">
            <h1><i class="fa-solid fa-gauge"></i> クリニック管理トップ</h1>
            <p class="admin-reserve__note">Web予約枠の管理はこちらから行えます。</p>
          </header>

          <main class="admin-reserve__main">
            <div class="admin-dashboard__cards">
              <a href="/admin/reserve" class="admin-dashboard__card">
                <i class="fa-regular fa-calendar-check"></i>
                <h2>Web予約枠管理</h2>
                <p>予約枠の追加・削除、予約者情報の確認・キャンセルができます。</p>
              </a>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
