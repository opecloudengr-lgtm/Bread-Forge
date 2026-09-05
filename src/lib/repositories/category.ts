import { db } from "@/lib/db";
import type { Category } from "@/types";

interface CategoryRow {
  id: string;
  name: string;
  created_at: string;
}

function mapRow(row: CategoryRow): Category {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function listCategories(): Category[] {
  const rows = db
    .prepare("SELECT * FROM category ORDER BY name ASC")
    .all() as unknown as CategoryRow[];
  return rows.map(mapRow);
}

export function getCategoryById(id: string): Category | null {
  const row = db.prepare("SELECT * FROM category WHERE id = ?").get(id) as
    | CategoryRow
    | undefined;
  return row ? mapRow(row) : null;
}

export function getCategoryByName(name: string): Category | null {
  const row = db
    .prepare("SELECT * FROM category WHERE name = ? COLLATE NOCASE")
    .get(name.trim()) as CategoryRow | undefined;
  return row ? mapRow(row) : null;
}

export function createCategory(name: string): Category {
  const trimmed = name.trim();
  const existing = getCategoryByName(trimmed);
  if (existing) return existing;

  const id = crypto.randomUUID();
  db.prepare("INSERT INTO category (id, name) VALUES (?, ?)").run(id, trimmed);
  return getCategoryById(id)!;
}

export function renameCategory(id: string, name: string): Category | null {
  db.prepare("UPDATE category SET name = ? WHERE id = ?").run(name.trim(), id);
  return getCategoryById(id);
}

export function deleteCategory(id: string): void {
  db.prepare("DELETE FROM category WHERE id = ?").run(id);
}

export function sermonCountForCategory(id: string): number {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM sermon_category WHERE category_id = ?")
    .get(id) as { count: number };
  return row.count;
}
