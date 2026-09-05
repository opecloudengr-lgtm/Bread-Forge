import { notFound } from "next/navigation";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { getAnnouncementById } from "@/lib/repositories/announcement";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = getAnnouncementById(id);
  if (!announcement) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Edit Announcement</h1>
      <p className="mt-1 text-sm text-ink/60">{announcement.title}</p>
      <div className="mt-8">
        <AnnouncementForm announcement={announcement} />
      </div>
    </div>
  );
}
