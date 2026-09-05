"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Announcement } from "@/types";

export function AnnouncementForm({ announcement }: { announcement?: Announcement }) {
  const router = useRouter();
  const isEdit = Boolean(announcement);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const url = isEdit ? `/api/announcements/${announcement!.id}` : "/api/announcements";
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/announcements");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-ink/70">Title</label>
        <input
          name="title"
          required
          defaultValue={announcement?.title}
          className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/70">Message</label>
        <textarea
          name="message"
          rows={5}
          defaultValue={announcement?.message}
          className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink/70">
            Image {isEdit ? "(leave blank to keep current)" : "(optional)"}
          </label>
          <input type="file" name="image" accept="image/*" className="mt-1 w-full text-sm" />
          {isEdit && announcement?.imageUrl && (
            <p className="mt-1 truncate text-xs text-ink/50">Current: {announcement.imageUrl}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70">
            Video {isEdit ? "(leave blank to keep current)" : "(optional)"}
          </label>
          <input type="file" name="video" accept="video/*" className="mt-1 w-full text-sm" />
          {isEdit && announcement?.videoUrl && (
            <p className="mt-1 truncate text-xs text-ink/50">Current: {announcement.videoUrl}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-gold px-6 py-3 font-semibold text-ink hover:bg-gold-light disabled:opacity-60"
      >
        {loading ? "Saving…" : isEdit ? "Save Changes" : "Publish Announcement"}
      </button>
    </form>
  );
}
