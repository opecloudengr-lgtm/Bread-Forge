import Link from "next/link";
import { listAnnouncements } from "@/lib/repositories/announcement";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default function AdminAnnouncementsPage() {
  const announcements = listAnnouncements();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Announcements</h1>
        <Link
          href="/admin/announcements/new"
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light"
        >
          + New Announcement
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/5 text-ink/60">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Media</th>
              <th className="px-5 py-3 font-medium">Posted</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td className="px-5 py-3 font-medium text-ink">{announcement.title}</td>
                <td className="px-5 py-3 text-ink/70">
                  {[announcement.imageUrl && "Image", announcement.videoUrl && "Video"]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </td>
                <td className="px-5 py-3 text-ink/70">{announcement.createdAt}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/announcements/${announcement.id}/edit`}
                      className="text-sm font-medium text-gold-deep hover:text-gold"
                    >
                      Edit
                    </Link>
                    <ConfirmDeleteButton
                      confirmMessage={`Delete "${announcement.title}"? This cannot be undone.`}
                      deleteUrl={`/api/announcements/${announcement.id}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-ink/50">
                  No announcements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
