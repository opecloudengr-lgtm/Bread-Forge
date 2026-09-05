"use client";

import { motion } from "framer-motion";
import type { Announcement } from "@/types";

export function AnnouncementCard({ announcement, delay = 0 }: { announcement: Announcement; delay?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-gold/30 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      {announcement.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={announcement.imageUrl}
          alt={announcement.title}
          className="h-48 w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-6">
        <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep">
          Announcement
        </span>
        <h3 className="font-display text-lg font-semibold text-ink">{announcement.title}</h3>
        {announcement.message && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{announcement.message}</p>
        )}
        {announcement.videoUrl && (
          <video src={announcement.videoUrl} controls className="mt-2 w-full rounded-lg" />
        )}
      </div>
    </motion.article>
  );
}
