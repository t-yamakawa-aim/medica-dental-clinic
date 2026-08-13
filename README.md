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
  - プライバシーポリシーページ
  - Web予約システム（初診専用・1時間枠、患者向け予約フォーム＋クリニック向け予約枠管理画面）
  - お知らせ・ブログ管理画面（クリニック側でブラウザから記事の追加・編集・削除、サムネイル画像アップロードが可能）

## URLs
- **開発中プレビュー**: PM2 + wrangler pages dev（ローカルサンドボックス）
- **本番URL**: https://medica-dental-clinic.pages.dev
- **クリニック管理トップ（本番）**: https://medica-dental-clinic.pages.dev/admin（Basic認証。ID/パスワードはCloudflareのシークレットとして設定済み。忘れた場合は下記コマンドで再設定可能）
  - `/admin/reserve` — Web予約枠管理
  - `/admin/news` — お知らせ管理
  - `/admin/blog` — ブログ管理（サムネイル画像アップロード対応）

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
- [x] **「プライバシーポリシー」ページ（`/privacy`）**：参考サイトの内容・構成に準拠（基本方針／個人情報の取扱い・利用目的／開示等について／お問合せ先の4セクション）
- [x] **「Web予約」システム（初診専用・1時間枠、15分間隔でクリニック側が枠を設定可能）**
  - `/reserve` — 患者向け予約ウィザード（①日付選択（カレンダー、空きがある日のみ選択可）→②時間選択（その日の空き枠一覧）→③お客様情報入力（氏名・電話番号は必須、フリガナ・メール・生年月日・症状・備考は任意）→④予約完了）
  - `/admin/reserve` — クリニック向け予約枠管理画面（Basic認証で保護）。日付ナビ、単発での枠追加（開始時刻を15分間隔で指定、自動で1時間後を終了時刻に設定）、指定した時間帯を1時間ごとに一括追加、その日の枠一覧表示（予約が入っている枠は患者情報を表示しキャンセル可能、空き枠は削除可能）
  - 予約確定処理はダブルブッキング防止のため「空いている場合のみ更新（`status='open'`条件付きUPDATE）」というレース対策済みのロジックで実装
- [x] **クリニック管理トップ（`/admin`）・お知らせ管理（`/admin/news`）・ブログ管理（`/admin/blog`）**（いずれもBasic認証で保護）
  - お知らせ・ブログとも一覧表示（非公開記事も薄く表示）、新規追加・編集・削除がブラウザ上のモーダルフォームから可能
  - 公開/非公開の切り替えチェックボックス（非公開にするとサイトの一覧・トップページから即時非表示）
  - ブログのみサムネイル画像のアップロード機能付き（Cloudflare R2に保存。JPEG/PNG/WEBP/GIF、5MBまで）
- [x] 「当院について」ページ（`/medical`）：1枚物構成、各セクションにid付与、グローバルナビ・トップページからのアンカーリンク遷移に対応
  - 私たちの目指すもの（3つの約束）／院長紹介（挨拶・経歴・所属研究会・講演実績・修了コース）／当院概要／施設・設備紹介／当院の感染症対策／スタッフ紹介
- [x] 「診療のご案内」ページ（`/service`）：1枚物構成、各セクションにid付与、グローバルナビ・トップページ・フッターナビからのアンカーリンク遷移に対応
  - ご予約案内（予約制についての案内文、初診・急患の方／通院中で次回予約未定の方の比較テーブル：ご予約方法・ご持参頂くもの・次回予約）／診療の流れ（5ステップ：初診・ヒアリング→検査→診断・治療の選択肢のご案内→治療→今後の予防策のご提案）
- [x] 「採用情報」「採用エントリーフォーム」「応募完了」ページ（`/recruit`, `/recruit/entry`, `/recruit/entry/thanks`）
- [x] **「新着情報（お知らせ）」投稿型ページ群**（Cloudflare D1をWordPressの投稿タイプ相当として利用し、一覧・詳細・年別アーカイブ・ページネーションをSQLで実装）
  - `/news` — 一覧（10件/ページ、新しい順）
  - `/news/page/:page` — 一覧のページネーション
  - `/news/date/:year` — 年別アーカイブ（年フィルタのプルダウン付き）
  - `/news/date/:year/page/:page` — 年別アーカイブのページネーション
  - `/news/:id` — 詳細ページ（前の記事・次の記事への遷移ナビあり）
- [x] **「ブログ」投稿型ページ群**（カテゴリ・月別アーカイブ対応の2カラムレイアウト。サイドバーの件数はD1のGROUP BYで自動集計）
  - `/blog` — 一覧（6件/ページ、新しい順）＋サイドバー（カテゴリ一覧・過去記事アーカイブ）
  - `/blog/page/:page` — 一覧のページネーション
  - `/blog/category/:cat` — カテゴリ別一覧
  - `/blog/category/:cat/page/:page` — カテゴリ別一覧のページネーション
  - `/blog/archive/:ym`（`ym`は`YYYY-MM`形式） — 月別アーカイブ
  - `/blog/archive/:ym/page/:page` — 月別アーカイブのページネーション
  - `/blog/:id` — 詳細ページ（カテゴリタグ表示、前の記事・次の記事への遷移ナビあり）
- [x] **お知らせ・ブログへの写真・リンク・ボタンの掲載**（`thumbnail_url`カラム＋本文記法。詳細は下記「本文への写真・リンク・ボタンの入れ方」参照）
  - 一覧のサムネイル／詳細ページのアイキャッチ画像は横長16:9固定。PCでは記事幅いっぱいの視認性の良いサイズ、スマホでは画面幅にフィットした横長サイズに自動調整（`object-fit: cover`＋`aspect-ratio`で実装、CSS変更不要でレスポンシブ対応）
  - 本文中にも複数枚の写真、テキストリンク、ボタンリンクを自由な位置に挿入可能

## 機能エントリーURI一覧
| メソッド | パス | 説明 |
|---|---|---|
| GET | `/` | トップページ |
| GET | `/medical` | 当院について（1枚物、`#vision` `#director` `#outline` `#facility` `#hygiene` `#staff` の各セクションIDにアンカー遷移可能） |
| GET | `/service` | 診療のご案内（1枚物、`#reservation` `#flow` の各セクションIDにアンカー遷移可能） |
| GET | `/api/news` | お知らせ一覧取得（最大5件、JSON。トップページのプレビュー表示用） |
| GET | `/api/blog` | ブログ一覧取得（最大4件、JSON。トップページのプレビュー表示用） |
| POST | `/api/contact` | お問い合わせ・Web予約フォーム送信（JSON: name, kana, phone, email, message, type） |
| GET | `/privacy` | プライバシーポリシー |
| GET | `/reserve` | Web予約（初診専用・1時間枠）患者向け予約ウィザード |
| GET | `/api/reserve/available-dates` | 予約可能な日付一覧取得（空き枠が1つ以上ある今日以降の日付、JSON） |
| GET | `/api/reserve/slots?date=YYYY-MM-DD` | 指定日の空き枠一覧取得（JSON） |
| POST | `/api/reserve` | 予約登録（JSON: slot_id, name, phone は必須。kana, email, birth_date, symptom, message は任意） |
| GET | `/admin` | 【Basic認証必須】クリニック管理トップ（予約枠・お知らせ・ブログ管理への入り口） |
| GET | `/admin/reserve` | 【Basic認証必須】クリニック向け予約枠管理画面 |
| GET | `/api/admin/reserve/slots?date=YYYY-MM-DD` | 【Basic認証必須】指定日の全枠＋予約者情報取得（JSON） |
| POST | `/api/admin/reserve/slots` | 【Basic認証必須】枠を新規追加（JSON: slot_date, start_time。終了時刻は自動で+1時間） |
| DELETE | `/api/admin/reserve/slots/:id` | 【Basic認証必須】枠を削除（予約が入っている場合は409エラーで拒否） |
| POST | `/api/admin/reserve/slots/:id/cancel` | 【Basic認証必須】予約をキャンセルし枠を空きに戻す |
| GET | `/admin/news` | 【Basic認証必須】お知らせ管理画面 |
| GET | `/api/admin/news` | 【Basic認証必須】お知らせ一覧取得（非公開含む全件、JSON） |
| GET | `/api/admin/news/:id` | 【Basic認証必須】お知らせ1件取得（JSON） |
| POST | `/api/admin/news` | 【Basic認証必須】お知らせ新規作成（JSON: title, published_at必須。body, is_published任意） |
| PUT | `/api/admin/news/:id` | 【Basic認証必須】お知らせ更新 |
| DELETE | `/api/admin/news/:id` | 【Basic認証必須】お知らせ削除 |
| GET | `/admin/blog` | 【Basic認証必須】ブログ管理画面 |
| GET | `/api/admin/blog` | 【Basic認証必須】ブログ一覧取得（非公開含む全件、JSON） |
| GET | `/api/admin/blog/:id` | 【Basic認証必須】ブログ1件取得（JSON） |
| POST | `/api/admin/blog` | 【Basic認証必須】ブログ新規作成（JSON: title, published_at必須。body, category, thumbnail_url, is_published任意） |
| PUT | `/api/admin/blog/:id` | 【Basic認証必須】ブログ更新 |
| DELETE | `/api/admin/blog/:id` | 【Basic認証必須】ブログ削除 |
| POST | `/api/admin/upload-image` | 【Basic認証必須】画像アップロード（multipart/form-data、フィールド名`file`。JPEG/PNG/WEBP/GIF、5MBまで。Cloudflare R2に保存し`{ ok, url }`を返す） |
| GET | `/media/*` | アップロードした画像の配信（認証不要。R2から読み出し、長期キャッシュ付き） |
| GET | `/recruit` | 採用情報（1枚物、`#message` `#catch` `#jobs` `#tour` の各セクションIDにアンカー遷移可能、`#job-dentist` `#job-hygienist` `#job-assistant` で各職種タブへ遷移可能） |
| GET | `/recruit/entry` | 採用エントリーフォーム |
| GET | `/recruit/entry/thanks` | 応募完了ページ |
| POST | `/api/recruit-entry` | 採用エントリーフォーム送信（JSON: inquiry_types[], job_types[], name, kana, phone, email, message）。D1保存後、Resend API経由で`peacefultomorrow0528@gmail.com`宛に通知メールを送信（`RESEND_API_KEY`環境変数が必要。未設定時は送信スキップ） |
| GET | `/news` | お知らせ一覧（10件/ページ、年フィルタのプルダウンあり） |
| GET | `/news/page/:page` | お知らせ一覧のページ番号指定 |
| GET | `/news/date/:year` | お知らせ 年別アーカイブ（例: `/news/date/2025`） |
| GET | `/news/date/:year/page/:page` | お知らせ 年別アーカイブのページ番号指定 |
| GET | `/news/:id` | お知らせ詳細（存在しないIDは「記事が見つかりません」表示） |
| GET | `/blog` | ブログ一覧（6件/ページ、カテゴリ・過去記事アーカイブのサイドバーあり） |
| GET | `/blog/page/:page` | ブログ一覧のページ番号指定 |
| GET | `/blog/category/:cat` | ブログ カテゴリ別一覧（`:cat`はカテゴリ名をURLエンコード） |
| GET | `/blog/category/:cat/page/:page` | ブログ カテゴリ別一覧のページ番号指定 |
| GET | `/blog/archive/:ym` | ブログ 月別アーカイブ（`:ym`は`YYYY-MM`形式、例: `/blog/archive/2026-07`） |
| GET | `/blog/archive/:ym/page/:page` | ブログ 月別アーカイブのページ番号指定 |
| GET | `/blog/:id` | ブログ詳細（存在しないIDは「記事が見つかりません」表示） |

- **症状別で探す詳細ページ**: `/symptoms`（一覧）、`/symptoms/:slug`（詳細）
  - 実装済み: `pain`（痛い・しみる・腫れた・血が出た・歯がぐらぐらする）、`beauty`（審美・歯並び・ホワイトニング）、`broken`（歯やかぶせ物が欠けた・取れた）、`bite`（噛み合わせが悪い・歯が無い（少ない）／矯正・インプラント等の入れ子構造の治療法に対応）
  - **6/6 実装完了**: `maintenance`（メンテナンスを受けたい・お口の状況を知りたい／メンテナンス・デンタルドックの2セクション）、`other`（その他のお悩み・ご相談／歯ぎしり・顎関節症・小児歯科治療・口臭・入れ歯・歯を抜きたいの6セクション）も実装完了
  - データは`src/data/symptomDetails.ts`の`SYMPTOM_DETAILS`に追加するだけで新しい症状ページが自動的に有効化される設計（`src/data/site.ts`の`SYMPTOMS`配列で`ready: true`を設定）

※ 下層ページ（`/contact`）は現在ヘッダー・フッターのリンク先として用意されていますが、ページ自体は未実装です（今後、情報提供後に実装予定）。「プライバシーポリシー」「Web予約」は実装済みです（下記参照）。

## データアーキテクチャ
- **データベース**: Cloudflare D1（SQLite互換）
- **テーブル構成**:
  - `news` — お知らせ（id, title, body, published_at, is_published, created_at）
  - `blog_posts` — ブログ記事（id, title, body, category, thumbnail_url, published_at, is_published, created_at）
  - `contact_messages` — お問い合わせ・Web予約フォームの送信内容（id, name, kana, phone, email, message, type, created_at）
  - `recruit_entries` — 採用エントリーフォームの送信内容（id, inquiry_types[JSON配列文字列], job_types[JSON配列文字列], name, kana, phone, email, message, created_at）
  - `reservation_slots` — Web予約の予約枠（id, slot_date, start_time, end_time, status['open'/'booked'], created_at。`(slot_date, start_time)`にUNIQUE制約あり）
  - `reservations` — Web予約の予約者情報（id, slot_id[UNIQUE], name, kana, phone, email, birth_date, symptom, message, created_at, cancelled_at）
- **マイグレーション**: `migrations/0001_initial_schema.sql`, `migrations/0002_contact.sql`, `migrations/0003_recruit_entries.sql`, `migrations/0004_reservations.sql`
- **ファイルストレージ**: Cloudflare R2（バインディング名`MEDIA`、バケット名`medica-dental-clinic-media`）。ブログのサムネイル画像アップロード先として使用
- **シードデータ**: `seed.sql`（お知らせ23件・ブログ10件。年別/月別アーカイブとページネーションの動作確認ができるよう複数年・複数カテゴリのサンプルデータを用意）
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

## Web予約システムについて（初診専用・1時間枠・15分間隔）
「Web予約」は初診の方専用のご予約受付です。1回のご予約で1時間の診療時間を確保します。

### 患者側の流れ（`/reserve`）
1. カレンダーから空き枠がある日付を選択（空きがない日はグレー表示で選択不可）
2. その日の空き時間枠一覧から希望の時間を選択（1時間単位で表示、例: `09:00 〜 10:00`）
3. お名前・電話番号（必須）、フリガナ・メール・生年月日・症状・備考（任意）を入力して送信
4. 予約完了画面を表示（確認メール等は送信していません。変更・キャンセルは電話でのご連絡をご案内）

予約確定時は「対象の枠が`status='open'`である場合のみUPDATE」という条件付き更新のあと更新件数(`meta.changes`)を確認することで、複数の患者が同時に同じ枠を予約しようとしても二重予約が発生しないようにしています（レース対策）。

### クリニック側の流れ（`/admin/reserve`）
Basic認証で保護された管理画面から、以下の操作が可能です。
- 日付ナビ（前日／翌日／今日）で管理したい日を選択
- 「枠を追加」：開始時刻を`15分間隔`（`<input type="time" step="900">`）で指定して1件ずつ追加。終了時刻は自動で+1時間に設定
- 「一括追加」：開始〜終了の範囲を指定すると、1時間ごとの枠をまとめて登録（例: 09:00〜18:00 → 09:00, 10:00, 11:00 ... 17:00 の9枠を一括作成）
- その日の枠一覧を表示。予約が入っている枠は患者情報（氏名・フリガナ・電話番号・メール・生年月日・症状・備考）を表示し「予約キャンセル」ボタンで取消可能。空き枠は「削除」ボタンで削除可能（予約が入っている枠は削除不可、409エラーを返します）

### Web予約管理画面のBasic認証について
`/admin/reserve` と `/api/admin/reserve/*` は Basic認証で保護されています。認証情報は環境変数 `ADMIN_RESERVE_USER` / `ADMIN_RESERVE_PASSWORD` で設定します。
- **ローカル開発**: `.dev.vars` に以下を追記（既に設定済み。運用開始前に変更を推奨）
  ```
  ADMIN_RESERVE_USER=admin
  ADMIN_RESERVE_PASSWORD=akigawa2026
  ```
- **本番環境**: Cloudflare Pagesのシークレットとして設定してください
  ```bash
  npx wrangler pages secret put ADMIN_RESERVE_USER --project-name <project-name>
  npx wrangler pages secret put ADMIN_RESERVE_PASSWORD --project-name <project-name>
  ```
- `ADMIN_RESERVE_PASSWORD` が未設定の場合、管理画面・管理APIは503エラー（「管理画面のパスワードが設定されていません」）を返し、安全側に倒れる設計になっています。

## お知らせ・ブログの投稿型ページ実装について（WordPress不要の理由）
参考にした秋川臨床デンタルクリニック様のサイトは「お知らせ」「ブログ」がWordPressのカスタム投稿タイプ・アーカイブ・`wp-pagenavi`プラグインで実装されていましたが、本サイトではCloudflare D1のSQLクエリで同等の機能を実現しています。
- **一覧・新しい順表示** → `ORDER BY published_at DESC`
- **ページネーション** → `LIMIT`/`OFFSET`でページ番号ごとにSQLを再実行（`wp-pagenavi`相当）
- **年別アーカイブ** → `WHERE substr(published_at,1,4) = ?`（お知らせ）
- **月別アーカイブ・カテゴリ集計** → `GROUP BY substr(published_at,1,7)` / `GROUP BY category`でサイドバーの件数も自動集計（ブログ）
- WordPress/PHPよりもCloudflareのエッジで高速に配信でき、サーバー管理・プラグイン更新の手間も不要という利点があります。
- 記事の追加・編集は`/admin/news`（お知らせ）・`/admin/blog`（ブログ）の管理画面からブラウザ上で行えます（Basic認証で保護）。SQL直接実行や`seed.sql`への追記も引き続き利用可能です。

## お知らせ・ブログ本文への写真・リンク・ボタンの入れ方
`news.body` / `blog_posts.body` のテキストに、以下の専用記法を1行だけで書くと、その位置に写真・リンク・ボタンが挿入されます（それ以外の行は通常の段落として表示）。

| 記法 | 表示されるもの |
|---|---|
| `![説明文](画像URL)` | 横長(16:9)の写真。説明文はキャプションとして写真の下に表示 |
| `[表示テキスト](URL)` | 通常のテキストリンク（下線付き） |
| `[表示テキスト](URL){button}` | ボタン（`btn btn-primary`スタイル） |

**アイキャッチ画像（一覧サムネイル）を設定する場合**：`blog_posts.thumbnail_url` カラムに画像URLを入れると、一覧ページのサムネイル・トップページのブログカード・詳細ページ冒頭のアイキャッチに自動反映されます（`news`テーブルには`thumbnail_url`カラムはなく、お知らせは本文中の`![...]`記法のみで写真を入れる想定です）。

**記事投稿例（SQL）**:
```sql
INSERT INTO blog_posts (title, body, category, thumbnail_url, published_at) VALUES (
  'インプラント治療のメリット・デメリット',
  'インプラント治療についてご紹介します。

![模型を使ったご説明の様子](https://example.com/photo1.jpg)

治療の詳細についてはお気軽にご相談ください。

[ご予約・お問い合わせはこちら](/contact){button}',
  'インプラント',
  'https://example.com/thumbnail.jpg',
  '2026-08-13'
);
```

- 画像URLは外部の画像ホスティング（Cloudflare R2、Genspark AI Drive公開URL等）を利用する想定です（Cloudflare Pagesはランタイムでのファイルアップロード保存に対応していないため）。
- サムネイル画像（`thumbnail_url`）は`/admin/blog`の管理画面から直接アップロードでき、Cloudflare R2（バケット名`medica-dental-clinic-media`）に保存されます。本文中の`![説明文](画像URL)`用の画像は、アップロードした画像のURL（`/media/...`）を使うか、外部の画像ホスティングURLを利用してください。

## 未実装の機能・今後の開発予定
1. **残りの下層ページの実装**（ユーザーからの情報提供待ち）
   - `/contact`（お問い合わせページ、フォームUI）※症状別で探すページは6/6完了、プライバシーポリシー・Web予約は実装完了
2. **メンテナンスコース45分の追加**（Web予約システムに新しい予約枠種別として追加予定）
3. **本番Cloudflare R2バケットの作成**（`medica-dental-clinic-media`。現在のCloudflare APIトークンにR2権限（Workers R2 Storage:Edit）が不足しているため、トークンへの権限追加が必要）
4. **お問い合わせフォームのフロントエンドUI実装**（現在APIのみ実装済み）
5. **診療カレンダーのGoogleカレンダー連携**（現在は静的な休診日案内のみ）
6. **RESEND_API_KEYの設定**（採用エントリーメール通知を実際に有効化するため。上記「メール通知機能について」参照）
7. **Web予約の確認メール送信機能**（現在は予約完了時のメール・SMS通知は行っていません。ご希望であればResend APIで実装可能）

## デプロイ状況
- **プラットフォーム**: Cloudflare Pages
- **現在の状態**: ✅ 本番デプロイ済み（Web予約システムまで稼働確認済み）／お知らせ・ブログ管理画面＋画像アップロード機能はローカル開発環境で動作確認済み、本番反映は次回デプロイ時
- **最終更新**: 2026-08-13（クリニック管理トップ`/admin`・お知らせ管理`/admin/news`・ブログ管理`/admin/blog`を追加実装。ブログのサムネイル画像アップロード機能（Cloudflare R2保存）を実装。Basic認証の保護範囲を`/admin`配下・`/api/admin`配下全体に統一）
