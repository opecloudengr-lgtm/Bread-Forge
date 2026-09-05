import { db } from "@/lib/db";
import type { Event, EventMedia, EventMediaType } from "@/types";

interface EventRow {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface EventMediaRow {
  id: string;
  event_id: string;
  type: string;
  file_url: string;
  original_name: string;
  sort_order: number;
}

function mapMediaRow(row: EventMediaRow): EventMedia {
  return {
    id: row.id,
    eventId: row.event_id,
    type: row.type as EventMediaType,
    fileUrl: row.file_url,
    originalName: row.original_name,
    sortOrder: row.sort_order,
  };
}

function mediaForEvent(eventId: string): EventMedia[] {
  const rows = db
    .prepare("SELECT * FROM event_media WHERE event_id = ? ORDER BY sort_order ASC")
    .all(eventId) as unknown as EventMediaRow[];
  return rows.map(mapMediaRow);
}

function mapRow(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: mediaForEvent(row.id),
  };
}

export type EventFilter = "upcoming" | "past" | "all";

export function listEvents(filter: EventFilter = "all"): Event[] {
  let query = "SELECT * FROM event";

  if (filter === "upcoming") {
    query += " WHERE event_date >= datetime('now')";
    query += " ORDER BY event_date ASC";
  } else if (filter === "past") {
    query += " WHERE event_date < datetime('now')";
    query += " ORDER BY event_date DESC";
  } else {
    query += " ORDER BY event_date DESC";
  }

  const rows = db.prepare(query).all() as unknown as EventRow[];
  return rows.map(mapRow);
}

export function getEventById(id: string): Event | null {
  const row = db.prepare("SELECT * FROM event WHERE id = ?").get(id) as
    | EventRow
    | undefined;
  return row ? mapRow(row) : null;
}

export interface EventMediaInput {
  type: EventMediaType;
  fileUrl: string;
  originalName: string;
}

export interface EventInput {
  title: string;
  description: string;
  eventDate: string;
  location: string;
}

export function createEvent(input: EventInput, media: EventMediaInput[]): Event {
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO event (id, title, description, event_date, location)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.title, input.description, input.eventDate, input.location);
  addEventMedia(id, media);
  return getEventById(id)!;
}

export function updateEvent(id: string, input: EventInput): Event | null {
  db.prepare(
    `UPDATE event SET title = ?, description = ?, event_date = ?, location = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(input.title, input.description, input.eventDate, input.location, id);
  return getEventById(id);
}

export function addEventMedia(eventId: string, media: EventMediaInput[]): void {
  if (!media.length) return;
  const existingCount = db
    .prepare("SELECT COUNT(*) as count FROM event_media WHERE event_id = ?")
    .get(eventId) as { count: number };
  const insert = db.prepare(
    `INSERT INTO event_media (id, event_id, type, file_url, original_name, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  media.forEach((m, index) => {
    insert.run(
      crypto.randomUUID(),
      eventId,
      m.type,
      m.fileUrl,
      m.originalName,
      existingCount.count + index
    );
  });
}

export function deleteEventMedia(mediaId: string): EventMedia | null {
  const row = db.prepare("SELECT * FROM event_media WHERE id = ?").get(mediaId) as
    | EventMediaRow
    | undefined;
  if (!row) return null;
  db.prepare("DELETE FROM event_media WHERE id = ?").run(mediaId);
  return mapMediaRow(row);
}

export function deleteEvent(id: string): Event | null {
  const event = getEventById(id);
  db.prepare("DELETE FROM event WHERE id = ?").run(id);
  return event;
}
