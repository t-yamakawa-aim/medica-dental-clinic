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
  const courseStaffWrap = document.getElementById('admin-course-staff-wrap')
  const courseStaffSelect = document.getElementById('admin-course-staff')

  const courseSettingsList = document.getElementById('admin-course-settings-list')
  const staffList_el = document.getElementById('admin-staff-list')
  const newStaffRole = document.getElementById('admin-new-staff-role')
  const newStaffName = document.getElementById('admin-new-staff-name')
  const addStaffBtn = document.getElementById('admin-add-staff-btn')
  const staffMsg = document.getElementById('admin-staff-msg')

  const timeoffStaffSelect = document.getElementById('admin-timeoff-staff')
  const timeoffDateInput = document.getElementById('admin-timeoff-date')
  const timeoffAllDayCheckbox = document.getElementById('admin-timeoff-allday')
  const timeoffTimeRangeWrap = document.getElementById('admin-timeoff-time-range')
  const timeoffStartInput = document.getElementById('admin-timeoff-start')
  const timeoffEndInput = document.getElementById('admin-timeoff-end')
  const timeoffReasonInput = document.getElementById('admin-timeoff-reason')
  const timeoffAddBtn = document.getElementById('admin-timeoff-add-btn')
  const timeoffMsg = document.getElementById('admin-timeoff-msg')
  const timeoffList = document.getElementById('admin-timeoff-list')

  if (!dateInput || !slotsList) return

  const ALLOWED_DURATIONS = [30, 45, 60]

  // コース種別ごとに担当する役割（初診=歯科医師 / 初診メンテナンス=歯科衛生士）
  const ROLE_FOR_COURSE = { initial_doctor: 'dentist', initial_maintenance: 'hygienist' }
  const roleLabel = (role) => (role === 'dentist' ? '歯科医師' : '歯科衛生士')

  // メモリ上に保持する現在のコース設定一覧・スタッフ一覧・休み一覧
  let courses = [] // [{ course_type, label, duration_minutes }]
  let staffMembers = [] // [{ id, name, role, is_active, sort_order }]
  let timeOffs = [] // [{ id, staff_id, off_date, start_time, end_time, reason }]

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
    updateStaffVisibility()
  }

  const renderCourseStaffSelect = () => {
    const course = currentCourse()
    const role = course ? ROLE_FOR_COURSE[course.course_type] : null
    const prevValue = courseStaffSelect.value
    courseStaffSelect.innerHTML = ''
    staffMembers
      .filter((s) => s.is_active && (!role || s.role === role))
      .forEach((s) => {
        const opt = document.createElement('option')
        opt.value = String(s.id)
        opt.textContent = s.name
        courseStaffSelect.appendChild(opt)
      })
    if (prevValue && Array.from(courseStaffSelect.options).some((o) => o.value === prevValue)) {
      courseStaffSelect.value = prevValue
    }
  }

  const updateStaffVisibility = () => {
    renderCourseStaffSelect()
    courseStaffWrap.style.display = ''
  }

  courseSelect.addEventListener('change', () => {
    updateStaffVisibility()
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
  // スタッフ（歯科医師・歯科衛生士）管理パネル
  // ============================================================
  const renderStaffPanel = () => {
    staffList_el.innerHTML = ''
    if (staffMembers.length === 0) {
      staffList_el.innerHTML = '<p class="admin-reserve__empty">まだスタッフが登録されていません。</p>'
      return
    }

    // 歯科医師→歯科衛生士の順に見出しを分けて表示
    ;['dentist', 'hygienist'].forEach((role) => {
      const group = staffMembers.filter((s) => s.role === role)
      if (group.length === 0) return

      const heading = document.createElement('h3')
      heading.className = 'admin-hygienists__group-title'
      heading.textContent = roleLabel(role)
      staffList_el.appendChild(heading)

      group.forEach((s) => {
        const row = document.createElement('div')
        row.className = `admin-hygienists__row ${s.is_active ? '' : 'is-inactive'}`

        const nameInput = document.createElement('input')
        nameInput.type = 'text'
        nameInput.className = 'admin-hygienists__name-input'
        nameInput.value = s.name

        const statusBadge = document.createElement('span')
        statusBadge.className = `admin-hygienists__badge ${s.is_active ? 'is-active' : 'is-inactive'}`
        statusBadge.textContent = s.is_active ? '稼働中' : '休職中'

        const saveBtn = document.createElement('button')
        saveBtn.type = 'button'
        saveBtn.className = 'btn btn-outline btn-sm'
        saveBtn.textContent = '保存'
        saveBtn.addEventListener('click', async () => {
          const newName = nameInput.value.trim()
          if (!newName) {
            showMsg(staffMsg, '名前を入力してください', true)
            return
          }
          await updateStaff(s.id, { name: newName })
        })

        const toggleBtn = document.createElement('button')
        toggleBtn.type = 'button'
        toggleBtn.className = 'btn btn-outline btn-sm'
        toggleBtn.textContent = s.is_active ? '休職にする' : '稼働に戻す'
        toggleBtn.addEventListener('click', async () => {
          await updateStaff(s.id, { is_active: s.is_active ? 0 : 1 })
        })

        const delBtn = document.createElement('button')
        delBtn.type = 'button'
        delBtn.className = 'btn btn-outline btn-sm admin-reserve__slot-btn'
        delBtn.textContent = '削除'
        delBtn.addEventListener('click', async () => {
          if (!window.confirm(`「${s.name}」さんを削除しますか？`)) return
          try {
            const res = await fetch(`/api/admin/staff/${s.id}`, { method: 'DELETE' })
            const data = await res.json().catch(() => ({ ok: false }))
            if (data.ok) {
              await loadStaff()
              showMsg(staffMsg, '削除しました', false)
            } else if (data.error === 'staff_in_use') {
              window.alert('この方は既に予約枠に紐づいているため削除できません。「休職にする」をご利用ください。')
            } else {
              showMsg(staffMsg, '削除に失敗しました', true)
            }
          } catch (e) {
            showMsg(staffMsg, '通信エラーが発生しました', true)
          }
        })

        row.appendChild(nameInput)
        row.appendChild(statusBadge)
        row.appendChild(saveBtn)
        row.appendChild(toggleBtn)
        row.appendChild(delBtn)
        staffList_el.appendChild(row)
      })
    })
  }

  const updateStaff = async (id, body) => {
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({ ok: false }))
      if (data.ok) {
        showMsg(staffMsg, '更新しました', false)
        await loadStaff()
      } else {
        showMsg(staffMsg, '更新に失敗しました', true)
      }
    } catch (e) {
      showMsg(staffMsg, '通信エラーが発生しました', true)
    }
  }

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff')
      const data = await res.json()
      if (data.ok) {
        staffMembers = data.items
      } else {
        staffMembers = []
      }
    } catch (e) {
      staffMembers = []
    }
    renderStaffPanel()
    renderCourseStaffSelect()
    renderTimeoffStaffSelect()
  }

  addStaffBtn &&
    addStaffBtn.addEventListener('click', async () => {
      const name = newStaffName.value.trim()
      const role = newStaffRole.value
      if (!name) {
        showMsg(staffMsg, '名前を入力してください', true)
        return
      }
      addStaffBtn.disabled = true
      try {
        const res = await fetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, role }),
        })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data.ok) {
          newStaffName.value = ''
          showMsg(staffMsg, '追加しました', false)
          await loadStaff()
        } else {
          showMsg(staffMsg, '追加に失敗しました', true)
        }
      } catch (e) {
        showMsg(staffMsg, '通信エラーが発生しました', true)
      } finally {
        addStaffBtn.disabled = false
      }
    })

  // ============================================================
  // スタッフの休み管理（日付・時間帯単位）
  // 「稼働中/休職中」の固定フラグではなく、
  // 「Aさんは8/20は終日有給」「Bさんは8/21の10:00〜12:00だけお休み」のように
  // 日によって異なる勤務パターンを登録できるようにする。歯科医師・歯科衛生士共通。
  // ============================================================
  const renderTimeoffStaffSelect = () => {
    if (!timeoffStaffSelect) return
    const prevValue = timeoffStaffSelect.value
    timeoffStaffSelect.innerHTML = ''
    staffMembers.forEach((s) => {
      const opt = document.createElement('option')
      opt.value = String(s.id)
      opt.textContent = `${s.name}（${roleLabel(s.role)}）`
      timeoffStaffSelect.appendChild(opt)
    })
    if (prevValue && staffMembers.some((s) => String(s.id) === prevValue)) {
      timeoffStaffSelect.value = prevValue
    }
  }

  const staffName = (id) => {
    const s = staffMembers.find((x) => String(x.id) === String(id))
    return s ? s.name : `スタッフ#${id}`
  }

  const timeoffDateLabel = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    const w = ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()]
    return `${y}年${m}月${d}日（${w}）`
  }

  const renderTimeoffList = () => {
    if (!timeoffList) return
    timeoffList.innerHTML = ''
    if (timeOffs.length === 0) {
      timeoffList.innerHTML = '<p class="admin-reserve__empty">登録されている休みはありません。</p>'
      return
    }
    timeOffs.forEach((t) => {
      const row = document.createElement('div')
      row.className = 'admin-timeoff__row'

      const nameEl = document.createElement('span')
      nameEl.className = 'admin-timeoff__row-name'
      nameEl.textContent = staffName(t.staff_id)
      row.appendChild(nameEl)

      const dateEl = document.createElement('span')
      dateEl.className = 'admin-timeoff__row-date'
      dateEl.textContent = timeoffDateLabel(t.off_date)
      row.appendChild(dateEl)

      const isAllDay = !t.start_time && !t.end_time
      const rangeEl = document.createElement('span')
      rangeEl.className = `admin-timeoff__row-range ${isAllDay ? 'is-allday' : ''}`
      rangeEl.textContent = isAllDay ? '終日' : `${t.start_time}〜${t.end_time}`
      row.appendChild(rangeEl)

      if (t.reason) {
        const reasonEl = document.createElement('span')
        reasonEl.className = 'admin-timeoff__row-reason'
        reasonEl.textContent = t.reason
        row.appendChild(reasonEl)
      }

      const delBtn = document.createElement('button')
      delBtn.type = 'button'
      delBtn.className = 'btn btn-outline btn-sm'
      delBtn.textContent = '削除'
      delBtn.addEventListener('click', async () => {
        if (!window.confirm('この休みの登録を削除しますか？')) return
        try {
          const res = await fetch(`/api/admin/staff-time-off/${t.id}`, { method: 'DELETE' })
          const data = await res.json().catch(() => ({ ok: false }))
          if (data.ok) {
            await loadTimeoffs()
            showMsg(timeoffMsg, '削除しました', false)
          } else {
            showMsg(timeoffMsg, '削除に失敗しました', true)
          }
        } catch (e) {
          showMsg(timeoffMsg, '通信エラーが発生しました', true)
        }
      })
      row.appendChild(delBtn)

      timeoffList.appendChild(row)
    })
  }

  const loadTimeoffs = async () => {
    if (!timeoffList) return
    try {
      const todayStr = toDateStr(new Date())
      const res = await fetch(`/api/admin/staff-time-off?from=${encodeURIComponent(todayStr)}`)
      const data = await res.json()
      timeOffs = data.ok ? data.items : []
    } catch (e) {
      timeOffs = []
    }
    renderTimeoffList()
  }

  timeoffAllDayCheckbox &&
    timeoffAllDayCheckbox.addEventListener('change', () => {
      timeoffTimeRangeWrap.style.display = timeoffAllDayCheckbox.checked ? 'none' : ''
    })

  timeoffAddBtn &&
    timeoffAddBtn.addEventListener('click', async () => {
      const staffId = Number(timeoffStaffSelect.value)
      const offDate = timeoffDateInput.value
      if (!staffId || !offDate) {
        showMsg(timeoffMsg, 'スタッフと日付を指定してください', true)
        return
      }
      const isAllDay = timeoffAllDayCheckbox.checked
      const body = { staff_id: staffId, off_date: offDate, reason: timeoffReasonInput.value.trim() || undefined }
      if (!isAllDay) {
        const start = timeoffStartInput.value
        const end = timeoffEndInput.value
        if (!start || !end) {
          showMsg(timeoffMsg, '時間帯を指定してください', true)
          return
        }
        if (end <= start) {
          showMsg(timeoffMsg, '終了時刻は開始時刻より後にしてください', true)
          return
        }
        body.start_time = start
        body.end_time = end
      }

      timeoffAddBtn.disabled = true
      try {
        const res = await fetch('/api/admin/staff-time-off', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data.ok) {
          showMsg(timeoffMsg, '追加しました', false)
          timeoffReasonInput.value = ''
          await loadTimeoffs()
          loadSlots(dateInput.value)
        } else {
          showMsg(timeoffMsg, '追加に失敗しました', true)
        }
      } catch (e) {
        showMsg(timeoffMsg, '通信エラーが発生しました', true)
      } finally {
        timeoffAddBtn.disabled = false
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
      courseBadge.textContent = slot.staff_name
        ? `${courseLabel(slot.course_type)}（${slot.staff_name}）`
        : courseLabel(slot.course_type)
      item.appendChild(courseBadge)

      const statusBadge = document.createElement('span')
      statusBadge.className = `admin-reserve__slot-badge ${isBooked ? 'is-booked' : 'is-open'}`
      statusBadge.textContent = isBooked ? '予約あり' : '空き'
      item.appendChild(statusBadge)

      if (slot.staff_is_off) {
        const offBadge = document.createElement('span')
        offBadge.className = 'admin-reserve__slot-badge is-hygienist-off'
        offBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 担当者が休みです'
        item.appendChild(offBadge)
      }

      if (isBooked) {
        const info = document.createElement('div')
        info.className = 'admin-reserve__slot-patient'
        const rows = [
          ['患者番号', slot.patient_number],
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
        const btnGroup = document.createElement('div')
        btnGroup.className = 'admin-reserve__slot-btn admin-reserve__slot-btn-group'

        const bookBtn = document.createElement('button')
        bookBtn.type = 'button'
        bookBtn.className = 'btn btn-secondary btn-sm'
        bookBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> 受付で予約登録'
        bookBtn.addEventListener('click', () => {
          openBookModal(slot)
        })
        btnGroup.appendChild(bookBtn)

        const delBtn = document.createElement('button')
        delBtn.type = 'button'
        delBtn.className = 'btn btn-outline btn-sm'
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
        btnGroup.appendChild(delBtn)

        item.appendChild(btnGroup)
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
    body.staff_id = Number(courseStaffSelect.value)
    return body
  }

  addSlotBtn &&
    addSlotBtn.addEventListener('click', async () => {
      const course = currentCourse()
      if (!course) {
        showMsg(addSlotMsg, 'コースを選択してください。', true)
        return
      }
      if (!courseStaffSelect.value) {
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
        } else if (data.error === 'staff_required') {
          showMsg(addSlotMsg, '担当スタッフを選択してください。', true)
        } else if (data.error === 'staff_role_mismatch') {
          showMsg(addSlotMsg, 'このコースに対応する役割のスタッフを選択してください。', true)
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
      if (!courseStaffSelect.value) {
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

  // ============================================================
  // 受付予約登録モーダル（2回目以降の方をスタッフが直接登録する）
  // ============================================================
  const bookModal = document.getElementById('admin-book-modal')
  const bookModalOverlay = document.getElementById('admin-book-modal-overlay')
  const bookModalSlotInfo = document.getElementById('admin-book-modal-slot-info')
  const bookForm = document.getElementById('admin-book-form')
  const bookNameInput = document.getElementById('admin-book-name')
  const bookKanaInput = document.getElementById('admin-book-kana')
  const bookPhoneInput = document.getElementById('admin-book-phone')
  const bookEmailInput = document.getElementById('admin-book-email')
  const bookBirthInput = document.getElementById('admin-book-birth')
  const bookPatientNumberInput = document.getElementById('admin-book-patient-number')
  const bookSymptomInput = document.getElementById('admin-book-symptom')
  const bookMessageInput = document.getElementById('admin-book-message')
  const bookFormError = document.getElementById('admin-book-form-error')
  const bookCancelBtn = document.getElementById('admin-book-cancel-btn')
  const bookSubmitBtn = document.getElementById('admin-book-submit-btn')

  let currentBookSlot = null

  const resetBookForm = () => {
    bookForm && bookForm.reset()
    if (bookFormError) {
      bookFormError.style.display = 'none'
      bookFormError.textContent = ''
    }
  }

  const openBookModal = (slot) => {
    if (!bookModal) return
    currentBookSlot = slot
    resetBookForm()
    const weekday = weekdayLabel(slot.slot_date)
    const courseText = slot.staff_name ? `${courseLabel(slot.course_type)}（${slot.staff_name}）` : courseLabel(slot.course_type)
    bookModalSlotInfo.textContent = `${weekday} ${slot.start_time}〜${slot.end_time}｜${courseText}`
    bookModal.style.display = 'flex'
    window.setTimeout(() => bookNameInput && bookNameInput.focus(), 50)
  }

  const closeBookModal = () => {
    if (!bookModal) return
    bookModal.style.display = 'none'
    currentBookSlot = null
  }

  bookModalOverlay && bookModalOverlay.addEventListener('click', closeBookModal)
  bookCancelBtn && bookCancelBtn.addEventListener('click', closeBookModal)

  bookForm &&
    bookForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      if (!currentBookSlot) return

      const name = bookNameInput.value.trim()
      const phone = bookPhoneInput.value.trim()
      if (!name || !phone) {
        bookFormError.textContent = 'お名前と電話番号は必須です。'
        bookFormError.style.display = 'block'
        return
      }

      const payload = {
        name,
        phone,
        kana: bookKanaInput.value.trim() || undefined,
        email: bookEmailInput.value.trim() || undefined,
        birth_date: bookBirthInput.value || undefined,
        patient_number: bookPatientNumberInput.value.trim() || undefined,
        symptom: bookSymptomInput.value.trim() || undefined,
        message: bookMessageInput.value.trim() || undefined,
      }

      bookSubmitBtn.disabled = true
      try {
        const res = await fetch(`/api/admin/reserve/slots/${currentBookSlot.id}/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data.ok) {
          closeBookModal()
          loadSlots(dateInput.value)
        } else if (data.error === 'slot_unavailable') {
          bookFormError.textContent = 'この枠は既に予約済みか、利用できなくなっています。'
          bookFormError.style.display = 'block'
        } else if (data.error === 'staff_on_time_off') {
          bookFormError.textContent = '担当スタッフがこの日時はお休みのため登録できません。'
          bookFormError.style.display = 'block'
        } else {
          bookFormError.textContent = '登録に失敗しました。'
          bookFormError.style.display = 'block'
        }
      } catch (e) {
        bookFormError.textContent = '通信エラーが発生しました。'
        bookFormError.style.display = 'block'
      } finally {
        bookSubmitBtn.disabled = false
      }
    })

  // ---- 初期化 ----
  prevBtn && prevBtn.addEventListener('click', () => shiftDate(-1))
  nextBtn && nextBtn.addEventListener('click', () => shiftDate(1))
  todayBtn && todayBtn.addEventListener('click', () => setDate(toDateStr(new Date())))
  dateInput.addEventListener('change', () => {
    if (dateInput.value) loadSlots(dateInput.value)
  })

  // 休み管理の日付入力の初期値を今日に設定
  if (timeoffDateInput) timeoffDateInput.value = toDateStr(new Date())

  ;(async () => {
    await loadStaff()
    await loadCourseSettings()
    await loadTimeoffs()
    setDate(toDateStr(new Date()))
  })()
})
