import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";
import { getEventById } from "@/lib/repositories/event";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Edit Event</h1>
      <p className="mt-1 text-sm text-ink/60">{event.title}</p>
      <div className="mt-8">
        <EventForm event={event} />
      </div>
    </div>
  );
}
