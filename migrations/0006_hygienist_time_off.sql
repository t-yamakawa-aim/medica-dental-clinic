-- 歯科衛生士の「日付・時間帯単位の休み」管理
-- 「稼働中/休職中」のような固定フラグではなく、
-- 例: Aさんは8/20は終日有給、Bさんは8/21の10:00〜12:00だけお休み、
-- のように日によって異なる勤務パターンに対応できるようにする。
--
-- start_time / end_time が両方NULLの場合は「終日休み」を意味する。
-- 部分的な休み（午前休・時短出勤など）は start_time〜end_time で期間を指定する。
CREATE TABLE IF NOT EXISTS hygienist_time_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hygienist_id INTEGER NOT NULL REFERENCES hygienists (id),
  off_date TEXT NOT NULL,   -- YYYY-MM-DD
  start_time TEXT,          -- HH:MM（NULL=終日休みの開始扱い）
  end_time TEXT,            -- HH:MM（NULL=終日休みの終了扱い）
  reason TEXT,              -- 任意メモ（例: 有給、私用、通院 など）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hygienist_time_off_hygienist_id ON hygienist_time_off (hygienist_id);
CREATE INDEX IF NOT EXISTS idx_hygienist_time_off_date ON hygienist_time_off (off_date);
