"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/types";

export function EventForm({ event }: { event?: Event }) {
  const router = useRouter();
  const isEdit = Boolean(event);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState(event?.media ?? []);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const url = isEdit ? `/api/events/${event!.id}` : "/api/events";
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/events");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    if (!event) return;
    if (!window.confirm("Remove this file from the event?")) return;
    setDeletingId(mediaId);
    try {
      const res = await fetch(`/api/events/${event.id}/media/${mediaId}`, { method: "DELETE" });
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      }
    } finally {
      setDeletingId(null);
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
          defaultValue={event?.title}
          className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink/70">Date & Time</label>
          <input
            type="datetime-local"
            name="eventDate"
            required
            defaultValue={event?.eventDate ? toDatetimeLocal(event.eventDate) : undefined}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70">Location</label>
          <input
            name="location"
            defaultValue={event?.location}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/70">Description</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={event?.description}
          className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold focus:outline-none"
        />
      </div>

      {isEdit && media.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-ink/70">Current Media</label>
          <ul className="mt-2 space-y-2">
            {media.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm"
              >
                <span className="truncate">
                  <span className="mr-2 rounded bg-ink/5 px-2 py-0.5 text-xs uppercase">{m.type}</span>
                  {m.originalName || m.fileUrl}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteMedia(m.id)}
                  disabled={deletingId === m.id}
                  className="ml-3 shrink-0 text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink/70">
          {isEdit ? "Add More Media" : "Media"} (images, video, and/or PDF — you can select multiple)
        </label>
        <input
          type="file"
          name="media"
          accept="image/*,video/*,application/pdf"
          multiple
          className="mt-1 w-full text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-gold px-6 py-3 font-semibold text-ink hover:bg-gold-light disabled:opacity-60"
      >
        {loading ? "Saving…" : isEdit ? "Save Changes" : "Publish Event"}
      </button>
    </form>
  );
}

function toDatetimeLocal(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
