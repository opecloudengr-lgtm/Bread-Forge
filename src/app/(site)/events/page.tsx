import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EventBrowser } from "@/components/site/EventBrowser";
import { listEvents } from "@/lib/repositories/event";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past events from Adullam Cave Christian Network.",
};

export const dynamic = "force-dynamic";

export default function EventsPage() {
  const events = listEvents("upcoming");

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        align="left"
        eyebrow="Events"
        title="Gather With Us"
        description="Programs, conferences, and gatherings — with photos, videos, and downloadable materials."
      />
      <div className="mt-12">
        <EventBrowser initialEvents={events} />
      </div>
    </div>
  );
}
