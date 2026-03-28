-- Users
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'member',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- OAuth accounts
CREATE TABLE oauth_accounts (
  provider      TEXT NOT NULL,
  provider_id   TEXT NOT NULL,
  user_id       TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY (provider, provider_id)
);

-- Sessions
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  expires_at    TEXT NOT NULL
);

-- Categories
CREATE TABLE categories (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE
);

-- Tags
CREATE TABLE tags (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE
);

-- Posts
CREATE TABLE posts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id         TEXT REFERENCES users(id),
  title             TEXT NOT NULL,
  content           TEXT NOT NULL,
  excerpt           TEXT DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'draft',
  primary_category  TEXT NOT NULL REFERENCES categories(slug),
  thumbnail_url     TEXT,
  published_at      TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Post <-> Category (many-to-many)
CREATE TABLE post_categories (
  post_id       INTEGER NOT NULL REFERENCES posts(id),
  category_slug TEXT NOT NULL REFERENCES categories(slug),
  PRIMARY KEY (post_id, category_slug)
);

-- Post <-> Tag (many-to-many)
CREATE TABLE post_tags (
  post_id       INTEGER NOT NULL REFERENCES posts(id),
  tag_slug      TEXT NOT NULL REFERENCES tags(slug),
  PRIMARY KEY (post_id, tag_slug)
);

-- Static pages (about, tos, etc.)
CREATE TABLE pages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_posts_status ON posts(status, published_at DESC);
CREATE INDEX idx_posts_primary_cat ON posts(primary_category);
CREATE INDEX idx_post_categories_slug ON post_categories(category_slug);
CREATE INDEX idx_post_tags_slug ON post_tags(tag_slug);
CREATE INDEX idx_sessions_user ON sessions(user_id);
