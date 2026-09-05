"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import type { Sermon } from "@/types";

export function SermonCard({ sermon }: { sermon: Sermon }) {
  const [playing, setPlaying] = useState(false);

  let formattedDate = sermon.datePreached;
  try {
    formattedDate = format(parseISO(sermon.datePreached), "MMMM d, yyyy");
  } catch {
    // keep raw string if parsing fails
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-ink via-ink-soft to-gold-deep">
        {sermon.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sermon.coverImageUrl}
            alt={sermon.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-3xl font-bold text-gold-light/70">
              {sermon.title.slice(0, 1)}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors hover:bg-ink/30"
          aria-label={playing ? "Hide player" : "Play sermon"}
        >
          {!playing && (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              ▶
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {sermon.categories.map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold-deep"
            >
              {c.name}
            </span>
          ))}
        </div>

        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{sermon.title}</h3>
        <p className="text-sm text-ink/60">
          {sermon.speaker} · {formattedDate}
        </p>
        {sermon.description && (
          <p className="line-clamp-2 text-sm text-ink/70">{sermon.description}</p>
        )}

        {playing && (
          <div className="mt-1">
            {sermon.mediaType === "video" ? (
              <video controls autoPlay className="w-full rounded-lg" src={sermon.mediaUrl} />
            ) : (
              <audio controls autoPlay className="w-full" src={sermon.mediaUrl} />
            )}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            className="text-sm font-semibold text-gold-deep hover:text-gold"
          >
            {playing ? "Hide player" : "Listen / Watch"}
          </button>
          <a
            href={sermon.downloadableFileUrl ?? sermon.mediaUrl}
            download
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:border-gold hover:text-gold-deep"
          >
            Download
          </a>
        </div>
      </div>
    </motion.article>
  );
}
