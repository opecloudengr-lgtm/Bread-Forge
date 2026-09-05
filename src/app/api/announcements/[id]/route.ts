import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  deleteAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from "@/lib/repositories/announcement";
import { getAdminSessionFromRequest } from "@/lib/session";
import { announcementFieldsSchema } from "@/lib/validation";
import {
  MAX_IMAGE_BYTES,
  MAX_MEDIA_BYTES,
  UploadValidationError,
  deleteUploadedFile,
  saveUploadedFile,
} from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const announcement = getAnnouncementById(id);
  if (!announcement) {
    return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
  }
  return NextResponse.json({ announcement });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = getAnnouncementById(id);
  if (!existing) {
    return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const parsed = announcementFieldsSchema.safeParse({
    title: formData.get("title"),
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid announcement details." },
      { status: 400 }
    );
  }

  try {
    let imageUrl = existing.imageUrl;
    const image = formData.get("image");
    if (image instanceof File && image.size > 0) {
      const saved = await saveUploadedFile(image, "announcements", {
        maxBytes: MAX_IMAGE_BYTES,
        allowedMimePrefixes: ["image/"],
      });
      await deleteUploadedFile(existing.imageUrl);
      imageUrl = saved.url;
    }

    let videoUrl = existing.videoUrl;
    const video = formData.get("video");
    if (video instanceof File && video.size > 0) {
      const saved = await saveUploadedFile(video, "announcements", {
        maxBytes: MAX_MEDIA_BYTES,
        allowedMimePrefixes: ["video/"],
      });
      await deleteUploadedFile(existing.videoUrl);
      videoUrl = saved.url;
    }

    const announcement = updateAnnouncement(id, {
      title: parsed.data.title,
      message: parsed.data.message,
      imageUrl,
      videoUrl,
    });

    return NextResponse.json({ announcement });
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
  const announcement = deleteAnnouncement(id);
  if (!announcement) {
    return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
  }

  await deleteUploadedFile(announcement.imageUrl);
  await deleteUploadedFile(announcement.videoUrl);

  return NextResponse.json({ ok: true });
}
