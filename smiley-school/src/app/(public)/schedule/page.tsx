import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getTeachers, getWeekSchedule } from "@/features/schedule/queries/schedule.queries";
import { ScheduleBoard } from "@/features/schedule/components/ScheduleBoard";
import { TeacherLegend } from "@/features/schedule/components/TeacherLegend";
import { WeekNavigator } from "@/features/schedule/components/WeekNavigator";
import { resolveWeekStart, todayIso } from "@/features/schedule/lib/dates";
import { SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Weekly Schedule",
  description: `View the current weekly class schedule at ${SCHOOL.name}. Updated in real-time by our admin team.`,
};

type Props = { searchParams: Promise<{ week?: string }> };

export default async function SchedulePage({ searchParams }: Props) {
  const { week } = await searchParams;
  const today = todayIso();
  const weekStart = resolveWeekStart(week);

  const [schedule, teachers, t] = await Promise.all([
    getWeekSchedule(weekStart),
    getTeachers(),
    getTranslations("schedule"),
  ]);
  const isEmpty = schedule.days.every((day) => day.lessons.length === 0);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-[var(--navy-deep)] text-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-fraunces text-3xl sm:text-4xl font-semibold mb-2 text-white">
            {t("hero.heading")}
          </h1>
          <p className="text-[var(--navy-light)]/80">
            {t("hero.description")}
          </p>
        </div>
      </section>

      {/* ── Schedule ─────────────────────────────────────────────── */}
      <section className="py-8 md:py-12 bg-[var(--white)] min-h-[60vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <WeekNavigator weekStart={weekStart} today={today} basePath="/schedule" />
          </div>

          <div className="mb-6">
            <TeacherLegend teachers={teachers} label={t("teachers")} />
          </div>

          {isEmpty ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <h3 className="font-fraunces text-xl font-semibold text-[var(--navy-deep)] mb-2">{t("noClasses")}</h3>
            </div>
          ) : (
            <ScheduleBoard week={schedule} today={today} />
          )}
        </div>
      </section>
    </>
  );
}
