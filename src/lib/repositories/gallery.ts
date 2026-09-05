import { db } from "@/lib/db";
import type { GalleryItem, GalleryItemType } from "@/types";

interface GalleryItemRow {
  id: string;
  type: string;
  file_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

function mapRow(row: GalleryItemRow): GalleryItem {
  return {
    id: row.id,
    type: row.type as GalleryItemType,
    fileUrl: row.file_url,
    caption: row.caption,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function listGalleryItems(): GalleryItem[] {
  const rows = db
    .prepare("SELECT * FROM gallery_item ORDER BY created_at DESC")
    .all() as unknown as GalleryItemRow[];
  return rows.map(mapRow);
}

export function getGalleryItemById(id: string): GalleryItem | null {
  const row = db.prepare("SELECT * FROM gallery_item WHERE id = ?").get(id) as
    | GalleryItemRow
    | undefined;
  return row ? mapRow(row) : null;
}

export interface GalleryItemInput {
  type: GalleryItemType;
  fileUrl: string;
  caption: string;
}

export function addGalleryItems(items: GalleryItemInput[]): void {
  if (!items.length) return;
  const maxOrder = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM gallery_item")
    .get() as { maxOrder: number };
  const insert = db.prepare(
    `INSERT INTO gallery_item (id, type, file_url, caption, sort_order) VALUES (?, ?, ?, ?, ?)`
  );
  items.forEach((item, index) => {
    insert.run(crypto.randomUUID(), item.type, item.fileUrl, item.caption, maxOrder.maxOrder + 1 + index);
  });
}

export function deleteGalleryItem(id: string): GalleryItem | null {
  const item = getGalleryItemById(id);
  db.prepare("DELETE FROM gallery_item WHERE id = ?").run(id);
  return item;
}
