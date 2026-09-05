import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminByEmail, touchLastLogin } from "@/lib/repositories/admin";
import { createSessionToken, verifyPassword, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { checkRateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request);
  const rateLimit = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 5 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const admin = getAdminByEmail(parsed.data.email);
  if (!admin) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  touchLastLogin(admin.id);
  const token = await createSessionToken({ adminId: admin.id, email: admin.email });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
