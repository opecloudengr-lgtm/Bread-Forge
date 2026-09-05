import { db } from "@/lib/db";

export interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  reset_token_hash: string | null;
  reset_token_expires_at: string | null;
  created_at: string;
  last_login_at: string | null;
}

export function getAdminByEmail(email: string): AdminRow | null {
  const row = db
    .prepare("SELECT * FROM admin WHERE email = ? COLLATE NOCASE")
    .get(email.trim()) as AdminRow | undefined;
  return row ?? null;
}

export function getAdminById(id: string): AdminRow | null {
  const row = db.prepare("SELECT * FROM admin WHERE id = ?").get(id) as
    | AdminRow
    | undefined;
  return row ?? null;
}

export function touchLastLogin(id: string): void {
  db.prepare("UPDATE admin SET last_login_at = datetime('now') WHERE id = ?").run(id);
}

export function setResetToken(id: string, tokenHash: string, expiresAtIso: string): void {
  db.prepare(
    "UPDATE admin SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?"
  ).run(tokenHash, expiresAtIso, id);
}

export function clearResetToken(id: string): void {
  db.prepare(
    "UPDATE admin SET reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?"
  ).run(id);
}

export function updatePassword(id: string, passwordHash: string): void {
  db.prepare("UPDATE admin SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}

export function getAdminByValidResetToken(tokenHash: string): AdminRow | null {
  const row = db
    .prepare(
      `SELECT * FROM admin
       WHERE reset_token_hash = ?
       AND reset_token_expires_at IS NOT NULL
       AND reset_token_expires_at > datetime('now')`
    )
    .get(tokenHash) as AdminRow | undefined;
  return row ?? null;
}
