"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to reset password.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 1500);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <p className="text-sm text-red-600">Missing or invalid reset link.</p>;
  }

  if (success) {
    return (
      <p className="rounded-lg bg-gold/10 px-4 py-3 text-sm text-ink/80">
        Password updated. Redirecting you to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-ink/70">New Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink/70">Confirm Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gold px-4 py-2.5 font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
      >
        {loading ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}
