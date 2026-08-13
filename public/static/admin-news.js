document.addEventListener('DOMContentLoaded', () => {
  const { escapeHtml, showMsg, todayStr } = window.AdminPost

  const listEl = document.getElementById('news-list')
  const newBtn = document.getElementById('news-new-btn')
  const modal = document.getElementById('news-modal')
  const modalTitle = document.getElementById('news-modal-title')
  const form = document.getElementById('news-form')
  const idInput = document.getElementById('news-id')
  const titleInput = document.getElementById('news-title')
  const publishedAtInput = document.getElementById('news-published-at')
  const bodyInput = document.getElementById('news-body')
  const isPublishedInput = document.getElementById('news-is-published')
  const formMsg = document.getElementById('news-form-msg')
  const cancelBtn = document.getElementById('news-cancel-btn')

  if (!listEl) return

  const openModal = (item) => {
    form.reset()
    if (item) {
      modalTitle.textContent = 'お知らせを編集'
      idInput.value = item.id
      titleInput.value = item.title || ''
      publishedAtInput.value = item.published_at || todayStr()
      bodyInput.value = item.body || ''
      isPublishedInput.checked = item.is_published !== 0
    } else {
      modalTitle.textContent = 'お知らせを追加'
      idInput.value = ''
      publishedAtInput.value = todayStr()
      isPublishedInput.checked = true
    }
    modal.hidden = false
  }

  const closeModal = () => {
    modal.hidden = true
  }

  const renderList = (items) => {
    listEl.innerHTML = ''
    if (!items || items.length === 0) {
      listEl.innerHTML = '<p class="admin-reserve__empty">お知らせはまだ登録されていません。</p>'
      return
    }
    items.forEach((item) => {
      const row = document.createElement('div')
      row.className = `admin-post__item ${item.is_published ? '' : 'is-hidden'}`

      const main = document.createElement('div')
      main.className = 'admin-post__item-main'
      main.innerHTML = `
        <span class="admin-post__date">${escapeHtml(item.published_at)}</span>
        <span class="admin-post__title">${escapeHtml(item.title)}</span>
        ${item.is_published ? '' : '<span class="admin-post__badge">非公開</span>'}
      `
      row.appendChild(main)

      const actions = document.createElement('div')
      actions.className = 'admin-post__item-actions'

      const editBtn = document.createElement('button')
      editBtn.type = 'button'
      editBtn.className = 'btn btn-outline btn-sm'
      editBtn.textContent = '編集'
      editBtn.addEventListener('click', () => openModal(item))
      actions.appendChild(editBtn)

      const delBtn = document.createElement('button')
      delBtn.type = 'button'
      delBtn.className = 'btn btn-outline btn-sm'
      delBtn.textContent = '削除'
      delBtn.addEventListener('click', async () => {
        if (!window.confirm(`「${item.title}」を削除しますか？この操作は取り消せません。`)) return
        try {
          const res = await fetch(`/api/admin/news/${item.id}`, { method: 'DELETE' })
          const data = await res.json().catch(() => ({ ok: false }))
          if (data.ok) {
            loadList()
          } else {
            window.alert('削除に失敗しました。')
          }
        } catch (e) {
          window.alert('通信エラーが発生しました。')
        }
      })
      actions.appendChild(delBtn)

      row.appendChild(actions)
      listEl.appendChild(row)
    })
  }

  const loadList = async () => {
    listEl.innerHTML = '<p class="admin-reserve__loading">読み込み中...</p>'
    try {
      const res = await fetch('/api/admin/news')
      const data = await res.json()
      if (data.ok) {
        renderList(data.items)
      } else {
        listEl.innerHTML = '<p class="admin-reserve__empty">読み込みに失敗しました。</p>'
      }
    } catch (e) {
      listEl.innerHTML = '<p class="admin-reserve__empty">通信エラーが発生しました。</p>'
    }
  }

  newBtn && newBtn.addEventListener('click', () => openModal(null))
  cancelBtn && cancelBtn.addEventListener('click', closeModal)

  form &&
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const title = titleInput.value.trim()
      const publishedAt = publishedAtInput.value
      if (!title || !publishedAt) {
        showMsg(formMsg, 'タイトルと公開日は必須です。', true)
        return
      }

      const payload = {
        title,
        published_at: publishedAt,
        body: bodyInput.value.trim(),
        is_published: isPublishedInput.checked,
      }
      const id = idInput.value
      const url = id ? `/api/admin/news/${id}` : '/api/admin/news'
      const method = id ? 'PUT' : 'POST'

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data.ok) {
          closeModal()
          loadList()
        } else {
          showMsg(formMsg, '保存に失敗しました。', true)
        }
      } catch (e) {
        showMsg(formMsg, '通信エラーが発生しました。', true)
      }
    })

  loadList()
})
