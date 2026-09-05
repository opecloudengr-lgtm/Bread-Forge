import { SermonForm } from "@/components/admin/SermonForm";
import { listCategories } from "@/lib/repositories/category";

export default function NewSermonPage() {
  const categories = listCategories();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">New Sermon</h1>
      <p className="mt-1 text-sm text-ink/60">Publish a sermon for visitors to stream and download.</p>
      <div className="mt-8">
        <SermonForm categories={categories} />
      </div>
    </div>
  );
}
