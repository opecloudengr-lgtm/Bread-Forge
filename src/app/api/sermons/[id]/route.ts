import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteSermon, getSermonById, updateSermon } from "@/lib/repositories/sermon";
import { getAdminSessionFromRequest } from "@/lib/session";
import { sermonFieldsSchema } from "@/lib/validation";
import {
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  MAX_MEDIA_BYTES,
  UploadValidationError,
  deleteUploadedFile,
  mediaTypeFromMime,
  saveUploadedFile,
} from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const sermon = getSermonById(id);
  if (!sermon) {
    return NextResponse.json({ error: "Sermon not found." }, { status: 404 });
  }
  return NextResponse.json({ sermon });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = getSermonById(id);
  if (!existing) {
    return NextResponse.json({ error: "Sermon not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const parsed = sermonFieldsSchema.safeParse({
    title: formData.get("title"),
    speaker: formData.get("speaker"),
    datePreached: formData.get("datePreached"),
    description: formData.get("description") ?? "",
    categoryIds: formData.getAll("categoryIds").map(String),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid sermon details." },
      { status: 400 }
    );
  }

  try {
    let mediaUrl = existing.mediaUrl;
    let mediaType = existing.mediaType;
    let downloadableFileUrl = existing.downloadableFileUrl;

    const mediaFile = formData.get("mediaFile");
    if (mediaFile instanceof File && mediaFile.size > 0) {
      const saved = await saveUploadedFile(mediaFile, "sermons", {
        maxBytes: MAX_MEDIA_BYTES,
        allowedMimePrefixes: ["audio/", "video/"],
      });
      if (downloadableFileUrl === existing.mediaUrl) {
        downloadableFileUrl = saved.url;
      }
      await deleteUploadedFile(existing.mediaUrl);
      mediaUrl = saved.url;
      mediaType = mediaTypeFromMime(mediaFile.type);
    }

    let coverImageUrl = existing.coverImageUrl;
    const coverImage = formData.get("coverImage");
    if (coverImage instanceof File && coverImage.size > 0) {
      const saved = await saveUploadedFile(coverImage, "covers", {
        maxBytes: MAX_IMAGE_BYTES,
        allowedMimePrefixes: ["image/"],
      });
      await deleteUploadedFile(existing.coverImageUrl);
      coverImageUrl = saved.url;
    }

    const notesFile = formData.get("notesFile");
    if (notesFile instanceof File && notesFile.size > 0) {
      const saved = await saveUploadedFile(notesFile, "sermons", {
        maxBytes: MAX_DOCUMENT_BYTES,
        allowedMimePrefixes: ["application/pdf"],
      });
      if (existing.downloadableFileUrl && existing.downloadableFileUrl !== existing.mediaUrl) {
        await deleteUploadedFile(existing.downloadableFileUrl);
      }
      downloadableFileUrl = saved.url;
    }

    const sermon = updateSermon(id, {
      title: parsed.data.title,
      speaker: parsed.data.speaker,
      datePreached: parsed.data.datePreached,
      description: parsed.data.description,
      coverImageUrl,
      mediaType,
      mediaUrl,
      downloadableFileUrl,
      categoryIds: parsed.data.categoryIds,
    });

    return NextResponse.json({ sermon });
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
  const existing = getSermonById(id);
  if (!existing) {
    return NextResponse.json({ error: "Sermon not found." }, { status: 404 });
  }

  deleteSermon(id);
  await deleteUploadedFile(existing.mediaUrl);
  await deleteUploadedFile(existing.coverImageUrl);
  if (existing.downloadableFileUrl && existing.downloadableFileUrl !== existing.mediaUrl) {
    await deleteUploadedFile(existing.downloadableFileUrl);
  }

  return NextResponse.json({ ok: true });
}
