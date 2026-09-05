import { Hero } from "@/components/site/Hero";
import { MotionSection } from "@/components/site/MotionSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SermonCard } from "@/components/site/SermonCard";
import { EventCard } from "@/components/site/EventCard";
import { LinkButton } from "@/components/site/Button";
import { listSermons } from "@/lib/repositories/sermon";
import { listEvents } from "@/lib/repositories/event";
import { pillars, siteConfig } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const recentSermons = listSermons().slice(0, 3);
  const upcomingEvents = listEvents("upcoming").slice(0, 3);

  return (
    <>
      <Hero />

      <MotionSection className="mx-auto max-w-5xl px-6 py-24">
        <SectionHeading
          eyebrow="Our Mandate"
          title="A people prepared for the LORD"
          description={`${siteConfig.ministry} exists to disciple, teach, and preach the Gospel of the Kingdom — forming a people ready for the return of the King, carried on ${pillars.length} pillars.`}
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <MotionSection key={pillar.name} delay={index * 0.05}>
              <div className="h-full rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
                <p className="font-display text-lg font-semibold text-gold-deep">{pillar.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{pillar.description}</p>
              </div>
            </MotionSection>
          ))}
        </div>
      </MotionSection>

      {recentSermons.length > 0 && (
        <MotionSection className="bg-parchment-dim py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <SectionHeading
                align="left"
                eyebrow="Recent Sermons"
                title="Feed your spirit this week"
              />
              <LinkButton href="/sermons" variant="outline">
                Browse All Sermons
              </LinkButton>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentSermons.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      {upcomingEvents.length > 0 && (
        <MotionSection className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <SectionHeading align="left" eyebrow="What's Next" title="Upcoming Events" />
              <LinkButton href="/events" variant="outline">
                View All Events
              </LinkButton>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      <MotionSection className="bg-ink py-24 text-parchment">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionHeading
            light
            eyebrow="Partnership"
            title="Sow into the work of the Kingdom"
            description="Adullam Kingdom Stewards (AKS) partner proactively with the ministry through giving and benevolence. See how you can be part of it."
          />
          <div className="mt-8">
            <LinkButton href="/partnership">Learn About Giving</LinkButton>
          </div>
        </div>
      </MotionSection>
    </>
  );
}
