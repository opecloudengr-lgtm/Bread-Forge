#!/usr/bin/env node
// Creates the admin account if none exists, or updates the existing one's
// email/password to match ADMIN_EMAIL/ADMIN_PASSWORD — unlike the
// first-boot auto-seed in src/lib/db.ts (which only ever runs once, against
// an empty database), this always applies whatever is currently in .env.
//
// Usage: npm run admin:set
// (reads ADMIN_EMAIL / ADMIN_PASSWORD from .env via `node --env-file=.env`)

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const DB_PATH = process.env.DATABASE_PATH || path.join(projectRoot, "data", "bread-forge.db");

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error(
    "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before running this script."
  );
  process.exit(1);
}

mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA busy_timeout = 5000;");
db.exec(`
CREATE TABLE IF NOT EXISTS admin (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  reset_token_hash TEXT,
  reset_token_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);
`);

const passwordHash = bcrypt.hashSync(password, 12);
const existing = db.prepare("SELECT id FROM admin LIMIT 1").get();

if (existing) {
  db.prepare(
    "UPDATE admin SET email = ?, password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?"
  ).run(email.toLowerCase().trim(), passwordHash, existing.id);
  console.log(`Updated the existing admin account to sign in as ${email}.`);
} else {
  db.prepare("INSERT INTO admin (id, email, password_hash) VALUES (?, ?, ?)").run(
    crypto.randomUUID(),
    email.toLowerCase().trim(),
    passwordHash
  );
  console.log(`Created the admin account for ${email}.`);
}
