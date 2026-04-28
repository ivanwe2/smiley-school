import { Skeleton } from "@/components/shared/Skeleton";

export default function ScheduleLoading() {
  return (
    <div>
      <div className="bg-[var(--navy-deep)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-9 w-56 bg-white/10" />
          <Skeleton className="h-4 w-80 mt-2 bg-white/10" />
        </div>
      </div>
      <div className="py-8 md:py-12 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-10 rounded-xl ml-auto" />
          </div>
          {/* Mobile skeleton */}
          <div className="md:hidden">
            <div className="flex gap-2 mb-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-12 w-14 rounded-xl flex-shrink-0" />)}
            </div>
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-[var(--border)] p-4 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
          {/* Desktop skeleton */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-5 w-full" />
                {i % 2 === 0 && <div className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}