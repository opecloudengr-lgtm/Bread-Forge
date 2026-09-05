import { GalleryManager } from "@/components/admin/GalleryManager";
import { listGalleryItems } from "@/lib/repositories/gallery";

export default function AdminGalleryPage() {
  const items = listGalleryItems();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Gallery</h1>
      <p className="mt-1 text-sm text-ink/60">Upload photos and videos for the public gallery page.</p>
      <div className="mt-8">
        <GalleryManager items={items} />
      </div>
    </div>
  );
}
