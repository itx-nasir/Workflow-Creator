CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  canvas_data TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_approved INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  is_template INTEGER NOT NULL DEFAULT 0 -- New column definition
);

INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'admin', 'admin');
