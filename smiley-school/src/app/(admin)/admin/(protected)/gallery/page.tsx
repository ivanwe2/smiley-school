import type { Metadata } from "next";
import { getAllAlbumsAdmin } from "@/features/gallery/queries/gallery.queries";
import { NewAlbumButton } from "./NewAlbumButton";
import { AlbumCard } from "./AlbumCard";

export const metadata: Metadata = { title: "Gallery Manager" };

export default async function AdminGalleryPage() {
  const albums = await getAllAlbumsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[var(--navy-deep)]">Gallery</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">{albums.length} albums</p>
        </div>
        <NewAlbumButton />
      </div>

      {albums.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-3xl mb-3">🖼️</p>
          <p className="text-[var(--text-muted)] text-sm">No albums yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map((album) => {
            const typedAlbum = album as typeof album & { images: { url: string; alt: string | null }[] };
            return <AlbumCard key={album.id} album={typedAlbum} />;
          })}
        </div>
      )}
    </div>
  );
}
