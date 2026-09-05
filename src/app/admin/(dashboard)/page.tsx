import Link from "next/link";
import { listSermons } from "@/lib/repositories/sermon";
import { listEvents } from "@/lib/repositories/event";
import { listCategories } from "@/lib/repositories/category";
import { listAnnouncements } from "@/lib/repositories/announcement";
import { listGalleryItems } from "@/lib/repositories/gallery";

export default function AdminDashboardPage() {
  const sermons = listSermons();
  const events = listEvents("all");
  const categories = listCategories();
  const upcomingCount = listEvents("upcoming").length;
  const announcements = listAnnouncements();
  const galleryItems = listGalleryItems();

  const stats = [
    { label: "Sermons", value: sermons.length, href: "/admin/sermons" },
    { label: "Events", value: events.length, href: "/admin/events" },
    { label: "Upcoming Events", value: upcomingCount, href: "/admin/events" },
    { label: "Announcements", value: announcements.length, href: "/admin/announcements" },
    { label: "Gallery Items", value: galleryItems.length, href: "/admin/gallery" },
    { label: "Categories", value: categories.length, href: "/admin/categories" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/60">A quick look at what&apos;s published on the site.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-ink/60">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/sermons/new"
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light"
        >
          + New Sermon
        </Link>
        <Link
          href="/admin/events/new"
          className="rounded-full border border-gold/50 px-5 py-2.5 text-sm font-semibold text-gold-deep hover:bg-gold/10"
        >
          + New Event
        </Link>
        <Link
          href="/admin/announcements/new"
          className="rounded-full border border-gold/50 px-5 py-2.5 text-sm font-semibold text-gold-deep hover:bg-gold/10"
        >
          + New Announcement
        </Link>
        <Link
          href="/admin/gallery"
          className="rounded-full border border-gold/50 px-5 py-2.5 text-sm font-semibold text-gold-deep hover:bg-gold/10"
        >
          + Add to Gallery
        </Link>
      </div>
    </div>
  );
}
