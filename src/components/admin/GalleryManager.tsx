"use client";

import { useState } from "react";
import type { GalleryItem } from "@/types";

export function GalleryManager({ items: initial }: { items: GalleryItem[] }) {
  const [items, setItems] = useState(initial);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("Select at least one image or video.");
      return;
    }
    setError(null);
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("caption", caption);

    try {
      const res = await fetch("/api/gallery", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setItems(data.items);
      setCaption("");
      setFiles(null);
      (e.target as HTMLFormElement).reset();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this from the gallery?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleUpload} className="max-w-xl space-y-4 rounded-2xl border border-ink/10 bg-white p-6">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-ink/70">Photos / Videos</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="mt-1 w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70">Caption (optional, applied to all selected)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Add to Gallery"}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-ink/5">
            {item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.fileUrl} alt={item.caption || ""} className="h-full w-full object-cover" />
            ) : (
              <video src={item.fileUrl} muted className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="absolute right-2 top-2 rounded-full bg-red-600/90 px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100 disabled:opacity-50"
            >
              {deletingId === item.id ? "…" : "Remove"}
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="col-span-full py-10 text-center text-ink/50">No photos or videos yet.</p>
        )}
      </div>
    </div>
  );
}
