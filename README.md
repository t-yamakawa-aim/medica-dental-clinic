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

## 機能エントリーURI一覧
| メソッド | パス | 説明 |
|---|---|---|
| GET | `/` | トップページ |
| GET | `/medical` | 当院について（1枚物、`#vision` `#director` `#outline` `#facility` `#hygiene` `#staff` の各セクションIDにアンカー遷移可能） |
| GET | `/api/news` | お知らせ一覧取得（最大5件、JSON） |
| GET | `/api/blog` | ブログ一覧取得（最大4件、JSON） |
| POST | `/api/contact` | お問い合わせ・Web予約フォーム送信（JSON: name, kana, phone, email, message, type） |

※ 下層ページ（`/service`, `/symptoms`, `/recruit`, `/news`, `/news/:id`, `/blog`, `/blog/:id`, `/contact`, `/privacy`）は現在ヘッダー・フッターのリンク先として用意されていますが、ページ自体は未実装です（今後、下層ページの情報提供後に実装予定）。

## データアーキテクチャ
- **データベース**: Cloudflare D1（SQLite互換）
- **テーブル構成**:
  - `news` — お知らせ（id, title, body, published_at, is_published, created_at）
  - `blog_posts` — ブログ記事（id, title, body, category, thumbnail_url, published_at, is_published, created_at）
  - `contact_messages` — お問い合わせ・Web予約フォームの送信内容（id, name, kana, phone, email, message, type, created_at）
- **マイグレーション**: `migrations/0001_initial_schema.sql`, `migrations/0002_contact.sql`
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

## 未実装の機能・今後の開発予定
1. **下層ページの実装**（ユーザーからの情報提供待ち）
   - `/service`（診療のご案内、診療の流れ）
   - `/symptoms`（症状別で探す：各症状の詳細ページ）
   - `/recruit`（採用情報：募集要項）
   - `/news`, `/news/:id`（お知らせ一覧・詳細ページ）
   - `/blog`, `/blog/:id`（ブログ一覧・詳細ページ）
   - `/contact`（お問い合わせ・Web予約フォームページ）
   - `/privacy`（プライバシーポリシー）
2. **お知らせ・ブログの管理画面**（簡易パスワード保護付きの投稿・編集・削除UI）
3. **本番Cloudflare D1データベースの作成・マイグレーション適用**
4. **本番Cloudflare Pagesへのデプロイ**
5. **お問い合わせフォームのフロントエンドUI実装**（現在APIのみ実装済み）
6. **診療カレンダーのGoogleカレンダー連携**（現在は静的な休診日案内のみ）

## デプロイ状況
- **プラットフォーム**: Cloudflare Pages（予定）
- **現在の状態**: ❌ 未デプロイ（ローカル開発環境でのみ動作確認済み）
- **最終更新**: 2026-08-13（「当院について」ページ追加）
