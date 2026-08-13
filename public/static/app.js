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
})
