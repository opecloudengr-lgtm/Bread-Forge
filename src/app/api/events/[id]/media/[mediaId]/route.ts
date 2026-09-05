import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteEventMedia } from "@/lib/repositories/event";
import { getAdminSessionFromRequest } from "@/lib/session";
import { deleteUploadedFile } from "@/lib/uploads";

type Params = { params: Promise<{ id: string; mediaId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaId } = await params;
  const media = deleteEventMedia(mediaId);
  if (!media) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  await deleteUploadedFile(media.fileUrl);
  return NextResponse.json({ ok: true });
}
