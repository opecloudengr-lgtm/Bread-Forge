import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bread-forge.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

declare global {
  var __breadForgeDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  const db = new DatabaseSync(DB_PATH);
  // busy_timeout must be set before anything that can contend for a lock
  // (journal_mode included) so concurrent connections wait instead of
  // failing immediately with "database is locked" — this matters at build
  // time, when Next spins up several workers that each import this module.
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

export const db: DatabaseSync = globalThis.__breadForgeDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  globalThis.__breadForgeDb = db;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS admin (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  reset_token_hash TEXT,
  reset_token_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS category (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sermon (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  date_preached TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'audio',
  media_url TEXT NOT NULL,
  downloadable_file_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sermon_category (
  sermon_id TEXT NOT NULL REFERENCES sermon(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES category(id) ON DELETE CASCADE,
  PRIMARY KEY (sermon_id, category_id)
);

CREATE TABLE IF NOT EXISTS event (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_date TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_media (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  original_name TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sermon_date ON sermon(date_preached DESC);
CREATE INDEX IF NOT EXISTS idx_event_date ON event(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_event_media_event ON event_media(event_id);
CREATE INDEX IF NOT EXISTS idx_sermon_category_sermon ON sermon_category(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_category_category ON sermon_category(category_id);
`;

let initialized = false;

export function initDb() {
  if (initialized) return;
  try {
    db.exec(SCHEMA);
    seedDefaultCategories();
    seedAdminFromEnv();
    initialized = true;
  } catch (error) {
    // During `next build`, several workers can import this module at once and
    // race to initialize the same SQLite file. The schema/seed statements are
    // idempotent, so it's safe to let another worker's attempt win and retry
    // lazily on the next real query instead of crashing the build.
    console.warn("[bread-forge] Database init deferred:", (error as Error).message);
  }
}

function seedDefaultCategories() {
  const defaults = ["Relationship", "Faith", "Prayer", "Intimacy", "Warfare", "Bible Study"];
  const insert = db.prepare(
    "INSERT OR IGNORE INTO category (id, name) VALUES (?, ?)"
  );
  for (const name of defaults) {
    insert.run(crypto.randomUUID(), name);
  }
}

function seedAdminFromEnv() {
  const count = db.prepare("SELECT COUNT(*) as count FROM admin").get() as { count: number };
  if (count.count > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "[bread-forge] No admin account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file and restart the server to create one."
    );
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  db.prepare(
    "INSERT INTO admin (id, email, password_hash) VALUES (?, ?, ?)"
  ).run(crypto.randomUUID(), email.toLowerCase().trim(), passwordHash);
  console.log(`[bread-forge] Created initial admin account for ${email}`);
}

initDb();
