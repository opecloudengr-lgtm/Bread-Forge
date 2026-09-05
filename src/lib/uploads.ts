import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Deliberately outside of `public/` — Next.js's production static file
// server only serves what existed in `public/` at build time, but admins
// upload sermons and event media at runtime. Uploaded files are instead
// streamed back through the `/media/[...path]` route handler (see
// src/app/media/[...path]/route.ts), which reads straight from disk on
// every request.
export const UPLOADS_ROOT = path.join(process.cwd(), "storage", "uploads");
export const MEDIA_URL_PREFIX = "/media";

export const MAX_MEDIA_BYTES = 300 * 1024 * 1024; // 300MB — sermon/event audio & video
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024; // 25MB — PDFs
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB — cover images / photos

export type UploadSubdir = "sermons" | "covers" | "events";

export class UploadValidationError extends Error {}

function sanitizeFilename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return base.slice(-100) || "file";
}

export interface SavedFile {
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export async function saveUploadedFile(
  file: File,
  subdir: UploadSubdir,
  { maxBytes, allowedMimePrefixes }: { maxBytes: number; allowedMimePrefixes: string[] }
): Promise<SavedFile> {
  if (file.size === 0) {
    throw new UploadValidationError("Uploaded file is empty.");
  }
  if (file.size > maxBytes) {
    throw new UploadValidationError(
      `File is too large (${Math.round(file.size / 1024 / 1024)}MB). Max allowed is ${Math.round(
        maxBytes / 1024 / 1024
      )}MB.`
    );
  }
  const mimeOk = allowedMimePrefixes.some((prefix) => file.type.startsWith(prefix));
  if (!mimeOk) {
    throw new UploadValidationError(`Unsupported file type: ${file.type || "unknown"}.`);
  }

  const dir = path.join(UPLOADS_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return {
    url: `${MEDIA_URL_PREFIX}/${subdir}/${filename}`,
    originalName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

export async function deleteUploadedFile(mediaUrl: string | null | undefined): Promise<void> {
  if (!mediaUrl || !mediaUrl.startsWith(`${MEDIA_URL_PREFIX}/`)) return;
  const relativePath = mediaUrl.slice(MEDIA_URL_PREFIX.length + 1);
  const filePath = path.join(UPLOADS_ROOT, relativePath);
  try {
    await unlink(filePath);
  } catch {
    // Already gone or never existed — nothing to clean up.
  }
}

export function mediaTypeFromMime(mimeType: string): "audio" | "video" {
  return mimeType.startsWith("video/") ? "video" : "audio";
}

export function eventMediaTypeFromMime(mimeType: string): "image" | "video" | "pdf" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "pdf";
}
