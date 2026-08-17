document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('admin-schedule-date')
  const prevBtn = document.getElementById('admin-schedule-prev')
  const nextBtn = document.getElementById('admin-schedule-next')
  const todayBtn = document.getElementById('admin-schedule-today')
  const tomorrowBtn = document.getElementById('admin-schedule-tomorrow')
  const printBtn = document.getElementById('admin-schedule-print')
  const tableWrap = document.getElementById('admin-schedule-table-wrap')
  const printTitle = document.getElementById('admin-schedule-print-title')

  if (!dateInput || !tableWrap) return

  const pad2 = (n) => String(n).padStart(2, '0')
  const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  const parseDateStr = (s) => {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const weekdayLabel = (dateStr) => {
    const d = parseDateStr(dateStr)
    const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${w}）`
  }

  const courseShortLabel = (courseType) => (courseType === 'initial_doctor' ? '初診' : 'メンテ')

  const roleLabel = (role) => (role === 'dentist' ? '歯科医師' : '歯科衛生士')

  const setDate = (dateStr) => {
    dateInput.value = dateStr
    loadSchedule(dateStr)
  }

  const shiftDate = (days) => {
    const cur = dateInput.value ? parseDateStr(dateInput.value) : new Date()
    cur.setDate(cur.getDate() + days)
    setDate(toDateStr(cur))
  }

  const renderTable = (data) => {
    printTitle.textContent = `当日担当表｜${weekdayLabel(data.date)}`

    if (!data.staff || data.staff.length === 0) {
      tableWrap.innerHTML = '<p class="admin-reserve__empty">稼働中のスタッフが登録されていません。「Web予約枠」ページでスタッフを登録してください。</p>'
      return
    }
    if (!data.rows || data.rows.length === 0) {
      tableWrap.innerHTML = '<p class="admin-reserve__empty">この日はまだ予約枠が登録されていません。</p>'
      return
    }

    const table = document.createElement('table')
    table.className = 'admin-schedule__table'

    // ヘッダー行：スタッフ名（役割つき）
    const thead = document.createElement('thead')
    const headRow = document.createElement('tr')
    const timeTh = document.createElement('th')
    timeTh.className = 'admin-schedule__time-col'
    timeTh.textContent = '時間'
    headRow.appendChild(timeTh)
    data.staff.forEach((staff) => {
      const th = document.createElement('th')
      th.className = `admin-schedule__staff-col is-${staff.role}`
      th.innerHTML = `<span class="admin-schedule__staff-role">${roleLabel(staff.role)}</span><span class="admin-schedule__staff-name">${staff.name}</span>`
      headRow.appendChild(th)
    })
    thead.appendChild(headRow)
    table.appendChild(thead)

    // データ行：時間帯ごとに各スタッフのセルを表示
    const tbody = document.createElement('tbody')
    data.rows.forEach((row) => {
      const tr = document.createElement('tr')
      const timeTd = document.createElement('td')
      timeTd.className = 'admin-schedule__time-col'
      timeTd.textContent = `${row.start_time}\u301c${row.end_time}`
      tr.appendChild(timeTd)

      data.staff.forEach((staff) => {
        const cell = row.cells[String(staff.id)] || row.cells[staff.id] || { state: 'none' }
        const td = document.createElement('td')
        td.className = `admin-schedule__cell is-${cell.state}`
        if (cell.state === 'booked') {
          const nameEl = document.createElement('div')
          nameEl.className = 'admin-schedule__cell-name'
          nameEl.textContent = cell.patient_name || ''
          td.appendChild(nameEl)
          if (cell.patient_number) {
            const numEl = document.createElement('div')
            numEl.className = 'admin-schedule__cell-number'
            numEl.textContent = `No. ${cell.patient_number}`
            td.appendChild(numEl)
          }
          const courseEl = document.createElement('div')
          courseEl.className = 'admin-schedule__cell-course'
          courseEl.textContent = courseShortLabel(cell.course_type)
          td.appendChild(courseEl)
        } else if (cell.state === 'off') {
          td.textContent = '休'
        } else if (cell.state === 'open') {
          td.textContent = ''
        } else {
          td.textContent = ''
        }
        tr.appendChild(td)
      })

      tbody.appendChild(tr)
    })
    table.appendChild(tbody)

    tableWrap.innerHTML = ''
    tableWrap.appendChild(table)
  }

  const loadSchedule = async (dateStr) => {
    tableWrap.innerHTML = '<p class="admin-reserve__loading">読み込み中...</p>'
    try {
      const res = await fetch(`/api/admin/schedule?date=${encodeURIComponent(dateStr)}`)
      const data = await res.json()
      if (data.ok) {
        renderTable(data)
      } else {
        tableWrap.innerHTML = '<p class="admin-reserve__empty">読み込みに失敗しました。</p>'
      }
    } catch (e) {
      tableWrap.innerHTML = '<p class="admin-reserve__empty">通信エラーが発生しました。</p>'
    }
  }

  prevBtn && prevBtn.addEventListener('click', () => shiftDate(-1))
  nextBtn && nextBtn.addEventListener('click', () => shiftDate(1))
  todayBtn && todayBtn.addEventListener('click', () => setDate(toDateStr(new Date())))
  tomorrowBtn &&
    tomorrowBtn.addEventListener('click', () => {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      setDate(toDateStr(d))
    })
  dateInput.addEventListener('change', () => {
    if (dateInput.value) loadSchedule(dateInput.value)
  })
  printBtn && printBtn.addEventListener('click', () => window.print())

  setDate(toDateStr(new Date()))
})
