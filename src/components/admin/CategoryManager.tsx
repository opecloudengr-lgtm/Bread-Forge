"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types";

export function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add category.");
        return;
      }
      setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(id: string) {
    if (!editingName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not rename category.");
        return;
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? data.category : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this category?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not delete category.");
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name…"
          className="w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy}
          className="shrink-0 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light disabled:opacity-60"
        >
          Add
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between rounded-lg border border-ink/10 bg-white px-4 py-3"
          >
            {editingId === category.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-ink/15 px-3 py-1.5 text-sm focus:border-gold focus:outline-none"
                />
                <button
                  onClick={() => handleRename(category.id)}
                  className="text-sm font-medium text-gold-deep hover:text-gold"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm font-medium text-ink/50 hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium text-ink">{category.name}</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setEditingId(category.id);
                      setEditingName(category.name);
                    }}
                    className="text-sm font-medium text-gold-deep hover:text-gold"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={busy}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
