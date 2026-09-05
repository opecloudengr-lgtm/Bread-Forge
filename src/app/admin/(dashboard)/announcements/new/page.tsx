import { AnnouncementForm } from "@/components/admin/AnnouncementForm";

export default function NewAnnouncementPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">New Announcement</h1>
      <p className="mt-1 text-sm text-ink/60">
        A general notice — no date or location required, unlike an event.
      </p>
      <div className="mt-8">
        <AnnouncementForm />
      </div>
    </div>
  );
}
