import Link from "next/link";
import { format, parseISO } from "date-fns";
import { listEvents } from "@/lib/repositories/event";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default function AdminEventsPage() {
  const events = listEvents("all");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Events</h1>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light"
        >
          + New Event
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/5 text-ink/60">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-5 py-3 font-medium">Media</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {events.map((event) => {
              let dateLabel = event.eventDate;
              try {
                dateLabel = format(parseISO(event.eventDate), "MMM d, yyyy h:mm a");
              } catch {
                // keep raw
              }
              return (
                <tr key={event.id}>
                  <td className="px-5 py-3 font-medium text-ink">{event.title}</td>
                  <td className="px-5 py-3 text-ink/70">{dateLabel}</td>
                  <td className="px-5 py-3 text-ink/70">{event.location || "—"}</td>
                  <td className="px-5 py-3 text-ink/70">{event.media.length} file(s)</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-sm font-medium text-gold-deep hover:text-gold"
                      >
                        Edit
                      </Link>
                      <ConfirmDeleteButton
                        confirmMessage={`Delete "${event.title}"? This cannot be undone.`}
                        deleteUrl={`/api/events/${event.id}`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink/50">
                  No events yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
