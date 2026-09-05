import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteGalleryItem } from "@/lib/repositories/gallery";
import { getAdminSessionFromRequest } from "@/lib/session";
import { deleteUploadedFile } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = deleteGalleryItem(id);
  if (!item) {
    return NextResponse.json({ error: "Gallery item not found." }, { status: 404 });
  }

  await deleteUploadedFile(item.fileUrl);
  return NextResponse.json({ ok: true });
}
