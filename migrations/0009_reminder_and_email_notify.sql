-- 予約確認メール・24時間前リマインダーメール対応
-- ・reminder_sent_at: リマインダーメール送信済みかどうかのタイムスタンプ(NULL=未送信)
-- ・confirmation_sent_at: 予約確定時の確認メール送信済みかどうかのタイムスタンプ(NULL=未送信、送信失敗時の再試行判定にも使える)
ALTER TABLE reservations ADD COLUMN confirmation_sent_at DATETIME;
ALTER TABLE reservations ADD COLUMN reminder_sent_at DATETIME;

CREATE INDEX IF NOT EXISTS idx_reservations_reminder_sent_at ON reservations (reminder_sent_at);
