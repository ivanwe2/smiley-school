import type { Metadata } from "next";
import Image from "next/image";
import { getAllAlbumsAdmin } from "@/features/gallery/queries/gallery.queries";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

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
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors">
          <Plus size={16} /> New Album
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-3xl mb-3">🖼️</p>
          <p className="text-[var(--text-muted)] text-sm">No albums yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map((album) => {
            const typedAlbum = album as typeof album & { images: { url: string; alt: string | null }[] };
            const cover = typedAlbum.images[0];
            return (
              <div key={album.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="aspect-video bg-[var(--navy-light)] relative">
                  {cover?.url ? (
                    <Image src={cover.url} alt={cover.alt ?? album.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20">🎓</div>
                  )}
                  {!album.published && (
                    <span className="absolute top-2 left-2 bg-gray-800/80 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full">Hidden</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-fraunces font-semibold text-sm text-[var(--navy-deep)] truncate">{album.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {typedAlbum.images.length} photos{album.date && ` · ${formatDate(album.date, "MMM yyyy")}`}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--navy-mid)] hover:bg-[var(--navy-light)] transition-colors">Manage</button>
                    <button className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[var(--yellow-light)] text-[var(--yellow-deep)] hover:bg-[var(--yellow-primary)] hover:text-white transition-colors">Upload</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
