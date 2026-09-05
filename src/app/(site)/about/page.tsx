import type { Metadata } from "next";
import { MotionSection } from "@/components/site/MotionSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pillars, siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About",
  description: `The mandate and pillars of ${siteConfig.ministry}.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink py-24 text-parchment">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionHeading
            light
            eyebrow="About Us"
            title={siteConfig.ministry}
            description="A ministry committed to discipleship and the teaching and preaching of the Gospel of the Kingdom of God."
          />
          <p className="mt-8 font-display text-xl italic text-gold-light">
            {siteConfig.mandateVerse}
          </p>
          <p className="mt-2 text-xs uppercase tracking-widest text-parchment/50">
            {siteConfig.mandateReferences}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <SectionHeading eyebrow="Our Pillars" title="Seven pillars that carry the mandate" />
        <div className="mt-14 space-y-6">
          {pillars.map((pillar, index) => (
            <MotionSection key={pillar.name} delay={index * 0.05} direction={index % 2 === 0 ? "left" : "right"}>
              <div className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:gap-8">
                <span className="font-display text-4xl font-bold text-gold/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">{pillar.name}</h3>
                  <p className="mt-2 leading-relaxed text-ink/70">{pillar.description}</p>
                </div>
              </div>
            </MotionSection>
          ))}
        </div>
      </section>
    </>
  );
}
