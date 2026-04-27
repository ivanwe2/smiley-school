import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAlbumWithImages } from "@/features/gallery/queries/gallery.queries";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ albumId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { albumId } = await params;
  const album = await getAlbumWithImages(albumId);
  if (!album) return { title: "Album not found" };
  return { title: album.name, description: album.description ?? undefined };
}

export const revalidate = 3600;

export default async function AlbumPage({ params }: Props) {
  const { albumId } = await params;
  const album = await getAlbumWithImages(albumId);
  if (!album) notFound();

  const images = (album as typeof album & { images: { id: string; url: string; alt: string | null; caption: string | null; width: number | null; height: number | null }[] }).images;

  return (
    <>
      <section className="bg-[var(--navy-deep)] text-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/gallery" className="inline-flex items-center gap-1.5 text-sm text-[var(--navy-light)]/70 hover:text-white transition-colors mb-4">
            <ArrowLeft size={15} />
            All albums
          </Link>
          <h1 className="font-fraunces text-3xl sm:text-4xl font-semibold mb-2">{album.name}</h1>
          {album.description && <p className="text-[var(--navy-light)]/80">{album.description}</p>}
          {album.date && <p className="text-sm text-[var(--navy-light)]/60 mt-1">{formatDate(album.date, "MMMM yyyy")}</p>}
        </div>
      </section>

      <section className="py-10 md:py-14 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {images.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">📷</p>
              <p className="text-[var(--text-muted)]">No photos in this album yet.</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {images.map((img) => (
                <div key={img.id} className="break-inside-avoid rounded-xl overflow-hidden bg-[var(--navy-light)] group cursor-pointer">
                  <div className="relative">
                    <Image
                      src={img.url}
                      alt={img.alt ?? album.name}
                      width={img.width ?? 400}
                      height={img.height ?? 300}
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-500 object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  {img.caption && (
                    <p className="px-3 py-2 text-xs text-[var(--text-muted)]">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
