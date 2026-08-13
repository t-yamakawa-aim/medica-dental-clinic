document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('admin-date-input')
  const prevBtn = document.getElementById('admin-date-prev')
  const nextBtn = document.getElementById('admin-date-next')
  const todayBtn = document.getElementById('admin-date-today')
  const newSlotTime = document.getElementById('admin-new-slot-time')
  const addSlotBtn = document.getElementById('admin-add-slot-btn')
  const addSlotMsg = document.getElementById('admin-add-slot-msg')
  const bulkStart = document.getElementById('admin-bulk-start')
  const bulkEnd = document.getElementById('admin-bulk-end')
  const bulkAddBtn = document.getElementById('admin-bulk-add-btn')
  const slotsList = document.getElementById('admin-slots-list')

  const courseSelect = document.getElementById('admin-course-select')
  const courseHygienistWrap = document.getElementById('admin-course-hygienist-wrap')
  const courseHygienistSelect = document.getElementById('admin-course-hygienist')

  const courseSettingsList = document.getElementById('admin-course-settings-list')
  const hygienistsList = document.getElementById('admin-hygienists-list')
  const newHygienistName = document.getElementById('admin-new-hygienist-name')
  const addHygienistBtn = document.getElementById('admin-add-hygienist-btn')
  const hygienistMsg = document.getElementById('admin-hygienist-msg')

  if (!dateInput || !slotsList) return

  const ALLOWED_DURATIONS = [30, 45, 60]

  // メモリ上に保持する現在のコース設定一覧・スタッフ一覧
  let courses = [] // [{ course_type, label, duration_minutes }]
  let hygienists = [] // [{ id, name, is_active, sort_order }]

  const pad2 = (n) => String(n).padStart(2, '0')

  const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

  const parseDateStr = (s) => {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const addMinutes = (time, minutes) => {
    const [h, m] = time.split(':').map(Number)
    const total = h * 60 + m + minutes
    const hh = Math.floor(total / 60) % 24
    const mm = total % 60
    return `${pad2(hh)}:${pad2(mm)}`
  }

  const currentCourse = () => courses.find((c) => c.course_type === courseSelect.value) || null

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

  const setDate = (dateStr) => {
    dateInput.value = dateStr
    loadSlots(dateStr)
  }

  const shiftDate = (days) => {
    const cur = dateInput.value ? parseDateStr(dateInput.value) : new Date()
    cur.setDate(cur.getDate() + days)
    setDate(toDateStr(cur))
  }

  // ============================================================
  // コース選択セレクトの更新（担当スタッフ選択の表示切り替え含む）
  // ============================================================
  const renderCourseSelect = () => {
    const prevValue = courseSelect.value
    courseSelect.innerHTML = ''
    courses.forEach((course) => {
      const opt = document.createElement('option')
      opt.value = course.course_type
      opt.textContent = `${course.label}（${course.duration_minutes}分）`
      courseSelect.appendChild(opt)
    })
    if (prevValue && courses.some((c) => c.course_type === prevValue)) {
      courseSelect.value = prevValue
    }
    updateHygienistVisibility()
  }

  const renderCourseHygienistSelect = () => {
    courseHygienistSelect.innerHTML = ''
    hygienists
      .filter((h) => h.is_active)
      .forEach((h) => {
        const opt = document.createElement('option')
        opt.value = String(h.id)
        opt.textContent = h.name
        courseHygienistSelect.appendChild(opt)
      })
  }

  const updateHygienistVisibility = () => {
    const course = currentCourse()
    const needsHygienist = course && course.course_type === 'initial_maintenance'
    courseHygienistWrap.style.display = needsHygienist ? '' : 'none'
  }

  courseSelect.addEventListener('change', () => {
    updateHygienistVisibility()
    loadSlots(dateInput.value)
  })

  // ============================================================
  // コース設定パネル（所要時間 30/45/60分から選択）
  // ============================================================
  const renderCourseSettingsPanel = () => {
    courseSettingsList.innerHTML = ''
    if (courses.length === 0) {
      courseSettingsList.innerHTML = '<p class="admin-reserve__empty">コース設定がありません。</p>'
      return
    }
    courses.forEach((course) => {
      const row = document.createElement('div')
      row.className = 'admin-course-settings__row'

      const label = document.createElement('span')
      label.className = 'admin-course-settings__label'
      label.textContent = course.label
      row.appendChild(label)

      const select = document.createElement('select')
      select.className = 'admin-course-settings__duration-select'
      ALLOWED_DURATIONS.forEach((d) => {
        const opt = document.createElement('option')
        opt.value = String(d)
        opt.textContent = `${d}分`
        if (d === course.duration_minutes) opt.selected = true
        select.appendChild(opt)
      })
      row.appendChild(select)

      const saveBtn = document.createElement('button')
      saveBtn.type = 'button'
      saveBtn.className = 'btn btn-outline btn-sm'
      saveBtn.textContent = '保存'
      saveBtn.addEventListener('click', async () => {
        const newDuration = Number(select.value)
        saveBtn.disabled = true
        try {
          const res = await fetch(`/api/admin/course-settings/${encodeURIComponent(course.course_type)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration_minutes: newDuration }),
          })
          const data = await res.json().catch(() => ({ ok: false }))
          if (data.ok) {
            course.duration_minutes = newDuration
            renderCourseSelect()
            showMsg(rowMsg, '保存しました', false)
          } else {
            showMsg(rowMsg, '保存に失敗しました', true)
          }
        } catch (e) {
          showMsg(rowMsg, '通信エラーが発生しました', true)
        } finally {
          saveBtn.disabled = false
        }
      })
      row.appendChild(saveBtn)

      const rowMsg = document.createElement('span')
      rowMsg.className = 'admin-reserve__msg'
      row.appendChild(rowMsg)

      courseSettingsList.appendChild(row)
    })
  }

  const loadCourseSettings = async () => {
    try {
      const res = await fetch('/api/admin/course-settings')
      const data = await res.json()
      if (data.ok) {
        courses = data.courses
      } else {
        courses = []
      }
    } catch (e) {
      courses = []
    }
    renderCourseSettingsPanel()
    renderCourseSelect()
  }

  // ============================================================
  // 歯科衛生士（スタッフ）管理パネル
  // ============================================================
  const renderHygienistsPanel = () => {
    hygienistsList.innerHTML = ''
    if (hygienists.length === 0) {
      hygienistsList.innerHTML = '<p class="admin-reserve__empty">まだスタッフが登録されていません。</p>'
      return
    }
    hygienists.forEach((h) => {
      const row = document.createElement('div')
      row.className = `admin-hygienists__row ${h.is_active ? '' : 'is-inactive'}`

      const nameInput = document.createElement('input')
      nameInput.type = 'text'
      nameInput.className = 'admin-hygienists__name-input'
      nameInput.value = h.name

      const statusBadge = document.createElement('span')
      statusBadge.className = `admin-hygienists__badge ${h.is_active ? 'is-active' : 'is-inactive'}`
      statusBadge.textContent = h.is_active ? '稼働中' : '休職中'

      const saveBtn = document.createElement('button')
      saveBtn.type = 'button'
      saveBtn.className = 'btn btn-outline btn-sm'
      saveBtn.textContent = '保存'
      saveBtn.addEventListener('click', async () => {
        const newName = nameInput.value.trim()
        if (!newName) {
          showMsg(hygienistMsg, '名前を入力してください', true)
          return
        }
        await updateHygienist(h.id, { name: newName })
      })

      const toggleBtn = document.createElement('button')
      toggleBtn.type = 'button'
      toggleBtn.className = 'btn btn-outline btn-sm'
      toggleBtn.textContent = h.is_active ? '休職にする' : '稼働に戻す'
      toggleBtn.addEventListener('click', async () => {
        await updateHygienist(h.id, { is_active: h.is_active ? 0 : 1 })
      })

      const delBtn = document.createElement('button')
      delBtn.type = 'button'
      delBtn.className = 'btn btn-outline btn-sm admin-reserve__slot-btn'
      delBtn.textContent = '削除'
      delBtn.addEventListener('click', async () => {
        if (!window.confirm(`「${h.name}」さんを削除しますか？`)) return
        try {
          const res = await fetch(`/api/admin/hygienists/${h.id}`, { method: 'DELETE' })
          const data = await res.json().catch(() => ({ ok: false }))
          if (data.ok) {
            await loadHygienists()
            showMsg(hygienistMsg, '削除しました', false)
          } else if (data.error === 'hygienist_in_use') {
            window.alert('この方は既に予約枠に紐づいているため削除できません。「休職にする」をご利用ください。')
          } else {
            showMsg(hygienistMsg, '削除に失敗しました', true)
          }
        } catch (e) {
          showMsg(hygienistMsg, '通信エラーが発生しました', true)
        }
      })

      row.appendChild(nameInput)
      row.appendChild(statusBadge)
      row.appendChild(saveBtn)
      row.appendChild(toggleBtn)
      row.appendChild(delBtn)
      hygienistsList.appendChild(row)
    })
  }

  const updateHygienist = async (id, body) => {
    try {
      const res = await fetch(`/api/admin/hygienists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({ ok: false }))
      if (data.ok) {
        showMsg(hygienistMsg, '更新しました', false)
        await loadHygienists()
      } else {
        showMsg(hygienistMsg, '更新に失敗しました', true)
      }
    } catch (e) {
      showMsg(hygienistMsg, '通信エラーが発生しました', true)
    }
  }

  const loadHygienists = async () => {
    try {
      const res = await fetch('/api/admin/hygienists')
      const data = await res.json()
      if (data.ok) {
        hygienists = data.items
      } else {
        hygienists = []
      }
    } catch (e) {
      hygienists = []
    }
    renderHygienistsPanel()
    renderCourseHygienistSelect()
    updateHygienistVisibility()
  }

  addHygienistBtn &&
    addHygienistBtn.addEventListener('click', async () => {
      const name = newHygienistName.value.trim()
      if (!name) {
        showMsg(hygienistMsg, '名前を入力してください', true)
        return
      }
      addHygienistBtn.disabled = true
      try {
        const res = await fetch('/api/admin/hygienists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data.ok) {
          newHygienistName.value = ''
          showMsg(hygienistMsg, '追加しました', false)
          await loadHygienists()
        } else {
          showMsg(hygienistMsg, '追加に失敗しました', true)
        }
      } catch (e) {
        showMsg(hygienistMsg, '通信エラーが発生しました', true)
      } finally {
        addHygienistBtn.disabled = false
      }
    })

  // ============================================================
  // 予約枠一覧の表示
  // ============================================================
  const weekdayLabel = (dateStr) => {
    const d = parseDateStr(dateStr)
    const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
    return `${d.getMonth() + 1}月${d.getDate()}日（${w}）`
  }

  const courseLabel = (courseType) => {
    const course = courses.find((c) => c.course_type === courseType)
    return course ? course.label : courseType
  }

  const renderSlots = (slots) => {
    slotsList.innerHTML = ''
    if (!slots || slots.length === 0) {
      slotsList.innerHTML = '<p class="admin-reserve__empty">この日の枠はまだ登録されていません。</p>'
      return
    }

    slots.forEach((slot) => {
      const item = document.createElement('div')
      const isBooked = slot.status === 'booked'
      item.className = `admin-reserve__slot-item ${isBooked ? 'is-booked' : 'is-open'}`

      const timeRange = document.createElement('div')
      timeRange.className = 'admin-reserve__slot-time'
      timeRange.textContent = `${slot.start_time} 〜 ${slot.end_time}`
      item.appendChild(timeRange)

      const courseBadge = document.createElement('span')
      courseBadge.className = 'admin-reserve__slot-course'
      courseBadge.textContent = slot.hygienist_name
        ? `${courseLabel(slot.course_type)}（${slot.hygienist_name}）`
        : courseLabel(slot.course_type)
      item.appendChild(courseBadge)

      const statusBadge = document.createElement('span')
      statusBadge.className = `admin-reserve__slot-badge ${isBooked ? 'is-booked' : 'is-open'}`
      statusBadge.textContent = isBooked ? '予約あり' : '空き'
      item.appendChild(statusBadge)

      if (isBooked) {
        const info = document.createElement('div')
        info.className = 'admin-reserve__slot-patient'
        const rows = [
          ['氏名', slot.name],
          ['フリガナ', slot.kana],
          ['電話番号', slot.phone],
          ['メール', slot.email],
          ['生年月日', slot.birth_date],
          ['症状', slot.symptom],
          ['メッセージ', slot.message],
        ]
        rows.forEach(([label, value]) => {
          if (!value) return
          const row = document.createElement('div')
          row.className = 'admin-reserve__slot-patient-row'
          row.innerHTML = `<span class="admin-reserve__slot-patient-label">${label}</span><span class="admin-reserve__slot-patient-value"></span>`
          row.querySelector('.admin-reserve__slot-patient-value').textContent = value
          info.appendChild(row)
        })
        item.appendChild(info)

        const cancelBtn = document.createElement('button')
        cancelBtn.type = 'button'
        cancelBtn.className = 'btn btn-outline btn-sm admin-reserve__slot-btn'
        cancelBtn.textContent = '予約キャンセル'
        cancelBtn.addEventListener('click', async () => {
          if (!window.confirm('この予約をキャンセルしますか？')) return
          try {
            const res = await fetch(`/api/admin/reserve/slots/${slot.id}/cancel`, { method: 'POST' })
            const data = await res.json().catch(() => ({ ok: false }))
            if (data.ok) {
              loadSlots(dateInput.value)
            } else {
              window.alert('キャンセルに失敗しました。')
            }
          } catch (e) {
            window.alert('通信エラーが発生しました。')
          }
        })
        item.appendChild(cancelBtn)
      } else {
        const delBtn = document.createElement('button')
        delBtn.type = 'button'
        delBtn.className = 'btn btn-outline btn-sm admin-reserve__slot-btn'
        delBtn.textContent = '削除'
        delBtn.addEventListener('click', async () => {
          if (!window.confirm('この枠を削除しますか？')) return
          try {
            const res = await fetch(`/api/admin/reserve/slots/${slot.id}`, { method: 'DELETE' })
            const data = await res.json().catch(() => ({ ok: false }))
            if (data.ok) {
              loadSlots(dateInput.value)
            } else if (data.error === 'slot_booked') {
              window.alert('予約が入っているため削除できません。')
            } else {
              window.alert('削除に失敗しました。')
            }
          } catch (e) {
            window.alert('通信エラーが発生しました。')
          }
        })
        item.appendChild(delBtn)
      }

      slotsList.appendChild(item)
    })
  }

  const loadSlots = async (dateStr) => {
    slotsList.innerHTML = '<p class="admin-reserve__loading">読み込み中...</p>'
    try {
      const res = await fetch(`/api/admin/reserve/slots?date=${encodeURIComponent(dateStr)}`)
      const data = await res.json()
      if (data.ok) {
        renderSlots(data.slots)
      } else {
        slotsList.innerHTML = '<p class="admin-reserve__empty">読み込みに失敗しました。</p>'
      }
    } catch (e) {
      slotsList.innerHTML = '<p class="admin-reserve__empty">通信エラーが発生しました。</p>'
    }
  }

  // ============================================================
  // 枠追加（単発・一括）
  // ============================================================
  const buildSlotBody = (dateStr, time) => {
    const course = currentCourse()
    const body = { slot_date: dateStr, start_time: time, course_type: course ? course.course_type : '' }
    if (course && course.course_type === 'initial_maintenance') {
      body.hygienist_id = Number(courseHygienistSelect.value)
    }
    return body
  }

  addSlotBtn &&
    addSlotBtn.addEventListener('click', async () => {
      const course = currentCourse()
      if (!course) {
        showMsg(addSlotMsg, 'コースを選択してください。', true)
        return
      }
      if (course.course_type === 'initial_maintenance' && !courseHygienistSelect.value) {
        showMsg(addSlotMsg, '担当スタッフを選択してください。', true)
        return
      }
      const time = newSlotTime.value
      const dateStr = dateInput.value
      if (!dateStr || !time) {
        showMsg(addSlotMsg, '日付と時刻を指定してください。', true)
        return
      }
      addSlotBtn.disabled = true
      try {
        const res = await fetch('/api/admin/reserve/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildSlotBody(dateStr, time)),
        })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data.ok) {
          showMsg(addSlotMsg, `追加しました（${time}〜${addMinutes(time, course.duration_minutes)}）`, false)
          loadSlots(dateStr)
        } else if (data.error === 'slot_already_exists') {
          showMsg(addSlotMsg, 'その時刻の枠は既に登録済みです。', true)
        } else if (data.error === 'hygienist_required') {
          showMsg(addSlotMsg, '担当スタッフを選択してください。', true)
        } else {
          showMsg(addSlotMsg, '追加に失敗しました。', true)
        }
      } catch (e) {
        showMsg(addSlotMsg, '通信エラーが発生しました。', true)
      } finally {
        addSlotBtn.disabled = false
      }
    })

  // ---- 一括追加（コースの所要時間ごと） ----
  bulkAddBtn &&
    bulkAddBtn.addEventListener('click', async () => {
      const course = currentCourse()
      if (!course) {
        showMsg(addSlotMsg, 'コースを選択してください。', true)
        return
      }
      if (course.course_type === 'initial_maintenance' && !courseHygienistSelect.value) {
        showMsg(addSlotMsg, '担当スタッフを選択してください。', true)
        return
      }
      const dateStr = dateInput.value
      const start = bulkStart.value
      const end = bulkEnd.value
      if (!dateStr || !start || !end) {
        showMsg(addSlotMsg, '日付・開始・終了時刻を指定してください。', true)
        return
      }

      const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number)
        return h * 60 + m
      }
      const startMin = toMinutes(start)
      const endMin = toMinutes(end)
      const duration = course.duration_minutes
      if (endMin <= startMin) {
        showMsg(addSlotMsg, '終了時刻は開始時刻より後にしてください。', true)
        return
      }

      const times = []
      for (let t = startMin; t + duration <= endMin; t += duration) {
        const hh = pad2(Math.floor(t / 60))
        const mm = pad2(t % 60)
        times.push(`${hh}:${mm}`)
      }

      if (times.length === 0) {
        showMsg(addSlotMsg, '追加できる枠がありません。', true)
        return
      }

      bulkAddBtn.disabled = true
      let successCount = 0
      let skipCount = 0
      for (const time of times) {
        try {
          const res = await fetch('/api/admin/reserve/slots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildSlotBody(dateStr, time)),
          })
          const data = await res.json().catch(() => ({ ok: false }))
          if (data.ok) {
            successCount += 1
          } else {
            skipCount += 1
          }
        } catch (e) {
          skipCount += 1
        }
      }
      bulkAddBtn.disabled = false
      showMsg(addSlotMsg, `${successCount}件追加しました${skipCount > 0 ? `（${skipCount}件は既存のためスキップ）` : ''}`, false)
      loadSlots(dateStr)
    })

  // ---- 初期化 ----
  prevBtn && prevBtn.addEventListener('click', () => shiftDate(-1))
  nextBtn && nextBtn.addEventListener('click', () => shiftDate(1))
  todayBtn && todayBtn.addEventListener('click', () => setDate(toDateStr(new Date())))
  dateInput.addEventListener('change', () => {
    if (dateInput.value) loadSlots(dateInput.value)
  })

  ;(async () => {
    await loadHygienists()
    await loadCourseSettings()
    setDate(toDateStr(new Date()))
  })()
})
