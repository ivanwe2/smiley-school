import type { Metadata } from "next";
import { startOfWeek, parseISO, isValid, getDay } from "date-fns";
import { getWeekSchedule } from "@/features/schedule/queries/schedule.queries";
import { WeeklySchedule } from "@/features/schedule/components/WeeklySchedule";
import { WeekNavigator } from "@/features/schedule/components/WeekNavigator";
import { SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Weekly Schedule",
  description: `View the current weekly class schedule at ${SCHOOL.name}. Updated in real-time by our admin team.`,
};

// Revalidate every hour so changes propagate quickly
export const revalidate = 3600;

type Props = { searchParams: Promise<{ week?: string }> };

export default async function SchedulePage({ searchParams }: Props) {
  const { week } = await searchParams;

  // Parse ?week=YYYY-MM-DD or default to current Monday
  let weekStart: Date;
  if (week) {
    const parsed = parseISO(week);
    weekStart = isValid(parsed)
      ? startOfWeek(parsed, { weekStartsOn: 1 })
      : startOfWeek(new Date(), { weekStartsOn: 1 });
  } else {
    weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  const schedule = await getWeekSchedule(weekStart);
  const todayIndex = getDay(new Date()); // 0=Sun, 1=Mon, …

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-[var(--navy-deep)] text-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-fraunces text-3xl sm:text-4xl font-semibold mb-2">
            Weekly Schedule
          </h1>
          <p className="text-[var(--navy-light)]/80">
            All current classes — updated in real time. Cancellations and changes are shown automatically.
          </p>
        </div>
      </section>

      {/* ── Schedule ─────────────────────────────────────────────── */}
      <section className="py-8 md:py-12 bg-[var(--white)] min-h-[60vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Week nav */}
          <div className="mb-8">
            <WeekNavigator weekStart={weekStart} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-6 text-xs">
            {[
              { color: "bg-white border border-[var(--border)]", label: "Normal class" },
              { color: "bg-red-50 border border-red-200", label: "Cancelled" },
              { color: "bg-white border border-[var(--border)]", label: "Rescheduled", badge: true },
            ].map(({ color, label, badge }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded ${color}`} />
                {badge && (
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-bold uppercase px-1 rounded">R</span>
                )}
                <span className="text-[var(--text-muted)]">{label}</span>
              </div>
            ))}
          </div>

          <WeeklySchedule schedule={schedule} todayIndex={todayIndex} />

          {/* Empty state */}
          {Object.values(schedule).every((d) => d.length === 0) && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <h3 className="font-fraunces text-xl font-semibold text-[var(--navy-deep)] mb-2">No classes this week</h3>
              <p className="text-[var(--text-muted)] text-sm">Check back next week or contact us for more information.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}