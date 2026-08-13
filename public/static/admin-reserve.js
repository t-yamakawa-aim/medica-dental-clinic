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

  if (!dateInput || !slotsList) return

  const pad2 = (n) => String(n).padStart(2, '0')

  const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

  const parseDateStr = (s) => {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const addOneHour = (time) => {
    const [h, m] = time.split(':').map(Number)
    const total = h * 60 + m + 60
    const hh = Math.floor(total / 60) % 24
    const mm = total % 60
    return `${pad2(hh)}:${pad2(mm)}`
  }

  const showMsg = (text, isError) => {
    if (!addSlotMsg) return
    addSlotMsg.textContent = text
    addSlotMsg.classList.toggle('is-error', !!isError)
    addSlotMsg.classList.toggle('is-success', !isError)
    if (text) {
      window.setTimeout(() => {
        addSlotMsg.textContent = ''
        addSlotMsg.classList.remove('is-error', 'is-success')
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

  const weekdayLabel = (dateStr) => {
    const d = parseDateStr(dateStr)
    const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
    return `${d.getMonth() + 1}月${d.getDate()}日（${w}）`
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

  // ---- 初期化 ----
  setDate(toDateStr(new Date()))

  prevBtn && prevBtn.addEventListener('click', () => shiftDate(-1))
  nextBtn && nextBtn.addEventListener('click', () => shiftDate(1))
  todayBtn && todayBtn.addEventListener('click', () => setDate(toDateStr(new Date())))
  dateInput.addEventListener('change', () => {
    if (dateInput.value) loadSlots(dateInput.value)
  })

  // ---- 単発追加 ----
  addSlotBtn &&
    addSlotBtn.addEventListener('click', async () => {
      const time = newSlotTime.value
      const dateStr = dateInput.value
      if (!dateStr || !time) {
        showMsg('日付と時刻を指定してください。', true)
        return
      }
      addSlotBtn.disabled = true
      try {
        const res = await fetch('/api/admin/reserve/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slot_date: dateStr, start_time: time }),
        })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data.ok) {
          showMsg(`追加しました（${time}〜${addOneHour(time)}）`, false)
          loadSlots(dateStr)
        } else if (data.error === 'slot_already_exists') {
          showMsg('その時刻の枠は既に登録済みです。', true)
        } else {
          showMsg('追加に失敗しました。', true)
        }
      } catch (e) {
        showMsg('通信エラーが発生しました。', true)
      } finally {
        addSlotBtn.disabled = false
      }
    })

  // ---- 一括追加（1時間ごと） ----
  bulkAddBtn &&
    bulkAddBtn.addEventListener('click', async () => {
      const dateStr = dateInput.value
      const start = bulkStart.value
      const end = bulkEnd.value
      if (!dateStr || !start || !end) {
        showMsg('日付・開始・終了時刻を指定してください。', true)
        return
      }

      const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number)
        return h * 60 + m
      }
      const startMin = toMinutes(start)
      const endMin = toMinutes(end)
      if (endMin <= startMin) {
        showMsg('終了時刻は開始時刻より後にしてください。', true)
        return
      }

      const times = []
      for (let t = startMin; t + 60 <= endMin; t += 60) {
        const hh = pad2(Math.floor(t / 60))
        const mm = pad2(t % 60)
        times.push(`${hh}:${mm}`)
      }

      if (times.length === 0) {
        showMsg('追加できる枠がありません。', true)
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
            body: JSON.stringify({ slot_date: dateStr, start_time: time }),
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
      showMsg(`${successCount}件追加しました${skipCount > 0 ? `（${skipCount}件は既存のためスキップ）` : ''}`, false)
      loadSlots(dateStr)
    })
})
