import type { Metadata } from "next";
import { MotionSection } from "@/components/site/MotionSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Address, service times, phone number, and social links for Adullam Cave Christian Network.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <SectionHeading eyebrow="Contact" title="We'd love to connect with you" />

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        <MotionSection direction="left">
          <div className="h-full rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-ink">Location</h3>
            <p className="mt-2 leading-relaxed text-ink/70">{siteConfig.address}</p>
            <h3 className="mt-6 font-display text-lg font-semibold text-ink">Phone</h3>
            <p className="mt-2 text-ink/70">{siteConfig.phone}</p>
          </div>
        </MotionSection>

        <MotionSection direction="right" delay={0.1}>
          <div className="h-full rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-ink">Service Times</h3>
            <ul className="mt-2 space-y-1 text-ink/70">
              {siteConfig.serviceTimes.map((s) => (
                <li key={s.day}>
                  <span className="font-semibold text-ink">{s.day}:</span> {s.time}
                </li>
              ))}
            </ul>
          </div>
        </MotionSection>
      </div>

      <MotionSection delay={0.2} className="mt-8">
        <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-sm">
          <h3 className="font-display text-lg font-semibold text-ink">Follow Us</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {siteConfig.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gold/40 px-4 py-2 text-sm font-medium text-gold-deep hover:bg-gold/10"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </MotionSection>
    </div>
  );
}
