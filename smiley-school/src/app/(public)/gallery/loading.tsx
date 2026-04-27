import { Skeleton } from "@/components/shared/Skeleton";

export default function GalleryLoading() {
  return (
    <div>
      <div className="bg-[var(--navy-deep)] py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-32 bg-white/10" />
          <Skeleton className="h-5 w-72 mt-3 bg-white/10" />
        </div>
      </div>
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border)]">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
