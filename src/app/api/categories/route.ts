import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listCategories, createCategory } from "@/lib/repositories/category";
import { getAdminSessionFromRequest } from "@/lib/session";
import { categorySchema } from "@/lib/validation";

export async function GET() {
  return NextResponse.json({ categories: listCategories() });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid category name is required." }, { status: 400 });
  }

  const category = createCategory(parsed.data.name);
  return NextResponse.json({ category }, { status: 201 });
}
