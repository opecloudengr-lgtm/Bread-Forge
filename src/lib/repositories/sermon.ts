import { db } from "@/lib/db";
import type { Category, MediaType, Sermon } from "@/types";
import { getCategoryById } from "@/lib/repositories/category";

interface SermonRow {
  id: string;
  title: string;
  speaker: string;
  date_preached: string;
  description: string;
  cover_image_url: string | null;
  media_type: string;
  media_url: string;
  downloadable_file_url: string | null;
  created_at: string;
  updated_at: string;
}

function categoriesForSermon(sermonId: string): Category[] {
  const rows = db
    .prepare(
      `SELECT c.* FROM category c
       JOIN sermon_category sc ON sc.category_id = c.id
       WHERE sc.sermon_id = ?
       ORDER BY c.name ASC`
    )
    .all(sermonId) as { id: string; name: string; created_at: string }[];
  return rows.map((r) => ({ id: r.id, name: r.name, createdAt: r.created_at }));
}

function mapRow(row: SermonRow): Sermon {
  return {
    id: row.id,
    title: row.title,
    speaker: row.speaker,
    datePreached: row.date_preached,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    mediaType: row.media_type as MediaType,
    mediaUrl: row.media_url,
    downloadableFileUrl: row.downloadable_file_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categories: categoriesForSermon(row.id),
  };
}

export interface SermonListFilters {
  categoryId?: string;
  search?: string;
}

export function listSermons(filters: SermonListFilters = {}): Sermon[] {
  const clauses: string[] = [];
  const params: string[] = [];

  let baseQuery = "SELECT DISTINCT s.* FROM sermon s";

  if (filters.categoryId) {
    baseQuery += " JOIN sermon_category sc ON sc.sermon_id = s.id";
    clauses.push("sc.category_id = ?");
    params.push(filters.categoryId);
  }

  if (filters.search && filters.search.trim()) {
    clauses.push("(s.title LIKE ? OR s.speaker LIKE ?)");
    const like = `%${filters.search.trim()}%`;
    params.push(like, like);
  }

  if (clauses.length) {
    baseQuery += " WHERE " + clauses.join(" AND ");
  }

  baseQuery += " ORDER BY s.date_preached DESC, s.created_at DESC";

  const rows = db.prepare(baseQuery).all(...params) as unknown as SermonRow[];
  return rows.map(mapRow);
}

export function getSermonById(id: string): Sermon | null {
  const row = db.prepare("SELECT * FROM sermon WHERE id = ?").get(id) as
    | SermonRow
    | undefined;
  return row ? mapRow(row) : null;
}

export interface SermonInput {
  title: string;
  speaker: string;
  datePreached: string;
  description: string;
  coverImageUrl: string | null;
  mediaType: MediaType;
  mediaUrl: string;
  downloadableFileUrl: string | null;
  categoryIds: string[];
}

function setSermonCategories(sermonId: string, categoryIds: string[]) {
  db.prepare("DELETE FROM sermon_category WHERE sermon_id = ?").run(sermonId);
  const insert = db.prepare(
    "INSERT OR IGNORE INTO sermon_category (sermon_id, category_id) VALUES (?, ?)"
  );
  for (const categoryId of categoryIds) {
    if (getCategoryById(categoryId)) {
      insert.run(sermonId, categoryId);
    }
  }
}

export function createSermon(input: SermonInput): Sermon {
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO sermon
      (id, title, speaker, date_preached, description, cover_image_url, media_type, media_url, downloadable_file_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.title,
    input.speaker,
    input.datePreached,
    input.description,
    input.coverImageUrl,
    input.mediaType,
    input.mediaUrl,
    input.downloadableFileUrl
  );
  setSermonCategories(id, input.categoryIds);
  return getSermonById(id)!;
}

export function updateSermon(id: string, input: SermonInput): Sermon | null {
  db.prepare(
    `UPDATE sermon SET
      title = ?, speaker = ?, date_preached = ?, description = ?,
      cover_image_url = ?, media_type = ?, media_url = ?, downloadable_file_url = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.title,
    input.speaker,
    input.datePreached,
    input.description,
    input.coverImageUrl,
    input.mediaType,
    input.mediaUrl,
    input.downloadableFileUrl,
    id
  );
  setSermonCategories(id, input.categoryIds);
  return getSermonById(id);
}

export function deleteSermon(id: string): void {
  db.prepare("DELETE FROM sermon WHERE id = ?").run(id);
}
