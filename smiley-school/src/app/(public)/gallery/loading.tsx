import { AlbumCardSkeleton } from "@/components/shared/Skeleton";

export default function GalleryLoading() {
  return (
    <div>
      <div className="bg-[var(--navy-deep)] py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-12 w-32 rounded-lg bg-white/10" />
          <div className="h-5 w-72 mt-3 rounded-lg bg-white/10" />
        </div>
      </div>
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AlbumCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
