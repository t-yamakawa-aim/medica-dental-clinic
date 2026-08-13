-- お知らせ (News)
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT,
  published_at TEXT NOT NULL, -- YYYY-MM-DD
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);

-- ブログ (Blog)
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT,
  thumbnail_url TEXT,
  published_at TEXT NOT NULL, -- YYYY-MM-DD
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_published_at ON blog_posts(published_at DESC);
