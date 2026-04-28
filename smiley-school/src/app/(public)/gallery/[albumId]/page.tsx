import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAlbumWithImages } from "@/features/gallery/queries/gallery.queries";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { ProtectedImageGrid } from "@/features/gallery/components/ProtectedImageGrid";

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

  const t = await getTranslations("gallery");

  const images = (album as typeof album & {
    images: { id: string; url: string; alt: string | null; caption: string | null; width: number | null; height: number | null }[];
  }).images;

  return (
    <>
      <section className="bg-[var(--navy-deep)] text-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--navy-light)]/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={15} />
            {t("allAlbums")}
          </Link>
          <h1 className="font-fraunces text-3xl sm:text-4xl font-semibold mb-2 text-white">{album.name}</h1>
          {album.description && <p className="text-[var(--navy-light)]/80">{album.description}</p>}
          {album.date && (
            <p className="text-sm text-[var(--navy-light)]/60 mt-1">{formatDate(album.date, "MMMM yyyy")}</p>
          )}
        </div>
      </section>

      <section className="py-10 md:py-14 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProtectedImageGrid images={images} albumName={album.name} />
        </div>
      </section>
    </>
  );
}
