"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

export function ProtectedImageGrid({ images, albumName }: { images: GalleryImage[]; albumName: string }) {
  const t = useTranslations("gallery");

  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-3xl mb-3">📷</p>
        <p className="text-[var(--text-muted)]">{t("albumEmpty")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="break-inside-avoid rounded-xl overflow-hidden bg-[var(--navy-light)] group select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="relative">
              {/* Transparent overlay prevents drag-selection of the image */}
              <div className="absolute inset-0 z-10" aria-hidden />
              <Image
                src={img.url}
                alt={img.alt ?? albumName}
                width={img.width ?? 400}
                height={img.height ?? 300}
                className="w-full h-auto group-hover:scale-105 transition-transform duration-500 object-cover pointer-events-none"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                draggable={false}
              />
            </div>
            {img.caption && (
              <p className="px-3 py-2 text-xs text-[var(--text-muted)]">{img.caption}</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-[var(--text-muted)] mt-8 opacity-70">
        {t("copyright")}
      </p>
    </div>
  );
}
