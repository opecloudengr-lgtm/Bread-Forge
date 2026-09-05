import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteEvent, getEventById, updateEvent, addEventMedia } from "@/lib/repositories/event";
import { getAdminSessionFromRequest } from "@/lib/session";
import { eventFieldsSchema } from "@/lib/validation";
import {
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  MAX_MEDIA_BYTES,
  UploadValidationError,
  deleteUploadedFile,
  eventMediaTypeFromMime,
  saveUploadedFile,
} from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  return NextResponse.json({ event });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!getEventById(id)) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const parsed = eventFieldsSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    eventDate: formData.get("eventDate"),
    location: formData.get("location") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid event details." },
      { status: 400 }
    );
  }

  const mediaFiles = formData.getAll("media").filter((f): f is File => f instanceof File && f.size > 0);

  try {
    const savedMedia = [];
    for (const file of mediaFiles) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isPdf = file.type === "application/pdf";
      if (!isImage && !isVideo && !isPdf) {
        return NextResponse.json(
          { error: `Unsupported file type for ${file.name}: ${file.type || "unknown"}.` },
          { status: 400 }
        );
      }
      const saved = await saveUploadedFile(file, "events", {
        maxBytes: isPdf ? MAX_DOCUMENT_BYTES : isImage ? MAX_IMAGE_BYTES : MAX_MEDIA_BYTES,
        allowedMimePrefixes: isImage ? ["image/"] : isVideo ? ["video/"] : ["application/pdf"],
      });
      savedMedia.push({
        type: eventMediaTypeFromMime(file.type),
        fileUrl: saved.url,
        originalName: file.name,
      });
    }

    updateEvent(id, {
      title: parsed.data.title,
      description: parsed.data.description,
      eventDate: parsed.data.eventDate,
      location: parsed.data.location,
    });
    if (savedMedia.length) {
      addEventMedia(id, savedMedia);
    }

    return NextResponse.json({ event: getEventById(id) });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const event = deleteEvent(id);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  await Promise.all(event.media.map((m) => deleteUploadedFile(m.fileUrl)));

  return NextResponse.json({ ok: true });
}
