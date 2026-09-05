"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message ?? "If that email is registered, a reset link has been sent.");
    } finally {
      setLoading(false);
    }
  }

  if (message) {
    return <p className="rounded-lg bg-gold/10 px-4 py-3 text-sm text-ink/80">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink/70">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gold px-4 py-2.5 font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send Reset Link"}
      </button>
      <a href="/admin/login" className="block text-center text-sm text-ink/60 hover:text-gold-deep">
        Back to sign in
      </a>
    </form>
  );
}
