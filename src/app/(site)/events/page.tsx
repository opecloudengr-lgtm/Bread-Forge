import type { Metadata } from "next";
import { MotionSection } from "@/components/site/MotionSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EventBrowser } from "@/components/site/EventBrowser";
import { AnnouncementCard } from "@/components/site/AnnouncementCard";
import { listEvents } from "@/lib/repositories/event";
import { listAnnouncements } from "@/lib/repositories/announcement";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past events, plus announcements, from Adullam Cave Christian Network.",
};

export const dynamic = "force-dynamic";

export default function EventsPage() {
  const events = listEvents("upcoming");
  const announcements = listAnnouncements();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <MotionSection>
        <SectionHeading
          align="left"
          eyebrow="Events"
          title="Gather With Us"
          description="Programs, conferences, and gatherings — with photos, videos, and downloadable materials."
        />
      </MotionSection>

      <div className="mt-12">
        <EventBrowser initialEvents={events} />
      </div>

      {announcements.length > 0 && (
        <div className="mt-20">
          <MotionSection>
            <SectionHeading align="left" eyebrow="Notices" title="Announcements" />
          </MotionSection>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement, index) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} delay={index * 0.05} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
