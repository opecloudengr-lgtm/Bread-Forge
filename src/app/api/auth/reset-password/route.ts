import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getAdminByValidResetToken, clearResetToken, updatePassword } from "@/lib/repositories/admin";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const admin = getAdminByValidResetToken(tokenHash);
  if (!admin) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  updatePassword(admin.id, passwordHash);
  clearResetToken(admin.id);

  return NextResponse.json({ ok: true });
}
