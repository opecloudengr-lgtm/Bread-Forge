import type { Metadata } from "next";
import { MotionSection } from "@/components/site/MotionSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { listGalleryItems } from "@/lib/repositories/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos from Adullam Cave Christian Network services and events.",
};

export const dynamic = "force-dynamic";

export default function GalleryPage() {
  const items = listGalleryItems();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <MotionSection>
        <SectionHeading
          align="left"
          eyebrow="Gallery"
          title="Moments From The House"
          description="Photos and videos from our services, conferences, and gatherings."
        />
      </MotionSection>
      <div className="mt-12">
        {items.length > 0 ? (
          <GalleryGrid items={items} />
        ) : (
          <p className="py-16 text-center text-ink/50">No photos or videos yet — check back soon.</p>
        )}
      </div>
    </div>
  );
}
