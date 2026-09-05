import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addGalleryItems, listGalleryItems } from "@/lib/repositories/gallery";
import { getAdminSessionFromRequest } from "@/lib/session";
import { galleryCaptionSchema } from "@/lib/validation";
import { MAX_IMAGE_BYTES, MAX_MEDIA_BYTES, UploadValidationError, saveUploadedFile } from "@/lib/uploads";

export async function GET() {
  return NextResponse.json({ items: listGalleryItems() });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = galleryCaptionSchema.safeParse({ caption: formData.get("caption") ?? "" });
  const caption = parsed.success ? parsed.data.caption : "";

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) {
    return NextResponse.json({ error: "Select at least one image or video." }, { status: 400 });
  }

  try {
    const items = [];
    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        return NextResponse.json(
          { error: `Unsupported file type for ${file.name}: ${file.type || "unknown"}.` },
          { status: 400 }
        );
      }
      const saved = await saveUploadedFile(file, "gallery", {
        maxBytes: isImage ? MAX_IMAGE_BYTES : MAX_MEDIA_BYTES,
        allowedMimePrefixes: isImage ? ["image/"] : ["video/"],
      });
      items.push({ type: (isImage ? "image" : "video") as "image" | "video", fileUrl: saved.url, caption });
    }

    addGalleryItems(items);
    return NextResponse.json({ items: listGalleryItems() }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
