document.addEventListener('DOMContentLoaded', () => {
  const { escapeHtml, showMsg, todayStr } = window.AdminPost

  const listEl = document.getElementById('blog-list')
  const newBtn = document.getElementById('blog-new-btn')
  const modal = document.getElementById('blog-modal')
  const modalTitle = document.getElementById('blog-modal-title')
  const form = document.getElementById('blog-form')
  const idInput = document.getElementById('blog-id')
  const titleInput = document.getElementById('blog-title')
  const publishedAtInput = document.getElementById('blog-published-at')
  const categoryInput = document.getElementById('blog-category')
  const bodyInput = document.getElementById('blog-body')
  const isPublishedInput = document.getElementById('blog-is-published')
  const formMsg = document.getElementById('blog-form-msg')
  const cancelBtn = document.getElementById('blog-cancel-btn')

  const thumbPreview = document.getElementById('blog-thumbnail-preview')
  const thumbFileInput = document.getElementById('blog-thumbnail-file')
  const thumbClearBtn = document.getElementById('blog-thumbnail-clear')
  const thumbUrlInput = document.getElementById('blog-thumbnail-url')
  const uploadMsg = document.getElementById('blog-upload-msg')

  if (!listEl) return

  const setThumbPreview = (url) => {
    thumbUrlInput.value = url || ''
    if (url) {
      thumbPreview.src = url
      thumbPreview.hidden = false
      thumbClearBtn.hidden = false
    } else {
      thumbPreview.src = ''
      thumbPreview.hidden = true
      thumbClearBtn.hidden = true
    }
  }

  const openModal = (item) => {
    form.reset()
    thumbFileInput.value = ''
    if (item) {
      modalTitle.textContent = 'ブログ記事を編集'
      idInput.value = item.id
      titleInput.value = item.title || ''
      publishedAtInput.value = item.published_at || todayStr()
      categoryInput.value = item.category || ''
      bodyInput.value = item.body || ''
      isPublishedInput.checked = item.is_published !== 0
      setThumbPreview(item.thumbnail_url || '')
    } else {
      modalTitle.textContent = 'ブログ記事を追加'
      idInput.value = ''
      publishedAtInput.value = todayStr()
      isPublishedInput.checked = true
      setThumbPreview('')
    }
    modal.hidden = false
  }

  const closeModal = () => {
    modal.hidden = true
  }

  const renderList = (items) => {
    listEl.innerHTML = ''
    if (!items || items.length === 0) {
      listEl.innerHTML = '<p class="admin-reserve__empty">ブログ記事はまだ登録されていません。</p>'
      return
    }
    items.forEach((item) => {
      const row = document.createElement('div')
      row.className = `admin-post__item ${item.is_published ? '' : 'is-hidden'}`

      if (item.thumbnail_url) {
        const thumb = document.createElement('img')
        thumb.className = 'admin-post__item-thumb'
        thumb.src = item.thumbnail_url
        row.appendChild(thumb)
      }

      const main = document.createElement('div')
      main.className = 'admin-post__item-main'
      main.innerHTML = `
        <span class="admin-post__date">${escapeHtml(item.published_at)}</span>
        ${item.category ? `<span class="admin-post__category">${escapeHtml(item.category)}</span>` : ''}
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
          const res = await fetch(`/api/admin/blog/${item.id}`, { method: 'DELETE' })
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
      const res = await fetch('/api/admin/blog')
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
  thumbClearBtn && thumbClearBtn.addEventListener('click', () => setThumbPreview(''))

  // ---- サムネイル画像アップロード ----
  thumbFileInput &&
    thumbFileInput.addEventListener('change', async () => {
      const file = thumbFileInput.files && thumbFileInput.files[0]
      if (!file) return

      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowed.includes(file.type)) {
        showMsg(uploadMsg, '対応していない画像形式です（JPEG/PNG/WEBP/GIFのみ）。', true)
        thumbFileInput.value = ''
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showMsg(uploadMsg, '画像サイズは5MB以下にしてください。', true)
        thumbFileInput.value = ''
        return
      }

      showMsg(uploadMsg, 'アップロード中...', false)
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data.ok) {
          setThumbPreview(data.url)
          showMsg(uploadMsg, 'アップロードしました。', false)
        } else {
          showMsg(uploadMsg, 'アップロードに失敗しました。', true)
        }
      } catch (e) {
        showMsg(uploadMsg, '通信エラーが発生しました。', true)
      } finally {
        thumbFileInput.value = ''
      }
    })

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
        category: categoryInput.value.trim(),
        thumbnail_url: thumbUrlInput.value.trim(),
        body: bodyInput.value.trim(),
        is_published: isPublishedInput.checked,
      }
      const id = idInput.value
      const url = id ? `/api/admin/blog/${id}` : '/api/admin/blog'
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
