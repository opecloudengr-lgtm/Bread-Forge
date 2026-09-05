import Link from "next/link";
import { listSermons } from "@/lib/repositories/sermon";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default function AdminSermonsPage() {
  const sermons = listSermons();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Sermons</h1>
        <Link
          href="/admin/sermons/new"
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light"
        >
          + New Sermon
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/5 text-ink/60">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Speaker</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Categories</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {sermons.map((sermon) => (
              <tr key={sermon.id}>
                <td className="px-5 py-3 font-medium text-ink">{sermon.title}</td>
                <td className="px-5 py-3 text-ink/70">{sermon.speaker}</td>
                <td className="px-5 py-3 text-ink/70">{sermon.datePreached}</td>
                <td className="px-5 py-3 text-ink/70">
                  {sermon.categories.map((c) => c.name).join(", ") || "—"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/sermons/${sermon.id}/edit`}
                      className="text-sm font-medium text-gold-deep hover:text-gold"
                    >
                      Edit
                    </Link>
                    <ConfirmDeleteButton
                      confirmMessage={`Delete "${sermon.title}"? This cannot be undone.`}
                      deleteUrl={`/api/sermons/${sermon.id}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {sermons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink/50">
                  No sermons yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
