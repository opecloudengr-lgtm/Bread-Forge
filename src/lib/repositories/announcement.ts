import { db } from "@/lib/db";
import type { Announcement } from "@/types";

interface AnnouncementRow {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    imageUrl: row.image_url,
    videoUrl: row.video_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listAnnouncements(): Announcement[] {
  const rows = db
    .prepare("SELECT * FROM announcement ORDER BY created_at DESC")
    .all() as unknown as AnnouncementRow[];
  return rows.map(mapRow);
}

export function getAnnouncementById(id: string): Announcement | null {
  const row = db.prepare("SELECT * FROM announcement WHERE id = ?").get(id) as
    | AnnouncementRow
    | undefined;
  return row ? mapRow(row) : null;
}

export interface AnnouncementInput {
  title: string;
  message: string;
  imageUrl: string | null;
  videoUrl: string | null;
}

export function createAnnouncement(input: AnnouncementInput): Announcement {
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO announcement (id, title, message, image_url, video_url)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.title, input.message, input.imageUrl, input.videoUrl);
  return getAnnouncementById(id)!;
}

export function updateAnnouncement(id: string, input: AnnouncementInput): Announcement | null {
  db.prepare(
    `UPDATE announcement SET title = ?, message = ?, image_url = ?, video_url = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(input.title, input.message, input.imageUrl, input.videoUrl, id);
  return getAnnouncementById(id);
}

export function deleteAnnouncement(id: string): Announcement | null {
  const announcement = getAnnouncementById(id);
  db.prepare("DELETE FROM announcement WHERE id = ?").run(id);
  return announcement;
}
