// お知らせ・ブログ管理画面の共通ユーティリティ
// admin-news.js / admin-blog.js から window.AdminPost として利用する。
window.AdminPost = (() => {
  const escapeHtml = (str) => {
    if (str === null || str === undefined) return ''
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
  }

  const showMsg = (el, text, isError) => {
    if (!el) return
    el.textContent = text
    el.classList.toggle('is-error', !!isError)
    el.classList.toggle('is-success', !isError)
    if (text) {
      window.setTimeout(() => {
        el.textContent = ''
        el.classList.remove('is-error', 'is-success')
      }, 3000)
    }
  }

  const todayStr = () => {
    const d = new Date()
    const pad2 = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  }

  return { escapeHtml, showMsg, todayStr }
})()
