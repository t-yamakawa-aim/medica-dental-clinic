# メディカデンタルクリニック Web予約システム

## プロジェクト概要
- **名称**: メディカデンタルクリニック Web予約システム
- **目的**: 石川県金沢市の歯科医院「メディカデンタルクリニック」のWeb予約専用システム。
  トップページ・お知らせ・ブログ・当院について・症状別ページ・採用情報などのコンテンツは
  WordPress（`http://medica-clinic.tomyama.com/`, Xserver）側で運用し、
  本プロジェクト（Cloudflare Pages）は**初診Web予約機能のみ**を担当するハイブリッド構成です。

## URLs
- **予約システム（本番・カスタムドメイン）**: https://clinic.tomyama.com/ （`/` → `/reserve` に自動リダイレクト）
- **予約システム（本番・Workers直URL）**: https://medica-dental-clinic.medica-consul.workers.dev
- **クリニック本体サイト（WordPress）**: http://medica-clinic.tomyama.com/
- **管理画面**: `/admin`（Basic認証）

## 現在完了している機能
- 初診患者向けWeb予約（コース選択 → カレンダー → 時間選択 → 予約者情報入力 → 完了、4ステップ）
  - 患者番号（任意・当院にお心当たりがある方向け）の入力欄あり
- クリニック受付側の予約枠管理画面（`/admin/reserve`）
  - コース設定（初診／初診メンテナンス・歯科検診、所要時間30/45/60分）
  - **担当スタッフ管理**：歯科医師（1〜4名程度）・歯科衛生士を統合したスタッフ台帳で管理（役割ごとに登録・並び替え・有効/無効切り替え）
  - コースごとに担当できる役割を判定（初診＝歯科医師、初診メンテナンス＝歯科衛生士）し、役割不一致は登録時にエラー
  - スタッフ（歯科医師・歯科衛生士どちらも）ごとの休み（日単位・時間帯単位）登録
  - 予約枠の追加・削除（一括追加対応）
  - 受付スタッフによる手動予約登録・キャンセル（患者番号の入力・編集も可能）
  - 予約枠の同時予約防止（排他制御付き）
- **当日担当表（`/admin/schedule`）**：スタッフ×時間帯のマトリクス形式で、その日の各担当者の患者（氏名・患者番号・コース）を一覧表示
  - 列は歯科医師→歯科衛生士の順、時間帯行はその日に実際に作成された予約枠から自動生成
  - 休みのスタッフはセルに「休」と表示
  - 日付ナビ・「本日」「翌日」ボタンあり
  - ブラウザ印刷（`window.print()`）に対応：印刷時はメニュー等を隠し、表のみを紙で持ち歩ける形式に整形（インターネット障害時のバックアップ用途）
- `/` へのアクセスは `/reserve` へ302リダイレクト
- ヘッダー／フッターからWordPress本体サイトへのリンク
- **予約確認メール・24時間前リマインダーメール送信（新機能）**：Resend APIを利用
  - 患者がWeb予約完了時・受付スタッフが代理登録時のいずれも、メールアドレスが入力されていれば確認メール（件名「次回ご予約について」）を自動送信
  - Cloudflare Workersの Cron Trigger（毎時0分実行）で、予約日時の24時間前になった予約を検出し、リマインダーメール（同一件名）を自動送信
  - 差出人名は環境変数`MAIL_FROM_NAME`で設定（本サンプルでは「メディカデンタルクリニック予約システム」）
  - 送信済みフラグ（`confirmation_sent_at` / `reminder_sent_at`）で二重送信を防止
  - ⚠️ 現状`RESEND_API_KEY`の送信ドメインが未検証のため、実際にはアカウント所有者自身のメールアドレス宛にしか送信できません。本プロジェクトはあくまでプレゼン用サンプルのため実運用は想定していませんが、実際に不特定多数へ配信する場合はResend側でのドメイン検証（SPF/DKIM設定）が必要です。

## 主なエントリーURI
- `GET /` → `/reserve` へリダイレクト
- `GET /reserve` : Web予約ページ（患者向け、患者番号入力欄あり）
- `GET /admin` : 管理トップ（要Basic認証）
- `GET /admin/reserve` : 予約枠管理画面（要Basic認証）
- `GET /admin/schedule` : 当日担当表（スタッフ×時間帯マトリクス、印刷対応、要Basic認証）
- `GET /api/reserve/courses` : コース一覧取得
- `GET /api/reserve/available-dates?course=...` : 予約可能日一覧
- `GET /api/reserve/slots?date=...&course=...` : 指定日の空き時間一覧
- `POST /api/reserve` : 予約登録（`patient_number` 任意）
- `GET /api/admin/schedule?date=YYYY-MM-DD` : 当日担当表データ取得（要Basic認証）
- `/api/admin/staff*` : スタッフ（歯科医師・歯科衛生士）管理API（要Basic認証）
- `/api/admin/staff-time-off*` : スタッフの休み管理API（要Basic認証）
- `/api/admin/*` : その他管理系API（コース設定・予約枠・手動予約、要Basic認証）
- `POST /api/admin/reminders/run` : リマインダーメール送信を手動実行（動作確認用、要Basic認証なし・要今後検討）

## データモデル・ストレージ
- **Cloudflare D1**（binding: `DB`, database_name: `webapp-production`）
  - `staff`（旧`hygienists`を一般化。`role`列で`dentist`/`hygienist`を区別、歯科医師1〜4名程度・歯科衛生士複数名に対応）
  - `staff_time_off`（旧`hygienist_time_off`を一般化。歯科医師・歯科衛生士どちらの休みも管理）
  - `course_settings` / `reservation_slots`（`staff_id`でスタッフに紐付け）/ `reservations`（`patient_number`列を追加、任意の院内患者番号）
  - `contact_messages` / `recruit_entries` テーブルは、旧フルサイト時代のデータ保持のためテーブル自体は残置（アプリからは未使用、0件）
  - 移行時、既存の初診枠（旧`hygienist_id`がNULLだった枠）は自動作成した歯科医師「院長」（仮名、管理画面から変更可能）に紐付け済み
  - `reservations.confirmation_sent_at` / `reminder_sent_at`（新規追加、メール送信済みフラグ）
- **R2ストレージは廃止**：画像アップロード機能を削除したため `wrangler.jsonc` から `r2_buckets` バインディングを削除済み
- **Resend API**（メール送信、`RESEND_API_KEY`環境変数）：確認メール・リマインダーメールの送信に使用

## 利用ガイド
1. 患者は本体サイト（WordPress）または直接 `/reserve` にアクセスし、コース・日時を選んで予約（患者番号が分かれば任意で入力可能）
2. クリニックスタッフは `/admin/reserve` から予約枠の管理・手動予約登録・スタッフ（歯科医師・歯科衛生士）の休み管理を実施
3. 当日の担当スケジュールを一覧・印刷したい場合は `/admin/schedule` を利用（インターネット障害時に備えて事前に印刷しておくことを推奨）
4. 自動作成された歯科医師「院長」は、`/admin/reserve` のスタッフ管理から実際の氏名に変更可能

## デプロイ状況
- **プラットフォーム**: Cloudflare Workers（`medica-dental-clinic`、2026-08-20にCloudflare Pagesから移行）
  - 移行理由：Cron Trigger（定期実行）はCloudflare Pages Functionsでは非対応のため、24時間前リマインダー機能の実現にはWorkers移行が必須だった
  - 静的アセットは`assets`バインディング（`./dist`）で配信、Pages時代と同様の挙動を維持
  - Cron Trigger: `0 * * * *`（毎時0分にリマインダー対象をチェック）
  - **カスタムドメイン`clinic.tomyama.com`の切替完了（2026-08-20）**：このドメインのDNSはCloudflare管理外（Xserver等）にあり、Workersの標準カスタムドメイン機能はCloudflare DNSゾーンが必須のため直接は使えない。そのため旧Cloudflare Pagesプロジェクト（`medica-dental-clinic`）を「新Worker版への透過プロキシ」（`_worker.js`でfetchをWorkers URLへ中継）に置き換える方式でDNS変更なし・即時切替を実現。動作確認済み（`/api/reserve/courses`→200、`/admin`→401、`/`→302）。
  - 上記の理由により、旧Pagesプロジェクト（`medica-dental-clinic`）自体は完全には削除できない（削除するとカスタムドメイン紐付けが消えて`clinic.tomyama.com`がダウンする）。現在はロジックを持たない薄いプロキシとして最小化されている。
  - **workers.devアカウントサブドメイン名の変更（2026-08-20）**：本番URLに含まれていた個人Cloudflareアカウント由来の文字列`peacefultomorrow0528`をユーザー様ご自身がCloudflareダッシュボードから`medica-consul`に変更（tada側の同様の要望に伴うアカウント全体の設定変更）。これによりWorkers直URLも`medica-dental-clinic.medica-consul.workers.dev`に変わったため、上記プロキシの参照先を追従して修正・再デプロイ済み。`clinic.tomyama.com`経由の動作に影響がないことを確認済み。
  - 真のWorkers Custom Domain化（Cloudflareへネームサーバー移管してゾーン管理下に置く）は影響範囲が大きいため未実施。ご希望があれば別途対応。
- **技術スタック**: Hono + TypeScript + Cloudflare D1 + Resend API（メール送信）、フロントはCDN配信のTailwind/FontAwesome不使用(独自CSS `style.css`)
- **状態**: ✅ 予約専用へのリファクタリング完了、歯科医師拡張(1-4名)・当日担当表・患者番号機能・予約確認メール/24時間前リマインダー機能デプロイ済み、カスタムドメイン切替済み
- **最終更新**: 2026-08-20

## 今後の作業(未実施)
- Resend送信ドメインの検証(SPF/DKIM設定):現状はアカウント所有者宛以外にメール送信不可。本プロジェクトはプレゼン用サンプルのため必須ではないが、実配信したい場合は要対応
- （任意）`clinic.tomyama.com`の真のWorkers Custom Domain化（ネームサーバーをCloudflareに移管する場合）
