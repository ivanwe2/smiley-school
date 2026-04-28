import { cn } from "@/lib/utils";

const shimmerStyle = {
  background: "linear-gradient(90deg, #e8eff7 25%, #f4f7fb 50%, #e8eff7 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
} as const;

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg", className)}
      style={shimmerStyle}
    />
  );
}

export function ScheduleSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-[var(--border)] p-4 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
