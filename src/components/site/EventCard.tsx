"use client";

import { format, isPast, parseISO } from "date-fns";
import type { Event } from "@/types";

export function EventCard({ event }: { event: Event }) {
  let formattedDate = event.eventDate;
  let past = false;
  try {
    const date = parseISO(event.eventDate);
    formattedDate = format(date, "EEEE, MMMM d, yyyy · h:mm a");
    past = isPast(date);
  } catch {
    // keep raw string if parsing fails
  }

  const images = event.media.filter((m) => m.type === "image");
  const videos = event.media.filter((m) => m.type === "video");
  const pdfs = event.media.filter((m) => m.type === "pdf");
  const heroImage = images[0];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-xl">
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroImage.fileUrl} alt={event.title} className="h-56 w-full object-cover" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            past ? "bg-ink/10 text-ink/60" : "bg-gold/15 text-gold-deep"
          }`}
        >
          {past ? "Past Event" : "Upcoming"}
        </span>

        <h3 className="font-display text-xl font-semibold text-ink">{event.title}</h3>
        <p className="text-sm font-medium text-ink/60">{formattedDate}</p>
        {event.location && <p className="text-sm text-ink/60">{event.location}</p>}
        {event.description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">
            {event.description}
          </p>
        )}

        {images.length > 1 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.slice(1).map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.id}
                src={image.fileUrl}
                alt={image.originalName}
                className="h-16 w-full rounded-md object-cover"
              />
            ))}
          </div>
        )}

        {videos.map((video) => (
          <video key={video.id} controls className="mt-2 w-full rounded-lg" src={video.fileUrl} />
        ))}

        {pdfs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {pdfs.map((pdf) => (
              <a
                key={pdf.id}
                href={pdf.fileUrl}
                download
                className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:border-gold hover:text-gold-deep"
              >
                Download {pdf.originalName || "PDF"}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
