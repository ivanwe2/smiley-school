import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedAlbums } from "@/features/gallery/queries/gallery.queries";
import { formatDate } from "@/lib/utils";
import { SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: `Browse graduation ceremonies, events, and school life photos from ${SCHOOL.name}.`,
};

export const revalidate = 3600;

export default async function GalleryPage() {
  const albums = await getPublishedAlbums();

  return (
    <>
      <section className="bg-[var(--navy-deep)] text-white py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold mb-3">
            <span className="text-[var(--yellow-primary)]">Gallery</span>
          </h1>
          <p className="text-[var(--navy-light)]/80 text-lg">Graduation days, school events, and classroom moments.</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {albums.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🖼️</p>
              <h2 className="font-fraunces text-xl font-semibold text-[var(--navy-deep)] mb-2">No albums yet</h2>
              <p className="text-[var(--text-muted)] text-sm">Photos coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => {
                const cover = (album as typeof album & { images: { url: string }[] }).images[0];
                return (
                  <Link
                    key={album.id}
                    href={`/gallery/${album.id}`}
                    className="group block bg-white rounded-2xl border border-[var(--border)] overflow-hidden card-hover"
                  >
                    <div className="aspect-[4/3] bg-[var(--navy-light)] relative overflow-hidden">
                      {cover?.url ? (
                        <Image
                          src={cover.url}
                          alt={album.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl opacity-20">🎓</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="font-fraunces font-semibold text-[var(--navy-deep)] mb-1 group-hover:text-[var(--yellow-deep)] transition-colors">
                        {album.name}
                      </h2>
                      {album.description && (
                        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-2">{album.description}</p>
                      )}
                      {album.date && (
                        <p className="text-xs text-[var(--text-muted)]">{formatDate(album.date, "MMMM yyyy")}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}