// 管理画面共通のヘッダーナビゲーション。
// このプロジェクトはWeb予約システム専用のため、予約枠管理のみを持つ。
type Props = {
  active: 'dashboard' | 'reserve'
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
    </nav>
  )
}
