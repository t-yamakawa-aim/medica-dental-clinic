-- 採用エントリーフォーム送信内容
CREATE TABLE IF NOT EXISTS recruit_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_types TEXT NOT NULL, -- チェックされたお問い合わせ内容(JSON配列文字列)
  job_types TEXT, -- チェックされた希望職種(JSON配列文字列)
  name TEXT NOT NULL,
  kana TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
