document.addEventListener('DOMContentLoaded', () => {
  /* ===== Header scroll state ===== */
  const header = document.getElementById('site-header')
  const onScroll = () => {
    if (window.scrollY > 40) {
      header && header.classList.add('is-scrolled')
    } else {
      header && header.classList.remove('is-scrolled')
    }

    const pageTop = document.getElementById('page-top')
    if (pageTop) {
      if (window.scrollY > 300) {
        pageTop.classList.add('show')
      } else {
        pageTop.classList.remove('show')
      }
    }
  }
  onScroll()
  window.addEventListener('scroll', onScroll)

  /* ===== Page top button ===== */
  const pageTop = document.getElementById('page-top')
  if (pageTop) {
    pageTop.addEventListener('click', (e) => {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  /* ===== Web予約（コース選択制） ===== */
  const reserveWidget = document.getElementById('reserve-widget')
  if (reserveWidget) {
    const stepCourse = document.getElementById('reserve-step-course')
    const stepDate = document.getElementById('reserve-step-date')
    const stepTime = document.getElementById('reserve-step-time')
    const stepForm = document.getElementById('reserve-step-form')
    const stepDone = document.getElementById('reserve-step-done')

    const courseListEl = document.getElementById('reserve-course-list')
    const selectedCourseEl = document.getElementById('reserve-selected-course')

    const calMonthLabel = document.getElementById('reserve-cal-month')
    const calDays = document.getElementById('reserve-cal-days')
    const calPrev = document.getElementById('reserve-cal-prev')
    const calNext = document.getElementById('reserve-cal-next')

    const selectedDateEl = document.getElementById('reserve-selected-date')
    const selectedDatetimeEl = document.getElementById('reserve-selected-datetime')
    const timeListEl = document.getElementById('reserve-time-list')

    const reserveForm = document.getElementById('reserve-form')
    const reserveSubmit = document.getElementById('reserve-submit')
    const reserveErrorBox = document.getElementById('reserve-form-error')
    const doneDatetimeEl = document.getElementById('reserve-done-datetime')

    let viewYear, viewMonth // カレンダー表示中の年月(0-indexed month)
    let availableDatesSet = new Set() // 'YYYY-MM-DD' の空き枠がある日付
    let selectedCourse = null // { course_type, label, duration_minutes }
    let selectedDate = null
    let selectedSlot = null // { id, start_time, end_time }

    const pad2 = (n) => String(n).padStart(2, '0')
    const todayStr = () => {
      const d = new Date()
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
    }

    const showStep = (name) => {
      stepCourse.style.display = name === 'course' ? '' : 'none'
      stepDate.style.display = name === 'date' ? '' : 'none'
      stepTime.style.display = name === 'time' ? '' : 'none'
      stepForm.style.display = name === 'form' ? '' : 'none'
      stepDone.style.display = name === 'done' ? '' : 'none'
    }

    const fetchCourses = async () => {
      courseListEl.innerHTML = '<p class="reserve-loading">読み込み中...</p>'
      try {
        const res = await fetch('/api/reserve/courses')
        const data = await res.json()
        courseListEl.innerHTML = ''
        if (data.ok && data.courses.length > 0) {
          data.courses.forEach((course) => {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.className = 'reserve-course-list__item'
            btn.innerHTML = `<span class="reserve-course-list__label">${course.label}</span><span class="reserve-course-list__duration">${course.duration_minutes}分</span>`
            btn.addEventListener('click', () => selectCourse(course))
            courseListEl.appendChild(btn)
          })
        } else {
          courseListEl.innerHTML = '<p class="reserve-time-list__empty">現在ご予約いただけるコースがありません。</p>'
        }
      } catch (e) {
        courseListEl.innerHTML = '<p class="reserve-time-list__empty">読み込みに失敗しました。時間をおいて再度お試しください。</p>'
      }
    }

    const selectCourse = (course) => {
      selectedCourse = course
      selectedDate = null
      selectedSlot = null
      if (selectedCourseEl) selectedCourseEl.textContent = `選択中のコース：${course.label}（${course.duration_minutes}分）`

      const now = new Date()
      viewYear = now.getFullYear()
      viewMonth = now.getMonth()
      showStep('date')
      fetchAvailableDates().then(renderCalendar)
    }

    const fetchAvailableDates = async () => {
      if (!selectedCourse) return
      try {
        const res = await fetch(`/api/reserve/available-dates?course=${encodeURIComponent(selectedCourse.course_type)}`)
        const data = await res.json()
        if (data.ok) {
          availableDatesSet = new Set(data.dates)
        }
      } catch (e) {
        availableDatesSet = new Set()
      }
    }

    const renderCalendar = () => {
      calMonthLabel.textContent = `${viewYear}年${viewMonth + 1}月`
      calDays.innerHTML = ''

      const firstDay = new Date(viewYear, viewMonth, 1)
      const startWeekday = firstDay.getDay() // 0=日
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
      const today = todayStr()

      // 前月の空白セル
      for (let i = 0; i < startWeekday; i++) {
        const cell = document.createElement('span')
        cell.className = 'reserve-calendar__day is-empty'
        calDays.appendChild(cell)
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(d)}`
        const cell = document.createElement('button')
        cell.type = 'button'
        cell.className = 'reserve-calendar__day'
        cell.textContent = String(d)

        const isPast = dateStr < today
        const isAvailable = availableDatesSet.has(dateStr) && !isPast

        if (isAvailable) {
          cell.classList.add('is-available')
          cell.addEventListener('click', () => selectDate(dateStr))
        } else {
          cell.classList.add('is-none')
          cell.disabled = true
        }
        calDays.appendChild(cell)
      }
    }

    const selectDate = async (dateStr) => {
      if (!selectedCourse) return
      selectedDate = dateStr
      const d = new Date(dateStr + 'T00:00:00')
      const weekdays = ['日', '月', '火', '水', '木', '金', '土']
      selectedDateEl.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`

      timeListEl.innerHTML = '<p class="reserve-loading">読み込み中...</p>'
      showStep('time')

      try {
        const res = await fetch(`/api/reserve/slots?date=${dateStr}&course=${encodeURIComponent(selectedCourse.course_type)}`)
        const data = await res.json()
        timeListEl.innerHTML = ''
        if (data.ok && data.slots.length > 0) {
          data.slots.forEach((slot) => {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.className = 'reserve-time-list__item'
            btn.textContent = `${slot.start_time} 〜 ${slot.end_time}`
            btn.addEventListener('click', () => selectSlot(slot))
            timeListEl.appendChild(btn)
          })
        } else {
          timeListEl.innerHTML = '<p class="reserve-time-list__empty">この日はご予約可能な時間がありません。</p>'
        }
      } catch (e) {
        timeListEl.innerHTML = '<p class="reserve-time-list__empty">読み込みに失敗しました。時間をおいて再度お試しください。</p>'
      }
    }

    const selectSlot = (slot) => {
      selectedSlot = slot
      const d = new Date(selectedDate + 'T00:00:00')
      const weekdays = ['日', '月', '火', '水', '木', '金', '土']
      selectedDatetimeEl.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}） ${slot.start_time} 〜 ${slot.end_time}`
      showStep('form')
    }

    calPrev.addEventListener('click', () => {
      viewMonth -= 1
      if (viewMonth < 0) {
        viewMonth = 11
        viewYear -= 1
      }
      renderCalendar()
    })
    calNext.addEventListener('click', () => {
      viewMonth += 1
      if (viewMonth > 11) {
        viewMonth = 0
        viewYear += 1
      }
      renderCalendar()
    })

    document.querySelectorAll('.reserve-back-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const backTo = btn.getAttribute('data-back-to')
        showStep(backTo)
      })
    })

    if (reserveForm) {
      reserveForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (!selectedSlot) return

        reserveErrorBox.style.display = 'none'
        reserveErrorBox.textContent = ''
        reserveSubmit.disabled = true
        const originalLabel = reserveSubmit.innerHTML
        reserveSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>送信中...</span>'

        const formData = new FormData(reserveForm)
        const payload = {
          slot_date: selectedDate,
          start_time: selectedSlot.start_time,
          course_type: selectedCourse.course_type,
          name: formData.get('name'),
          kana: formData.get('kana'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          birth_date: formData.get('birth_date'),
          patient_number: formData.get('patient_number'),
          symptom: formData.get('symptom'),
          message: formData.get('message'),
        }

        try {
          const res = await fetch('/api/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const data = await res.json()
          if (data.ok) {
            doneDatetimeEl.textContent = selectedDatetimeEl.textContent
            showStep('done')
          } else if (data.error === 'slot_unavailable') {
            reserveErrorBox.style.display = 'block'
            reserveErrorBox.textContent = 'この時間は他の方に予約されました。お手数ですが別の時間を選択してください。'
            showStep('time')
            selectDate(selectedDate)
          } else {
            throw new Error(data.error || 'unknown_error')
          }
        } catch (err) {
          reserveErrorBox.style.display = 'block'
          reserveErrorBox.textContent = '送信に失敗しました。お手数ですが、しばらく経ってから再度お試しください。'
        } finally {
          reserveSubmit.disabled = false
          reserveSubmit.innerHTML = originalLabel
        }
      })
    }

    // 初期化（まずコース一覧を取得。日付・時間のカレンダーはコース選択後に初期化される）
    fetchCourses()
  }
})
