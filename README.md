# メディカデンタルクリニック Web予約システム

## プロジェクト概要
- **名称**: メディカデンタルクリニック Web予約システム
- **目的**: 石川県金沢市の歯科医院「メディカデンタルクリニック」のWeb予約専用システム。
  トップページ・お知らせ・ブログ・当院について・症状別ページ・採用情報などのコンテンツは
  WordPress（`http://medica-clinic.tomyama.com/`, Xserver）側で運用し、
  本プロジェクト（Cloudflare Pages）は**初診Web予約機能のみ**を担当するハイブリッド構成です。

## URLs
- **予約システム（本番）**: https://medica-dental-clinic.pages.dev （`/` → `/reserve` に自動リダイレクト）
- **クリニック本体サイト（WordPress）**: http://medica-clinic.tomyama.com/
- **管理画面**: `/admin`（Basic認証）

## 現在完了している機能
- 初診患者向けWeb予約（コース選択 → カレンダー → 時間選択 → 予約者情報入力 → 完了、4ステップ）
- クリニック受付側の予約枠管理画面（`/admin/reserve`）
  - コース設定（初診：ドクター診察／初診：メンテナンス、所要時間30/45/60分）
  - 歯科衛生士の登録・並び替え・有効/無効切り替え
  - 歯科衛生士ごとの休み（日単位・時間帯単位）登録
  - 予約枠の追加・削除（一括追加対応）
  - 受付スタッフによる手動予約登録・キャンセル
  - 予約枠の同時予約防止（排他制御付き）
- `/` へのアクセスは `/reserve` へ302リダイレクト
- ヘッダー／フッターからWordPress本体サイトへのリンク

## 主なエントリーURI
- `GET /` → `/reserve` へリダイレクト
- `GET /reserve` : Web予約ページ（患者向け）
- `GET /admin` : 管理トップ（要Basic認証）
- `GET /admin/reserve` : 予約枠管理画面（要Basic認証）
- `GET /api/reserve/courses` : コース一覧取得
- `GET /api/reserve/available-dates?course=...` : 予約可能日一覧
- `GET /api/reserve/slots?date=...&course=...` : 指定日の空き時間一覧
- `POST /api/reserve` : 予約登録
- `/api/admin/*` : 管理系API（コース設定・歯科衛生士・休み・予約枠・手動予約、要Basic認証）

## データモデル・ストレージ
- **Cloudflare D1**（binding: `DB`, database_name: `webapp-production`）
  - `course_settings` / `hygienists` / `hygienist_time_off` / `reservation_slots` / `reservations`
  - `contact_messages` / `recruit_entries` テーブルは、旧フルサイト時代のデータ保持のためテーブル自体は残置（アプリからは未使用、0件）
- **R2ストレージは廃止**：画像アップロード機能を削除したため `wrangler.jsonc` から `r2_buckets` バインディングを削除済み

## 利用ガイド
1. 患者は本体サイト（WordPress）または直接 `/reserve` にアクセスし、コース・日時を選んで予約
2. クリニックスタッフは `/admin/reserve` から予約枠の管理・手動予約登録・歯科衛生士の休み管理を実施

## デプロイ状況
- **プラットフォーム**: Cloudflare Pages（`medica-dental-clinic` プロジェクト）
- **技術スタック**: Hono + TypeScript + Cloudflare D1、フロントはCDN配信のTailwind/FontAwesome不使用（独自CSS `style.css`）
- **状態**: 予約専用へのリファクタリング完了、ローカルビルド・起動確認済み。本番への再デプロイは未実施（次回作業）
- **最終更新**: 2026-08-15

## 今後の作業（未実施）
- Cloudflare Pages本番への再デプロイ（`wrangler pages deploy`）
- GitHubへのプッシュ
- 旧カスタムドメイン `clinic.tomyama.com` の削除（Cloudflare側・Xserver DNS側）
