"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/site/EventCard";
import type { Event } from "@/types";

type Filter = "upcoming" | "past" | "all";

const filters: { id: Filter; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
];

export function EventBrowser({ initialEvents }: { initialEvents: Event[] }) {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show a loading state while refetching on filter change
    setLoading(true);
    fetch(`/api/events?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setEvents(data.events);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id ? "bg-gold text-ink" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        className={`mt-10 grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {!loading && events.length === 0 && (
        <p className="mt-16 text-center text-ink/50">No {filter === "all" ? "" : filter} events yet.</p>
      )}
    </div>
  );
}
