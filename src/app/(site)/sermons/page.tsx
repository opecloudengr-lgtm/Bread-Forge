import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SermonBrowser } from "@/components/site/SermonBrowser";
import { listSermons } from "@/lib/repositories/sermon";
import { listCategories } from "@/lib/repositories/category";

export const metadata: Metadata = {
  title: "Sermons",
  description: "Stream and download sermons by category — Relationship, Faith, Prayer, Warfare, and more.",
};

export const dynamic = "force-dynamic";

export default function SermonsPage() {
  const sermons = listSermons();
  const categories = listCategories();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        align="left"
        eyebrow="Sermons"
        title="Teaching & Preaching Archive"
        description="Every message is free to stream or download — no login required."
      />
      <div className="mt-12">
        <SermonBrowser initialSermons={sermons} categories={categories} />
      </div>
    </div>
  );
}
