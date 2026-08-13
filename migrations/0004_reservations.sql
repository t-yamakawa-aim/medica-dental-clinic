-- Web予約（初診専用・1時間枠）
-- 予約可能な時間枠（クリニック側が15分間隔の開始時刻で登録）
CREATE TABLE IF NOT EXISTS reservation_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_date TEXT NOT NULL,      -- YYYY-MM-DD
  start_time TEXT NOT NULL,     -- HH:MM (15分間隔で登録想定)
  end_time TEXT NOT NULL,       -- HH:MM (start_time + 60分)
  status TEXT NOT NULL DEFAULT 'open', -- open / booked / closed(非公開)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (slot_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_reservation_slots_date ON reservation_slots (slot_date);
CREATE INDEX IF NOT EXISTS idx_reservation_slots_status ON reservation_slots (status);

-- 患者からの予約申込内容（初診専用）
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_id INTEGER NOT NULL UNIQUE REFERENCES reservation_slots (id),
  name TEXT NOT NULL,
  kana TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  birth_date TEXT,   -- YYYY-MM-DD (任意)
  symptom TEXT,      -- 症状・ご相談内容(任意)
  message TEXT,      -- その他備考(任意)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelled_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_reservations_slot_id ON reservations (slot_id);
