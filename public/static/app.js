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
})
