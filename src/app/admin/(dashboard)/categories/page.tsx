import { CategoryManager } from "@/components/admin/CategoryManager";
import { listCategories } from "@/lib/repositories/category";

export default function AdminCategoriesPage() {
  const categories = listCategories();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Categories</h1>
      <p className="mt-1 text-sm text-ink/60">
        Manage the categories sermons can be tagged with (Relationship, Faith, Prayer, etc.).
      </p>
      <div className="mt-8">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
