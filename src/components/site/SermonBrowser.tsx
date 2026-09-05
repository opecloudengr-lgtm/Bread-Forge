"use client";

import { useEffect, useMemo, useState } from "react";
import { SermonCard } from "@/components/site/SermonCard";
import type { Category, Sermon } from "@/types";

interface SermonBrowserProps {
  initialSermons: Sermon[];
  categories: Category[];
}

export function SermonBrowser({ initialSermons, categories }: SermonBrowserProps) {
  const [sermons, setSermons] = useState(initialSermons);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory) params.set("categoryId", activeCategory);
        if (search.trim()) params.set("q", search.trim());
        const res = await fetch(`/api/sermons?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSermons(data.sermons);
        }
      } catch {
        // aborted or network hiccup — leave list as-is
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [activeCategory, search]);

  const tabs = useMemo(
    () => [{ id: null, name: "All" }, ...categories.map((c) => ({ id: c.id, name: c.name }))],
    [categories]
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id ?? "all"}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === tab.id
                  ? "bg-gold text-ink"
                  : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or speaker…"
          className="w-full max-w-xs rounded-full border border-ink/15 bg-white px-4 py-2 text-sm focus:border-gold focus:outline-none"
        />
      </div>

      <div
        className={`mt-10 grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {sermons.map((sermon) => (
          <SermonCard key={sermon.id} sermon={sermon} />
        ))}
      </div>

      {!loading && sermons.length === 0 && (
        <p className="mt-16 text-center text-ink/50">No sermons match your search yet.</p>
      )}
    </div>
  );
}
