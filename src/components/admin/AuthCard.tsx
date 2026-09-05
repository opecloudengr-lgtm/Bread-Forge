import type { ReactNode } from "react";
import { Logo } from "@/components/site/Logo";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size={64} />
        </div>
        <div className="rounded-2xl bg-parchment p-8 shadow-2xl">
          <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink/60">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
