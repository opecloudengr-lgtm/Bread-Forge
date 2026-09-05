import nodemailer from "nodemailer";

interface SendResetEmailOptions {
  to: string;
  resetUrl: string;
}

function buildTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendResetEmail({ to, resetUrl }: SendResetEmailOptions): Promise<void> {
  const transport = buildTransport();

  if (!transport) {
    console.log(
      `[bread-forge] SMTP is not configured. Password reset link for ${to}:\n${resetUrl}`
    );
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || `"The Bread Forge" <no-reply@thebreadforge.org>`,
    to,
    subject: "Reset your Bread Forge admin password",
    text: `Someone requested a password reset for your Bread Forge admin account.\n\nReset your password using the link below (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<p>Someone requested a password reset for your Bread Forge admin account.</p>
      <p><a href="${resetUrl}">Reset your password</a> (link valid for 1 hour).</p>
      <p>If you did not request this, you can safely ignore this email.</p>`,
  });
}
