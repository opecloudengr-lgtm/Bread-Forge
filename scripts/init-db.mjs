#!/usr/bin/env node
// Ensures the SQLite file and schema exist before `next build` starts.
// `next build` imports src/lib/db.ts from several worker processes at once
// (for page-data collection); if the database file doesn't exist yet, those
// workers can race to create it and hit "database is locked" even with
// busy_timeout set, since that race is over creating the file itself, not
// contention on an already-open one. Running this once, serially, first
// removes the race — by the time the workers import db.ts, the file and
// schema already exist and their init calls are cheap no-ops.
//
// Wired up as the "prebuild" script, so `npm run build` runs it automatically.

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA } from "./schema.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const DB_PATH = process.env.DATABASE_PATH || path.join(projectRoot, "data", "bread-forge.db");

mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA busy_timeout = 5000;");
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec(SCHEMA);

console.log("[bread-forge] Database file and schema ready.");
