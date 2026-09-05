#!/usr/bin/env node
// Populates the local database with sample sermons and events so the site
// has something to look at in dev/demo. Safe to run multiple times — it
// only adds a fixed set of demo rows, and refuses to run against a database
// that already has sermons or events (see --force to override).
//
// Usage: npm run seed:demo [-- --force]

import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { SCHEMA } from "./schema.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const DB_PATH = process.env.DATABASE_PATH || path.join(projectRoot, "data", "bread-forge.db");
const UPLOADS_ROOT = path.join(projectRoot, "storage", "uploads");
const force = process.argv.includes("--force");

mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA busy_timeout = 5000;");

// Same schema src/lib/db.ts creates — kept in scripts/schema.mjs since this
// plain script can't import db.ts (it uses the `@/` path alias, which only
// Next's bundler resolves). Running it here means this script also works
// standalone, before the Next.js server has ever created the tables.
db.exec(SCHEMA);

const defaultCategories = ["Relationship", "Faith", "Prayer", "Intimacy", "Warfare", "Bible Study"];
const insertCategory = db.prepare("INSERT OR IGNORE INTO category (id, name) VALUES (?, ?)");
for (const name of defaultCategories) insertCategory.run(crypto.randomUUID(), name);

const existingSermons = db.prepare("SELECT COUNT(*) AS count FROM sermon").get().count;
const existingEvents = db.prepare("SELECT COUNT(*) AS count FROM event").get().count;
const existingAnnouncements = db.prepare("SELECT COUNT(*) AS count FROM announcement").get().count;
const existingGalleryItems = db.prepare("SELECT COUNT(*) AS count FROM gallery_item").get().count;
if ((existingSermons > 0 || existingEvents > 0 || existingAnnouncements > 0 || existingGalleryItems > 0) && !force) {
  console.log(
    `Database already has ${existingSermons} sermon(s), ${existingEvents} event(s), ${existingAnnouncements} announcement(s), and ${existingGalleryItems} gallery item(s) — skipping. Pass --force to add demo rows anyway.`
  );
  process.exit(0);
}

function categoryId(name) {
  return db.prepare("SELECT id FROM category WHERE name = ?").get(name).id;
}

// ---------- tiny, dependency-free placeholder media generators ----------

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

/** A minimal solid-color PNG — good enough as a placeholder cover/event image. */
function makeSolidPng(width, height, [r, g, b]) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(2, 9); // color type: truecolor RGB
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const row = Buffer.alloc(1 + width * 3);
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  const idatData = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdrData),
    pngChunk("IDAT", idatData),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/** A short silent WAV — plays fine in an <audio> element, just has no sound. */
function makeSilentWav(seconds) {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = sampleRate * numChannels * (bitsPerSample / 8) * seconds;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buf.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  // remaining bytes are already zero (silence)
  return buf;
}

/** A minimal one-page PDF with a line of text — valid, opens in any viewer. */
function makeSimplePdf(title) {
  const text = title.replace(/[()\\]/g, "");
  const content = `BT /F1 24 Tf 72 700 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

function saveFile(subdir, filename, buffer) {
  const dir = path.join(UPLOADS_ROOT, subdir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, filename), buffer);
  return `/media/${subdir}/${filename}`;
}

// ---------- demo content ----------

const goldCover = makeSolidPng(640, 400, [201, 162, 39]);
const inkCover = makeSolidPng(640, 400, [28, 20, 16]);
const emberCover = makeSolidPng(640, 400, [122, 46, 29]);
const eventPhoto1 = makeSolidPng(800, 600, [156, 122, 26]);
const eventPhoto2 = makeSolidPng(800, 600, [43, 33, 25]);
const silentAudio = makeSilentWav(3);

const sermons = [
  {
    title: "Contending in the Secret Place",
    speaker: "Pastor John Adeyemi",
    datePreached: "2026-08-16",
    description:
      "An exhortation on the primacy of private prayer and warfare intercession before the mandate is ever seen in public.",
    categories: ["Prayer", "Warfare"],
    cover: goldCover,
  },
  {
    title: "Walking by Faith, Not by Sight",
    speaker: "Evangelist Grace Okon",
    datePreached: "2026-08-23",
    description: "A study through Hebrews 11 on what it means to live by unwavering faith in the promises of God.",
    categories: ["Faith"],
    cover: inkCover,
  },
  {
    title: "The Language of Intimacy",
    speaker: "Pastor John Adeyemi",
    datePreached: "2026-08-30",
    description: "On cultivating a relationship with God that goes beyond duty into deep, abiding intimacy.",
    categories: ["Intimacy", "Relationship"],
    cover: emberCover,
  },
  {
    title: "Foundations of Sound Doctrine",
    speaker: "Deacon Samuel Bello",
    datePreached: "2026-09-06",
    description: "Part one of a series building a firm doctrinal foundation for every believer in the family.",
    categories: ["Bible Study"],
    cover: goldCover,
  },
  {
    title: "Standing Firm in Spiritual Warfare",
    speaker: "Pastor John Adeyemi",
    datePreached: "2026-09-13",
    description: "Practical, Scripture-rooted instruction on the believer's armor and authority in spiritual conflict.",
    categories: ["Warfare", "Prayer"],
    cover: inkCover,
  },
];

const insertSermon = db.prepare(
  `INSERT INTO sermon (id, title, speaker, date_preached, description, cover_image_url, media_type, media_url, downloadable_file_url)
   VALUES (?, ?, ?, ?, ?, ?, 'audio', ?, ?)`
);
const linkSermonCategory = db.prepare(
  "INSERT OR IGNORE INTO sermon_category (sermon_id, category_id) VALUES (?, ?)"
);

for (const sermon of sermons) {
  const id = crypto.randomUUID();
  const coverUrl = saveFile("covers", `${id}-cover.png`, sermon.cover);
  const audioUrl = saveFile("sermons", `${id}-audio.wav`, silentAudio);
  insertSermon.run(id, sermon.title, sermon.speaker, sermon.datePreached, sermon.description, coverUrl, audioUrl, audioUrl);
  for (const categoryName of sermon.categories) {
    linkSermonCategory.run(id, categoryId(categoryName));
  }
}

const events = [
  {
    title: "Kingdom Impartation Conference",
    description: "A three-day gathering of prayer, teaching, and impartation for the wider Body of Christ.",
    eventDate: "2026-10-17T09:00",
    location: "Main Auditorium, ACCN",
    photo: eventPhoto1,
    pdfTitle: "Conference Program",
  },
  {
    title: "Adullam Prayer Watch Night",
    description: "An all-night prayer watch contending for the mandate and interceding for the nation.",
    eventDate: "2026-09-26T22:00",
    location: "Main Auditorium, ACCN",
    photo: eventPhoto2,
  },
  {
    title: "Foundations Discipleship Retreat",
    description: "A weekend retreat grounding new believers in the foundations of the faith.",
    eventDate: "2026-07-11T17:00",
    location: "Adullam Retreat Grounds",
    photo: eventPhoto1,
    pdfTitle: "Retreat Schedule",
  },
  {
    title: "Community Outreach Day",
    description: "Food distribution and prayer ministry to families in the surrounding community.",
    eventDate: "2026-05-02T08:00",
    location: "Adullam Community Grounds",
    photo: eventPhoto2,
  },
];

const insertEvent = db.prepare(
  "INSERT INTO event (id, title, description, event_date, location) VALUES (?, ?, ?, ?, ?)"
);
const insertEventMedia = db.prepare(
  `INSERT INTO event_media (id, event_id, type, file_url, original_name, sort_order)
   VALUES (?, ?, ?, ?, ?, ?)`
);

for (const event of events) {
  const id = crypto.randomUUID();
  insertEvent.run(id, event.title, event.description, event.eventDate, event.location);

  const photoUrl = saveFile("events", `${id}-photo.png`, event.photo);
  insertEventMedia.run(crypto.randomUUID(), id, "image", photoUrl, "event-photo.png", 0);

  if (event.pdfTitle) {
    const pdfUrl = saveFile("events", `${id}-flyer.pdf`, makeSimplePdf(event.pdfTitle));
    insertEventMedia.run(crypto.randomUUID(), id, "pdf", pdfUrl, `${event.pdfTitle}.pdf`, 1);
  }
}

const announcements = [
  {
    title: "New Members Class Starting",
    message: "A four-week class for anyone new to the family, covering our mandate, pillars, and how to get plugged in. Sign up at the welcome desk.",
    image: eventPhoto1,
  },
  {
    title: "Choir Rehearsal Moved to Thursdays",
    message: "Starting this week, choir rehearsal moves from Tuesdays to Thursdays at 6pm. Same venue.",
  },
];

const insertAnnouncement = db.prepare(
  `INSERT INTO announcement (id, title, message, image_url, video_url) VALUES (?, ?, ?, ?, NULL)`
);

for (const announcement of announcements) {
  const id = crypto.randomUUID();
  const imageUrl = announcement.image ? saveFile("announcements", `${id}-image.png`, announcement.image) : null;
  insertAnnouncement.run(id, announcement.title, announcement.message, imageUrl);
}

const galleryPhotos = [
  makeSolidPng(800, 800, [201, 162, 39]),
  makeSolidPng(800, 800, [28, 20, 16]),
  makeSolidPng(800, 800, [122, 46, 29]),
  makeSolidPng(800, 800, [156, 122, 26]),
  makeSolidPng(800, 800, [43, 33, 25]),
  makeSolidPng(800, 800, [93, 66, 20]),
];

const insertGalleryItem = db.prepare(
  `INSERT INTO gallery_item (id, type, file_url, caption, sort_order) VALUES (?, 'image', ?, ?, ?)`
);

galleryPhotos.forEach((photo, index) => {
  const id = crypto.randomUUID();
  const url = saveFile("gallery", `${id}-photo.png`, photo);
  insertGalleryItem.run(id, url, "", index);
});

console.log(`Seeded ${sermons.length} sermons, ${events.length} events, ${announcements.length} announcements, and ${galleryPhotos.length} gallery photos.`);
console.log("Note: sermon audio, event/announcement photos, and gallery photos are small placeholder files (silent audio, solid-color images) — swap them for real media from the admin dashboard whenever you're ready.");
