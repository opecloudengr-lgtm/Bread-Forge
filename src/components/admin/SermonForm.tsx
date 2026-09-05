"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Sermon } from "@/types";

interface SermonFormProps {
  categories: Category[];
  sermon?: Sermon;
}

export function SermonForm({ categories: initialCategories, sermon }: SermonFormProps) {
  const router = useRouter();
  const isEdit = Boolean(sermon);

  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    sermon?.categories.map((c) => c.id) ?? []
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedCategoryIds((prev) => [...prev, data.category.id]);
        setNewCategoryName("");
      } else {
        setError(data.error ?? "Could not add category.");
      }
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.delete("categoryIds");
    selectedCategoryIds.forEach((id) => formData.append("categoryIds", id));

    try {
      const url = isEdit ? `/api/sermons/${sermon!.id}` : "/api/sermons";
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/sermons");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink/70">Title</label>
          <input
            name="title"
            required
            defaultValue={sermon?.title}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70">Speaker</label>
          <input
            name="speaker"
            required
            defaultValue={sermon?.speaker}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70">Date Preached</label>
          <input
            type="date"
            name="datePreached"
            required
            defaultValue={sermon?.datePreached?.slice(0, 10)}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/70">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={sermon?.description}
          className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/70">Categories</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategoryIds.includes(category.id)
                  ? "bg-gold text-ink"
                  : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Add new category…"
            className="w-full max-w-xs rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={addingCategory}
            className="rounded-lg border border-gold/50 px-3 py-2 text-sm font-semibold text-gold-deep hover:bg-gold/10"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink/70">
            Audio / Video File {isEdit ? "(leave blank to keep current)" : ""}
          </label>
          <input
            type="file"
            name="mediaFile"
            accept="audio/*,video/*"
            required={!isEdit}
            className="mt-1 w-full text-sm"
          />
          {isEdit && sermon?.mediaUrl && (
            <p className="mt-1 truncate text-xs text-ink/50">Current: {sermon.mediaUrl}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70">Cover Image (optional)</label>
          <input type="file" name="coverImage" accept="image/*" className="mt-1 w-full text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70">
            PDF Notes (optional — becomes the download instead of the media file)
          </label>
          <input type="file" name="notesFile" accept="application/pdf" className="mt-1 w-full text-sm" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-gold px-6 py-3 font-semibold text-ink hover:bg-gold-light disabled:opacity-60"
      >
        {loading ? "Saving…" : isEdit ? "Save Changes" : "Publish Sermon"}
      </button>
    </form>
  );
}
