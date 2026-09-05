"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/sermons", label: "Sermons" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/categories", label: "Categories" },
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-parchment-dim">
      <aside className="hidden w-64 flex-col bg-ink text-parchment sm:flex">
        <div className="px-6 py-6">
          <Link href="/" className="font-display text-lg font-bold text-gold-light">
            The Bread Forge
          </Link>
          <p className="mt-0.5 text-xs text-parchment/50">Admin Dashboard</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-gold/15 text-gold-light" : "text-parchment/70 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-6 py-4">
          <p className="truncate text-xs text-parchment/50">{email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 text-sm font-medium text-gold-light hover:text-gold"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-ink/10 bg-white px-6 py-4 sm:hidden">
          <span className="font-display font-bold text-ink">Admin</span>
          <button onClick={handleLogout} className="text-sm font-medium text-gold-deep">
            Sign out
          </button>
        </header>
        <main className="p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
