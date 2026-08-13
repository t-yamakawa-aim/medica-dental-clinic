// サイト全体で使う基本情報・定数

export const SITE = {
  name: 'メディカデンタルクリニック',
  nameEn: 'MEDICA DENTAL CLINIC',
  description:
    '虫歯・歯周病・矯正・インプラント治療・メンテナンスや審美のお悩みなら、石川県金沢市のメディカデンタルクリニックへ。症状の根本から解決する歯科医院です。妥協のない診察・説明・治療を行います。',
  phone: '076-252-0162',
  phoneHref: 'tel:0762520162',
  address: '石川県金沢市疋田1-33',
  addressFull: '〒921-8021 石川県金沢市疋田1-33',
  mapQuery: encodeURIComponent('石川県金沢市疋田1-33'),
  receptionHours: '9:00〜18:30',
  // Googleカレンダー埋め込み用のカレンダーID
  // 例: 'xxxxxxxxxxxx@group.calendar.google.com'
  // ※ Googleカレンダー側で「予定の公開」設定をONにしてから設定してください
  googleCalendarId: '',
} as const

// 診療時間テーブル用データ
export type ScheduleRow = {
  time: string
  note?: string
  days: { mon: boolean; tue: boolean; wed: boolean; thu: boolean; fri: boolean; sat: boolean; sun: boolean }
}

export const SCHEDULE: ScheduleRow[] = [
  {
    time: '9:00-12:30',
    days: { mon: true, tue: true, wed: true, thu: false, fri: true, sat: true, sun: false },
  },
  {
    time: '14:00-18:30',
    note: '土曜は17:00まで',
    days: { mon: true, tue: true, wed: true, thu: false, fri: true, sat: true, sun: false },
  },
]

// 定休日: 木曜・日曜・祝日
export const CLOSED_WEEKDAYS = [4, 0] // JS: 0=日,1=月,...6=土 → 木=4, 日=0

// グローバルナビゲーション
export type NavItem = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'ホーム',
    href: '/',
    children: [
      { label: '診療カレンダー', href: '/#calendar' },
      { label: 'お知らせ', href: '/#news' },
      { label: 'ブログ', href: '/#blog' },
    ],
  },
  {
    label: '当院について',
    href: '/medical',
    children: [
      { label: '私たちの目指すもの', href: '/medical#vision' },
      { label: '院長紹介', href: '/medical#director' },
      { label: '当院概要', href: '/medical#outline' },
      { label: '施設・設備紹介', href: '/medical#facility' },
      { label: 'スタッフ紹介', href: '/medical#staff' },
    ],
  },
  {
    label: '診療のご案内',
    href: '/service',
    children: [{ label: '診療の流れ', href: '/service#flow' }],
  },
  {
    label: '症状別で探す',
    href: '/symptoms',
  },
  { label: '採用情報', href: '/recruit' },
  { label: 'アクセス', href: '/#access' },
]

// 症状別リンク（アイコンはFontAwesomeクラス名）
export type SymptomItem = {
  icon: string
  title: string
  href: string
}

export const SYMPTOMS: SymptomItem[] = [
  {
    icon: 'fa-solid fa-tooth',
    title: '痛い・しみる・腫れた・血が出た・歯がぐらぐらする',
    href: '/symptoms#pain',
  },
  {
    icon: 'fa-solid fa-teeth-open',
    title: '歯や被せ物が欠けた・取れた',
    href: '/symptoms#broken',
  },
  {
    icon: 'fa-solid fa-face-smile',
    title: '審美・歯並び・ホワイトニング',
    href: '/symptoms#beauty',
  },
  {
    icon: 'fa-solid fa-teeth',
    title: '噛み合わせが悪い・歯が無い（少ない）',
    href: '/symptoms#bite',
  },
  {
    icon: 'fa-solid fa-clipboard-check',
    title: 'メンテナンスを受けたい・お口の状況を知りたい',
    href: '/symptoms#maintenance',
  },
  {
    icon: 'fa-solid fa-comment-medical',
    title: 'その他のお悩み・ご相談',
    href: '/symptoms#other',
  },
]

// フッターナビ
export const FOOTER_NAV = [
  { label: '当院について', href: '/medical' },
  { label: '診療のご案内', href: '/service' },
  { label: '症状別で探す', href: '/symptoms' },
  { label: 'ブログ', href: '/blog' },
  { label: '新着情報', href: '/news' },
  { label: 'お問い合わせ・Web予約', href: '/contact' },
  { label: 'プライバシーポリシー', href: '/privacy' },
]
