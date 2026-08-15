// サイト全体で使う基本情報・定数
// このプロジェクトはWeb予約システム専用です。
// トップページ・お知らせ・ブログ・症状別ページなどのコンテンツはWordPress側
// (https://medica-clinic.tomyama.com/) で運用しています。

export const SITE = {
  name: 'メディカデンタルクリニック',
  nameEn: 'MEDICA DENTAL CLINIC',
  description:
    'メディカデンタルクリニック（石川県金沢市）のWeb予約システムです。初診の方はこちらから、ご希望のコース・日時をお選びいただき、24時間いつでもご予約いただけます。',
  phone: '076-252-0162',
  phoneHref: 'tel:0762520162',
  address: '石川県金沢市疋田1-33',
  addressFull: '〒920-0003 石川県金沢市疋田1-33',
  mapQuery: encodeURIComponent('石川県金沢市疋田1-33'),
  receptionHours: '9:00〜12:30 <br>14:00〜18:30',
  // クリニック本体サイト（WordPress）のURL。ヘッダー・フッターのリンク先として使用。
  websiteUrl: 'http://medica-clinic.tomyama.com/',
} as const
