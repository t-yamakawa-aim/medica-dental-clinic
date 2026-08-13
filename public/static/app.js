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

  /* ===== SP navigation toggle ===== */
  const gnavBtn = document.getElementById('gnav-btn')
  const gnav = document.getElementById('gnav')
  const gnavOverlay = document.getElementById('gnav-overlay')

  const closeNav = () => {
    gnavBtn && gnavBtn.classList.remove('active')
    gnav && gnav.classList.remove('active')
    gnavOverlay && gnavOverlay.classList.remove('active')
  }

  if (gnavBtn && gnav && gnavOverlay) {
    gnavBtn.addEventListener('click', () => {
      gnavBtn.classList.toggle('active')
      gnav.classList.toggle('active')
      gnavOverlay.classList.toggle('active')
    })
    gnavOverlay.addEventListener('click', closeNav)
  }

  // サブメニューをタップで開閉（スマホ）
  document.querySelectorAll('.gnav__item').forEach((item) => {
    const sub = item.querySelector('.gnav__sub')
    const link = item.querySelector('.gnav__link')
    if (sub && link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 1080) {
          e.preventDefault()
          sub.classList.toggle('open')
        }
      })
    }
  })

  // ナビリンククリックでメニューを閉じる（アンカー遷移時）
  document.querySelectorAll('.gnav a').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 1080) closeNav()
    })
  })

  /* ===== Smooth scroll ===== */
  document.querySelectorAll('a[href^="#"], a[href*="/#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href')
      const hashIndex = href.indexOf('#')
      if (hashIndex === -1) return
      const hash = href.slice(hashIndex + 1)
      if (!hash) return
      const target = document.getElementById(hash)
      const path = href.slice(0, hashIndex)
      const isSamePage = path === '' || path === '/' || path === window.location.pathname
      if (target && isSamePage) {
        e.preventDefault()
        const headerHeight = window.innerWidth <= 1080 ? 64 : 100
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight
        window.scrollTo({ top, behavior: 'smooth' })
      }
    })
  })

  /* ===== Page top button ===== */
  const pageTop = document.getElementById('page-top')
  if (pageTop) {
    pageTop.addEventListener('click', (e) => {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  /* ===== Hero hours panel toggle ===== */
  const heroHours = document.getElementById('hero-hours')
  const heroHoursToggle = document.getElementById('hero-hours-toggle')
  if (heroHours && heroHoursToggle) {
    heroHoursToggle.addEventListener('click', () => {
      const collapsed = heroHours.classList.toggle('is-collapsed')
      heroHoursToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true')
    })
  }

  /* ===== Hero slideshow ===== */
  const slides = document.querySelectorAll('.hero__slide')
  if (slides.length > 1) {
    let current = 0
    setInterval(() => {
      slides[current].classList.remove('active')
      current = (current + 1) % slides.length
      slides[current].classList.add('active')
    }, 5000)
  }

  /* ===== 採用エントリーフォーム ===== */
  const recruitForm = document.getElementById('recruit-entry-form')
  if (recruitForm) {
    const inquiryChecks = Array.from(recruitForm.querySelectorAll('[data-required-track="inquiry"]'))
    const fieldInputs = Array.from(recruitForm.querySelectorAll('[data-required-track="field"]'))
    const remainingEl = document.getElementById('recruit-entry-remaining')
    const totalEl = document.getElementById('recruit-entry-total')
    const submitBtn = document.getElementById('recruit-entry-submit')
    const submitLabel = document.getElementById('recruit-entry-submit-label')
    const errorBox = document.getElementById('recruit-entry-form__error')

    // 必須項目数 = 「お問い合わせ内容」チェック(1つ以上で1項目分カウント) + 各必須入力欄
    const totalRequired = 1 + fieldInputs.length
    if (totalEl) totalEl.textContent = String(totalRequired)

    const updateCounter = () => {
      let remaining = totalRequired
      const inquiryChecked = inquiryChecks.some((el) => el.checked)
      if (inquiryChecked) remaining -= 1

      fieldInputs.forEach((el) => {
        if (el.value && el.value.trim() !== '') remaining -= 1
      })

      if (remainingEl) remainingEl.textContent = String(Math.max(remaining, 0))

      const isComplete = remaining <= 0
      if (submitBtn) submitBtn.disabled = !isComplete
      if (submitLabel) submitLabel.textContent = isComplete ? '送信する' : '入力が完了していません'
    }

    inquiryChecks.forEach((el) => el.addEventListener('change', updateCounter))
    fieldInputs.forEach((el) => el.addEventListener('input', updateCounter))
    updateCounter()

    recruitForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      if (submitBtn && submitBtn.disabled) return

      if (errorBox) {
        errorBox.style.display = 'none'
        errorBox.textContent = ''
      }

      const formData = new FormData(recruitForm)
      const payload = {
        inquiry_types: formData.getAll('inquiry_types'),
        job_types: formData.getAll('job_types'),
        name: formData.get('name'),
        kana: formData.get('kana'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        message: formData.get('message'),
      }

      if (submitBtn) submitBtn.disabled = true
      if (submitLabel) submitLabel.textContent = '送信中...'

      try {
        const res = await fetch('/api/recruit-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.ok) {
          window.location.href = '/recruit/entry/thanks'
        } else {
          throw new Error(data.error || 'unknown_error')
        }
      } catch (err) {
        if (errorBox) {
          errorBox.style.display = 'block'
          errorBox.textContent = '送信に失敗しました。お手数ですが、しばらく経ってから再度お試しください。'
        }
        if (submitBtn) submitBtn.disabled = false
        if (submitLabel) submitLabel.textContent = '送信する'
      }
    })
  }

  /* ===== Web予約（初診専用・1時間枠） ===== */
  const reserveWidget = document.getElementById('reserve-widget')
  if (reserveWidget) {
    const stepDate = document.getElementById('reserve-step-date')
    const stepTime = document.getElementById('reserve-step-time')
    const stepForm = document.getElementById('reserve-step-form')
    const stepDone = document.getElementById('reserve-step-done')

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
    let selectedDate = null
    let selectedSlot = null // { id, start_time, end_time }

    const pad2 = (n) => String(n).padStart(2, '0')
    const todayStr = () => {
      const d = new Date()
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
    }

    const showStep = (name) => {
      stepDate.style.display = name === 'date' ? '' : 'none'
      stepTime.style.display = name === 'time' ? '' : 'none'
      stepForm.style.display = name === 'form' ? '' : 'none'
      stepDone.style.display = name === 'done' ? '' : 'none'
    }

    const fetchAvailableDates = async () => {
      try {
        const res = await fetch('/api/reserve/available-dates')
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
      selectedDate = dateStr
      const d = new Date(dateStr + 'T00:00:00')
      const weekdays = ['日', '月', '火', '水', '木', '金', '土']
      selectedDateEl.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`

      timeListEl.innerHTML = '<p class="reserve-loading">読み込み中...</p>'
      showStep('time')

      try {
        const res = await fetch(`/api/reserve/slots?date=${dateStr}`)
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
          slot_id: selectedSlot.id,
          name: formData.get('name'),
          kana: formData.get('kana'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          birth_date: formData.get('birth_date'),
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

    // 初期化
    const now = new Date()
    viewYear = now.getFullYear()
    viewMonth = now.getMonth()
    fetchAvailableDates().then(renderCalendar)
  }
})
