// 管理画面共通のヘッダーナビゲーション。
// /admin/reserve, /admin/news, /admin/blog の各ページから読み込む。
type Props = {
  active: 'dashboard' | 'reserve' | 'news' | 'blog'
}

export const AdminNav = ({ active }: Props) => {
  const item = (href: string, key: string, icon: string, label: string) => (
    <a href={href} class={`admin-nav__link ${active === key ? 'is-active' : ''}`}>
      <i class={icon}></i> {label}
    </a>
  )
  return (
    <nav class="admin-nav">
      {item('/admin', 'dashboard', 'fa-solid fa-gauge', '管理トップ')}
      {item('/admin/reserve', 'reserve', 'fa-regular fa-calendar-check', 'Web予約枠')}
      {item('/admin/news', 'news', 'fa-regular fa-bell', 'お知らせ')}
      {item('/admin/blog', 'blog', 'fa-regular fa-newspaper', 'ブログ')}
    </nav>
  )
}
