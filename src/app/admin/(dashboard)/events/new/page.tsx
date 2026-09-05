import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">New Event</h1>
      <p className="mt-1 text-sm text-ink/60">Publish an event with photos, video, and/or a PDF flyer.</p>
      <div className="mt-8">
        <EventForm />
      </div>
    </div>
  );
}
