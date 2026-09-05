import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getAdminByEmail, setResetToken } from "@/lib/repositories/admin";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendResetEmail } from "@/lib/mailer";
import { checkRateLimit, clientIpFromRequest } from "@/lib/rate-limit";

const GENERIC_RESPONSE = {
  ok: true,
  message: "If that email is registered, a reset link has been sent.",
};

export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request);
  const rateLimit = checkRateLimit(`forgot:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const admin = getAdminByEmail(parsed.data.email);
  if (admin) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    setResetToken(admin.id, tokenHash, expiresAt);

    const origin = request.nextUrl.origin;
    const resetUrl = `${origin}/admin/reset-password?token=${rawToken}`;
    await sendResetEmail({ to: admin.email, resetUrl });
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
