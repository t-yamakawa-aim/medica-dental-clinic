// 予約確認メール・24時間前リマインダーメールの送信ロジック
// Cloudflare Workers環境ではnodemailer等のSMTPライブラリが使えないため、
// Resend(https://resend.com)のREST APIをfetch経由で呼び出す。
// RESEND_API_KEYが未設定、もしくは予約者がメール未入力の場合は送信をスキップする。

export type MailBindings = {
  RESEND_API_KEY?: string
  // 送信元表示名（例:「ただ歯科クリニック予約システム」）。未設定時は clinicName + " 予約システム" を使う。
  MAIL_FROM_NAME?: string
  // 送信元メールアドレス。Resendでドメイン認証済みのアドレスを指定する。未設定時は onboarding@resend.dev を使う(検証用ドメインのため、実運用では受信者が自分自身のResendアカウントのメールでない限り届かない)。
  MAIL_FROM_ADDRESS?: string
}

export type ReservationMailInfo = {
  toEmail: string
  patientName: string
  slotDate: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  courseLabel: string // 例:「初診」「初診メンテナンス・歯科検診」
  patientNumber?: string | null
}

export type ClinicMailInfo = {
  clinicName: string // 例:「ただ歯科クリニック」
  phone: string // 例:「076-213-8148」
}

const weekdayLabel = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const w = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${y}年${m}月${d}日（${w}）`
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function sendMail(
  env: MailBindings,
  params: { to: string; subject: string; html: string; text: string }
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    console.log('RESEND_API_KEY未設定のためメール送信をスキップしました')
    return { ok: false, error: 'no_api_key' }
  }
  const fromAddress = env.MAIL_FROM_ADDRESS || 'onboarding@resend.dev'
  const fromName = env.MAIL_FROM_NAME || 'ただ歯科クリニック予約システム'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.log(`メール送信失敗 (status=${res.status}): ${body}`)
      return { ok: false, error: `http_${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    console.log(`メール送信中に例外が発生しました: ${e}`)
    return { ok: false, error: 'exception' }
  }
}

// ---- 予約確定時: 予約確認メール ----
export async function sendConfirmationMail(
  env: MailBindings,
  clinic: ClinicMailInfo,
  info: ReservationMailInfo
): Promise<{ ok: boolean; error?: string }> {
  if (!info.toEmail) return { ok: false, error: 'no_email' }

  const dateLabel = weekdayLabel(info.slotDate)
  const patientNumberLine = info.patientNumber
    ? `<tr><th align="left">患者番号</th><td>${escapeHtml(info.patientNumber)}</td></tr>`
    : ''
  const patientNumberLineText = info.patientNumber ? `患者番号：${info.patientNumber}\n` : ''

  const html = `
    <div style="font-family: sans-serif; line-height: 1.7; color: #333;">
      <p>${escapeHtml(info.patientName)} 様</p>
      <p>この度は${escapeHtml(clinic.clinicName)}へご予約いただき、誠にありがとうございます。<br>
      以下の内容でご予約を承りました。</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><th align="left" style="padding-right: 12px;">日時</th><td>${dateLabel} ${info.startTime}〜${info.endTime}</td></tr>
        <tr><th align="left" style="padding-right: 12px;">コース</th><td>${escapeHtml(info.courseLabel)}</td></tr>
        ${patientNumberLine}
      </table>
      <p>当日は開始時刻の5〜10分前を目安にお越しください。</p>
      <p>ご予約の変更・キャンセルにつきましては、お手数ですがお電話にてご連絡をお願いいたします。<br>
      <strong>${escapeHtml(clinic.clinicName)}　${escapeHtml(clinic.phone)}</strong></p>
      <p style="margin-top: 24px; color: #888; font-size: 12px;">
      ※このメールは${escapeHtml(clinic.clinicName)}予約システムからの自動送信メールです。本メールに直接返信いただいてもお問い合わせにはお答えできませんので、あらかじめご了承ください。
      </p>
    </div>
  `
  const text = `${info.patientName} 様

この度は${clinic.clinicName}へご予約いただき、誠にありがとうございます。
以下の内容でご予約を承りました。

日時：${dateLabel} ${info.startTime}〜${info.endTime}
コース：${info.courseLabel}
${patientNumberLineText}
当日は開始時刻の5〜10分前を目安にお越しください。

ご予約の変更・キャンセルにつきましては、お手数ですがお電話にてご連絡をお願いいたします。
${clinic.clinicName}　${clinic.phone}

※このメールは${clinic.clinicName}予約システムからの自動送信メールです。本メールに直接返信いただいてもお問い合わせにはお答えできませんので、あらかじめご了承ください。
`

  return sendMail(env, {
    to: info.toEmail,
    subject: '次回ご予約について',
    html,
    text,
  })
}

// ---- 施術24時間前: リマインダーメール ----
export async function sendReminderMail(
  env: MailBindings,
  clinic: ClinicMailInfo,
  info: ReservationMailInfo
): Promise<{ ok: boolean; error?: string }> {
  if (!info.toEmail) return { ok: false, error: 'no_email' }

  const dateLabel = weekdayLabel(info.slotDate)
  const patientNumberLine = info.patientNumber
    ? `<tr><th align="left">患者番号</th><td>${escapeHtml(info.patientNumber)}</td></tr>`
    : ''
  const patientNumberLineText = info.patientNumber ? `患者番号：${info.patientNumber}\n` : ''

  const html = `
    <div style="font-family: sans-serif; line-height: 1.7; color: #333;">
      <p>${escapeHtml(info.patientName)} 様</p>
      <p>明日、下記の内容でご予約をいただいております。<br>
      お忘れのないよう、ご来院のほどよろしくお願いいたします。</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><th align="left" style="padding-right: 12px;">日時</th><td>${dateLabel} ${info.startTime}〜${info.endTime}</td></tr>
        <tr><th align="left" style="padding-right: 12px;">コース</th><td>${escapeHtml(info.courseLabel)}</td></tr>
        ${patientNumberLine}
      </table>
      <p>当日は開始時刻の5〜10分前を目安にお越しください。</p>
      <p>ご予約の変更・キャンセルにつきましては、お手数ですがお電話にてご連絡をお願いいたします。<br>
      <strong>${escapeHtml(clinic.clinicName)}　${escapeHtml(clinic.phone)}</strong></p>
      <p style="margin-top: 24px; color: #888; font-size: 12px;">
      ※このメールは${escapeHtml(clinic.clinicName)}予約システムからの自動送信メールです。本メールに直接返信いただいてもお問い合わせにはお答えできませんので、あらかじめご了承ください。
      </p>
    </div>
  `
  const text = `${info.patientName} 様

明日、下記の内容でご予約をいただいております。
お忘れのないよう、ご来院のほどよろしくお願いいたします。

日時：${dateLabel} ${info.startTime}〜${info.endTime}
コース：${info.courseLabel}
${patientNumberLineText}
当日は開始時刻の5〜10分前を目安にお越しください。

ご予約の変更・キャンセルにつきましては、お手数ですがお電話にてご連絡をお願いいたします。
${clinic.clinicName}　${clinic.phone}

※このメールは${clinic.clinicName}予約システムからの自動送信メールです。本メールに直接返信いただいてもお問い合わせにはお答えできませんので、あらかじめご了承ください。
`

  return sendMail(env, {
    to: info.toEmail,
    subject: '次回ご予約について',
    html,
    text,
  })
}
