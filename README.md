# メディカデンタルクリニック

## プロジェクト概要
- **名称**: メディカデンタルクリニック
- **目的**: 石川県金沢市の歯科医院のコーポレートサイト（トップページ）
- **参考**: 秋川臨床デンタルクリニック様のサイト構成・デザインを参考にテンプレート化
- **特徴**:
  - ヒーロースライダー（3枚の画像を自動切り替え）
  - 診療時間・診療カレンダーの表示
  - お知らせ・ブログ（Cloudflare D1データベースで動的管理）
  - 私たちの目指すもの（ビジョン）セクション
  - 症状別リンク一覧（6項目）
  - 施設紹介ギャラリー
  - 採用情報セクション
  - アクセス（Googleマップ埋め込み）
  - レスポンシブ対応（PC/スマホ）
  - スマホ用固定フッターナビ（Web予約・電話・アクセス）

## URLs
- **開発中プレビュー**: PM2 + wrangler pages dev（ローカルサンドボックス）
- **本番URL**: 未デプロイ（今後 Cloudflare Pages へデプロイ予定）

## 現在完成している機能
- [x] トップページ全体のレイアウト・デザイン実装
- [x] レスポンシブ対応（ブレークポイント: 1080px, 900px, 767px）
- [x] ヘッダー：グローバルナビ（サブメニュー付き）、スマホ用ハンバーガーメニュー
- [x] フッター：フッターナビ、コピーライト
- [x] ヒーローセクション：画像スライドショー、診療時間テーブル（浮遊カード）
- [x] 診療カレンダーセクション（休診日・診療時間の案内）
- [x] お知らせセクション（D1データベースから動的取得、直近3件表示）
- [x] ビジョンセクション（当院の考え方紹介）
- [x] 症状別で探すセクション（6つのカテゴリカード）
- [x] 施設紹介セクション（ギャラリー3枚）
- [x] ブログセクション（D1データベースから動的取得、直近4件表示）
- [x] 採用情報セクション
- [x] アクセスセクション（Googleマップ埋め込み、駐車場案内）
- [x] スムーススクロール・ページトップボタン・ヘッダースクロール制御のJS実装
- [x] お問い合わせ/Web予約フォーム送信用API（`POST /api/contact`）を用意（フォームUI自体は下層ページ`/contact`で今後実装予定）
- [x] 「当院について」ページ（`/medical`）：1枚物構成、各セクションにid付与、グローバルナビ・トップページからのアンカーリンク遷移に対応
  - 私たちの目指すもの（3つの約束）／院長紹介（挨拶・経歴・所属研究会・講演実績・修了コース）／当院概要／施設・設備紹介／当院の感染症対策／スタッフ紹介
- [x] 「診療のご案内」ページ（`/service`）：1枚物構成、各セクションにid付与、グローバルナビ・トップページ・フッターナビからのアンカーリンク遷移に対応
  - ご予約案内（予約制についての案内文、初診・急患の方／通院中で次回予約未定の方の比較テーブル：ご予約方法・ご持参頂くもの・次回予約）／診療の流れ（5ステップ：初診・ヒアリング→検査→診断・治療の選択肢のご案内→治療→今後の予防策のご提案）

## 機能エントリーURI一覧
| メソッド | パス | 説明 |
|---|---|---|
| GET | `/` | トップページ |
| GET | `/medical` | 当院について（1枚物、`#vision` `#director` `#outline` `#facility` `#hygiene` `#staff` の各セクションIDにアンカー遷移可能） |
| GET | `/service` | 診療のご案内（1枚物、`#reservation` `#flow` の各セクションIDにアンカー遷移可能） |
| GET | `/api/news` | お知らせ一覧取得（最大5件、JSON） |
| GET | `/api/blog` | ブログ一覧取得（最大4件、JSON） |
| POST | `/api/contact` | お問い合わせ・Web予約フォーム送信（JSON: name, kana, phone, email, message, type） |
| GET | `/recruit` | 採用情報（1枚物、`#message` `#catch` `#jobs` `#tour` の各セクションIDにアンカー遷移可能、`#job-dentist` `#job-hygienist` `#job-assistant` で各職種タブへ遷移可能） |
| GET | `/recruit/entry` | 採用エントリーフォーム |
| GET | `/recruit/entry/thanks` | 応募完了ページ |
| POST | `/api/recruit-entry` | 採用エントリーフォーム送信（JSON: inquiry_types[], job_types[], name, kana, phone, email, message）。D1保存後、Resend API経由で`peacefultomorrow0528@gmail.com`宛に通知メールを送信（`RESEND_API_KEY`環境変数が必要。未設定時は送信スキップ） |

※ 下層ページ（`/symptoms`, `/news`, `/news/:id`, `/blog`, `/blog/:id`, `/contact`, `/privacy`）は現在ヘッダー・フッターのリンク先として用意されていますが、ページ自体は未実装です（今後、下層ページの情報提供後に実装予定）。

## データアーキテクチャ
- **データベース**: Cloudflare D1（SQLite互換）
- **テーブル構成**:
  - `news` — お知らせ（id, title, body, published_at, is_published, created_at）
  - `blog_posts` — ブログ記事（id, title, body, category, thumbnail_url, published_at, is_published, created_at）
  - `contact_messages` — お問い合わせ・Web予約フォームの送信内容（id, name, kana, phone, email, message, type, created_at）
  - `recruit_entries` — 採用エントリーフォームの送信内容（id, inquiry_types[JSON配列文字列], job_types[JSON配列文字列], name, kana, phone, email, message, created_at）
- **マイグレーション**: `migrations/0001_initial_schema.sql`, `migrations/0002_contact.sql`, `migrations/0003_recruit_entries.sql`
- **シードデータ**: `seed.sql`（お知らせ3件、ブログ4件のサンプルデータ）
- **ローカル開発**: `--local`フラグでSQLiteをローカルに自動生成（`.wrangler/state/v3/d1`）

## 画像素材について
- ロゴ・院長写真・ヒーロー画像: AI生成画像（架空のクリニック・人物）
- 院内・外観写真: Creative Commons/フリーライセンスの画像検索結果を使用
- すべて `public/static/images/` に格納

## 基本情報
- **電話番号**: 076-252-0162
- **住所**: 〒921-8021 石川県金沢市疋田1-33
- **診療時間**:
  - 月・火・水・金: 9:00-12:30 / 14:00-18:30
  - 土: 9:00-12:30 / 14:00-17:00
  - 休診日: 木曜・日曜・祝日

## 技術スタック
- **フレームワーク**: Hono (TypeScript) + JSX
- **デプロイ先**: Cloudflare Pages / Workers
- **データベース**: Cloudflare D1
- **フロントエンド**: カスタムCSS（Tailwindではなく専用CSSで元サイトのデザインを忠実に再現）、Font Awesome（アイコン）、Google Fonts（Zen Kaku Gothic New / Noto Sans JP / Roboto）
- **ビルドツール**: Vite + @hono/vite-build

## 開発コマンド
```bash
# ビルド
npm run build

# ローカルDBマイグレーション適用
npx wrangler d1 migrations apply webapp-production --local

# シードデータ投入
npx wrangler d1 execute webapp-production --local --file=./seed.sql

# PM2でサービス起動
pm2 start ecosystem.config.cjs

# 動作確認
curl http://localhost:3000
```

## メール通知機能について（採用エントリー）
- 応募完了時に `peacefultomorrow0528@gmail.com` 宛へ通知メールを送信する機能を実装済みです。
- Cloudflare Workers環境ではNode.jsのSMTPライブラリ（nodemailer等）が使用できないため、**Resend**（https://resend.com）のREST APIをfetch経由で呼び出しています。
- **利用するには以下の設定が必要です（未設定の場合は送信スキップされ、D1への保存のみ行われます）**：
  1. Resendに `peacefultomorrow0528@gmail.com` でアカウント登録（無料枠: 3,000通/月、100通/日）
  2. APIキーを発行
  3. ローカル開発: `.dev.vars` に `RESEND_API_KEY=re_xxxxxxxx` を追記
  4. 本番: `npx wrangler pages secret put RESEND_API_KEY` でCloudflare Secretsに設定
- ※ 独自ドメインのDNS認証をしていない場合、Resendの制約上「アカウント登録したメールアドレス宛」にのみ送信可能です。今回は送信先が `peacefultomorrow0528@gmail.com` 固定のため、ドメイン認証なしでも送信可能です。

## 未実装の機能・今後の開発予定
1. **下層ページの実装**（ユーザーからの情報提供待ち）
   - `/symptoms`（症状別で探す：各症状の詳細ページ）
   - `/news`, `/news/:id`（お知らせ一覧・詳細ページ）
   - `/blog`, `/blog/:id`（ブログ一覧・詳細ページ）
   - `/contact`（お問い合わせ・Web予約フォームページ）
   - `/privacy`（プライバシーポリシー）
2. **お知らせ・ブログの管理画面**（簡易パスワード保護付きの投稿・編集・削除UI）
3. **本番Cloudflare D1データベースの作成・マイグレーション適用**
4. **本番Cloudflare Pagesへのデプロイ**
5. **お問い合わせフォームのフロントエンドUI実装**（現在APIのみ実装済み）
6. **診療カレンダーのGoogleカレンダー連携**（現在は静的な休診日案内のみ）
7. **RESEND_API_KEYの設定**（採用エントリーメール通知を実際に有効化するため。上記「メール通知機能について」参照）

## デプロイ状況
- **プラットフォーム**: Cloudflare Pages（予定）
- **現在の状態**: ❌ 未デプロイ（ローカル開発環境でのみ動作確認済み）
- **最終更新**: 2026-08-13（「採用情報」「採用エントリーフォーム」「応募完了」ページ追加、採用エントリーメール通知機能を実装）
