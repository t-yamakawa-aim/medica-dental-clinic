-- スタッフ管理の一般化（歯科衛生士のみ → 歯科医師/歯科衛生士 両対応）
-- ・歯科医師を1〜4名程度まで登録できるようにする
-- ・休み管理（日付・時間帯単位）は歯科医師にも同様に適用する
-- ・患者番号（院内で使う任意の管理番号）を予約情報に追加する
--
-- 注意: リモートD1(Cloudflare API経由)では、外部キー制約を持つテーブルの
-- DROP→CREATE→RENAME（テーブル再構築）を行うと、既存データがある場合に
-- 参照元テーブル(reservations)との整合性チェックで FOREIGN KEY constraint failed
-- になることを確認したため、reservation_slots 自体は再構築せず
-- ALTER TABLE ADD/DROP COLUMN で staff_id 列を追加する方式に変更している。
PRAGMA defer_foreign_keys = TRUE;

-- ---- 1. hygienists → staff（role列を追加して一般化） ----
CREATE TABLE staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'hygienist', -- 'dentist' / 'hygienist'
  is_active INTEGER NOT NULL DEFAULT 1,   -- 1=稼働中 / 0=休職中(非表示)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 既存の歯科衛生士データをそのまま role='hygienist' として移行
INSERT INTO staff (id, name, role, is_active, sort_order, created_at)
SELECT id, name, 'hygienist', is_active, sort_order, created_at FROM hygienists;

-- 既存の「初診（院長）」枠は誰か1名の歯科医師という前提で hygienist_id=NULL だったため、
-- 今後は歯科医師も staff で管理し、初診枠にも担当者を割り当てられるようにする。
-- 移行時点で「院長」という名前の歯科医師を1名自動作成し、既存の初診枠をすべてこの歯科医師に紐付ける。
-- （名前は管理画面から後で変更可能）
INSERT INTO staff (name, role, is_active, sort_order)
VALUES ('院長', 'dentist', 1, 0);

-- ---- 2. reservation_slots.hygienist_id を staff_id に一般化 ----
-- (テーブル自体は再構築せず列の追加/削除で対応する)
DROP INDEX IF EXISTS idx_reservation_slots_unique_slot;
DROP INDEX IF EXISTS idx_reservation_slots_hygienist_id;

ALTER TABLE reservation_slots ADD COLUMN staff_id INTEGER REFERENCES staff (id);

-- 初診メンテナンス枠: 既存の hygienist_id をそのまま staff_id に引き継ぐ（IDは維持しているため一致する）
-- 初診(院長)枠: hygienist_id が NULL だったものを、上で作成した「院長」staffのIDに紐付ける
UPDATE reservation_slots
SET staff_id = COALESCE(hygienist_id, (SELECT id FROM staff WHERE name = '院長' AND role = 'dentist'));

ALTER TABLE reservation_slots DROP COLUMN hygienist_id;

CREATE INDEX IF NOT EXISTS idx_reservation_slots_date ON reservation_slots (slot_date);
CREATE INDEX IF NOT EXISTS idx_reservation_slots_status ON reservation_slots (status);
CREATE INDEX IF NOT EXISTS idx_reservation_slots_course_type ON reservation_slots (course_type);
CREATE INDEX IF NOT EXISTS idx_reservation_slots_staff_id ON reservation_slots (staff_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_slots_unique_slot
  ON reservation_slots (slot_date, start_time, course_type, COALESCE(staff_id, 0));

-- ---- 3. hygienist_time_off → staff_time_off に一般化 ----
CREATE TABLE staff_time_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER NOT NULL REFERENCES staff (id),
  off_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO staff_time_off (id, staff_id, off_date, start_time, end_time, reason, created_at)
SELECT id, hygienist_id, off_date, start_time, end_time, reason, created_at FROM hygienist_time_off;

DROP TABLE hygienist_time_off;

CREATE INDEX IF NOT EXISTS idx_staff_time_off_staff_id ON staff_time_off (staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_off_off_date ON staff_time_off (off_date);

-- ---- 4. 旧 hygienists テーブルを削除 ----
-- (reservation_slots・hygienist_time_off の移行が完了し、
--  もう hygienists を参照するテーブルが存在しなくなった後に削除する)
DROP TABLE hygienists;

-- ---- 5. 予約に院内患者番号(任意)を追加 ----
ALTER TABLE reservations ADD COLUMN patient_number TEXT;
