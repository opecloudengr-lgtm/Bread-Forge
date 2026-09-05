import { notFound } from "next/navigation";
import { SermonForm } from "@/components/admin/SermonForm";
import { listCategories } from "@/lib/repositories/category";
import { getSermonById } from "@/lib/repositories/sermon";

export default async function EditSermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sermon = getSermonById(id);
  if (!sermon) notFound();

  const categories = listCategories();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Edit Sermon</h1>
      <p className="mt-1 text-sm text-ink/60">{sermon.title}</p>
      <div className="mt-8">
        <SermonForm categories={categories} sermon={sermon} />
      </div>
    </div>
  );
}
