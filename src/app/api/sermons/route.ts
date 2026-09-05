import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSermon, listSermons } from "@/lib/repositories/sermon";
import { getAdminSessionFromRequest } from "@/lib/session";
import { sermonFieldsSchema } from "@/lib/validation";
import {
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  MAX_MEDIA_BYTES,
  UploadValidationError,
  mediaTypeFromMime,
  saveUploadedFile,
} from "@/lib/uploads";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const search = searchParams.get("q") ?? undefined;
  const sermons = listSermons({ categoryId, search });
  return NextResponse.json({ sermons });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const mediaFile = formData.get("mediaFile");
  if (!(mediaFile instanceof File) || mediaFile.size === 0) {
    return NextResponse.json(
      { error: "An audio or video file is required." },
      { status: 400 }
    );
  }

  try {
    const savedMedia = await saveUploadedFile(mediaFile, "sermons", {
      maxBytes: MAX_MEDIA_BYTES,
      allowedMimePrefixes: ["audio/", "video/"],
    });

    let coverImageUrl: string | null = null;
    const coverImage = formData.get("coverImage");
    if (coverImage instanceof File && coverImage.size > 0) {
      const saved = await saveUploadedFile(coverImage, "covers", {
        maxBytes: MAX_IMAGE_BYTES,
        allowedMimePrefixes: ["image/"],
      });
      coverImageUrl = saved.url;
    }

    let downloadableFileUrl: string = savedMedia.url;
    const notesFile = formData.get("notesFile");
    if (notesFile instanceof File && notesFile.size > 0) {
      const saved = await saveUploadedFile(notesFile, "sermons", {
        maxBytes: MAX_DOCUMENT_BYTES,
        allowedMimePrefixes: ["application/pdf"],
      });
      downloadableFileUrl = saved.url;
    }

    const sermon = createSermon({
      title: parsed.data.title,
      speaker: parsed.data.speaker,
      datePreached: parsed.data.datePreached,
      description: parsed.data.description,
      coverImageUrl,
      mediaType: mediaTypeFromMime(mediaFile.type),
      mediaUrl: savedMedia.url,
      downloadableFileUrl,
      categoryIds: parsed.data.categoryIds,
    });

    return NextResponse.json({ sermon }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
