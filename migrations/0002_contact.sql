-- お問い合わせ・Web予約フォーム送信内容
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kana TEXT,
  phone TEXT,
  email TEXT,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'contact', -- 'contact' or 'reserve'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
