-- 歯科衛生士マスタ（1〜5名程度、増減・休職に対応）
CREATE TABLE IF NOT EXISTS hygienists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1, -- 1=稼働中 / 0=休職中(非表示)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- コース設定（初診=院長 / 初診メンテナンス=歯科衛生士）の標準所要時間（分）
-- クリニックごとに30/45/60分から選べるようにするための設定テーブル
CREATE TABLE IF NOT EXISTS course_settings (
  course_type TEXT PRIMARY KEY, -- 'initial_doctor' / 'initial_maintenance'
  duration_minutes INTEGER NOT NULL,
  label TEXT NOT NULL
);

INSERT OR IGNORE INTO course_settings (course_type, duration_minutes, label) VALUES
  ('initial_doctor', 60, '初診'),
  ('initial_maintenance', 45, '初診メンテナンス');

-- reservation_slots を再構築
-- 旧テーブルには UNIQUE (slot_date, start_time) が付いており、
-- 「同じ日・同じ時間に複数の歯科衛生士の枠を並行して持つ」ことができなかったため、
-- コース種別・担当衛生士を含めたユニーク制約に置き換える。
CREATE TABLE reservation_slots_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_date TEXT NOT NULL,      -- YYYY-MM-DD
  start_time TEXT NOT NULL,     -- HH:MM
  end_time TEXT NOT NULL,       -- HH:MM (start_time + duration_minutes)
  status TEXT NOT NULL DEFAULT 'open', -- open / booked / closed(非公開)
  course_type TEXT NOT NULL DEFAULT 'initial_doctor', -- 'initial_doctor' / 'initial_maintenance'
  hygienist_id INTEGER REFERENCES hygienists (id), -- 初診メンテナンスのみ使用
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 既存データ移行：これまでの枠はすべて「初診（院長）」枠だったものとして引き続き使えるようにする
INSERT INTO reservation_slots_new (id, slot_date, start_time, end_time, status, course_type, hygienist_id, duration_minutes, created_at)
SELECT id, slot_date, start_time, end_time, status, 'initial_doctor', NULL, 60, created_at
FROM reservation_slots;

DROP TABLE reservation_slots;
ALTER TABLE reservation_slots_new RENAME TO reservation_slots;

CREATE INDEX IF NOT EXISTS idx_reservation_slots_date ON reservation_slots (slot_date);
CREATE INDEX IF NOT EXISTS idx_reservation_slots_status ON reservation_slots (status);
CREATE INDEX IF NOT EXISTS idx_reservation_slots_course_type ON reservation_slots (course_type);
CREATE INDEX IF NOT EXISTS idx_reservation_slots_hygienist_id ON reservation_slots (hygienist_id);

-- 「同じ日・同じ時間・同じコース・同じ担当(院長の場合はNULLをまとめて1件扱い)」の重複だけを防ぐ
-- (COALESCEでhygienist_idのNULLを0に揃えることで、院長枠の重複だけは防ぎつつ、
--  複数の歯科衛生士が同じ日時に別々の枠を持てるようにする)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_slots_unique_slot
  ON reservation_slots (slot_date, start_time, course_type, COALESCE(hygienist_id, 0));
