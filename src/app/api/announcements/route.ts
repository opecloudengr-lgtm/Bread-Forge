import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAnnouncement, listAnnouncements } from "@/lib/repositories/announcement";
import { getAdminSessionFromRequest } from "@/lib/session";
import { announcementFieldsSchema } from "@/lib/validation";
import {
  MAX_IMAGE_BYTES,
  MAX_MEDIA_BYTES,
  UploadValidationError,
  saveUploadedFile,
} from "@/lib/uploads";

export async function GET() {
  return NextResponse.json({ announcements: listAnnouncements() });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    let imageUrl: string | null = null;
    const image = formData.get("image");
    if (image instanceof File && image.size > 0) {
      const saved = await saveUploadedFile(image, "announcements", {
        maxBytes: MAX_IMAGE_BYTES,
        allowedMimePrefixes: ["image/"],
      });
      imageUrl = saved.url;
    }

    let videoUrl: string | null = null;
    const video = formData.get("video");
    if (video instanceof File && video.size > 0) {
      const saved = await saveUploadedFile(video, "announcements", {
        maxBytes: MAX_MEDIA_BYTES,
        allowedMimePrefixes: ["video/"],
      });
      videoUrl = saved.url;
    }

    const announcement = createAnnouncement({
      title: parsed.data.title,
      message: parsed.data.message,
      imageUrl,
      videoUrl,
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
