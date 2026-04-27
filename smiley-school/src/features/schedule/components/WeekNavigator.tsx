"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format, startOfWeek, isThisWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function WeekNavigator({ weekStart }: { weekStart: Date }) {
  const router = useRouter();
  const weekEnd = addDays(weekStart, 6);
  const isCurrentWeek = isThisWeek(weekStart, { weekStartsOn: 1 });

  function navigate(delta: number) {
    const next = addDays(weekStart, delta * 7);
    const iso = format(next, "yyyy-MM-dd");
    router.push(`/schedule?week=${iso}`);
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <button
        onClick={() => navigate(-1)}
        aria-label="Previous week"
        className="p-2.5 rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--navy-light)] transition-colors active:scale-95"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="text-center flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-base text-[var(--navy-deep)] truncate">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
        </p>
        {isCurrentWeek && (
          <span className="text-xs text-[var(--yellow-deep)] font-semibold">This week</span>
        )}
      </div>

      <div className="flex gap-1.5">
        {!isCurrentWeek && (
          <button
            onClick={() => router.push("/schedule")}
            className="hidden sm:block px-3 py-2 text-xs font-semibold rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--navy-light)] transition-colors"
          >
            Today
          </button>
        )}
        <button
          onClick={() => navigate(1)}
          aria-label="Next week"
          className="p-2.5 rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--navy-light)] transition-colors active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
