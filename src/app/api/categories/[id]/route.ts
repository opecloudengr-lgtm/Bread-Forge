import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  deleteCategory,
  getCategoryById,
  renameCategory,
  sermonCountForCategory,
} from "@/lib/repositories/category";
import { getAdminSessionFromRequest } from "@/lib/session";
import { categorySchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!getCategoryById(id)) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid category name is required." }, { status: 400 });
  }

  const category = renameCategory(id, parsed.data.name);
  return NextResponse.json({ category });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!getCategoryById(id)) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  const sermonCount = sermonCountForCategory(id);
  if (sermonCount > 0) {
    return NextResponse.json(
      {
        error: `This category is used by ${sermonCount} sermon(s). Remove it from those sermons first.`,
      },
      { status: 409 }
    );
  }

  deleteCategory(id);
  return NextResponse.json({ ok: true });
}
