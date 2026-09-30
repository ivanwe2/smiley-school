import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getTeachers, getWeekSchedule } from "@/features/schedule/queries/schedule.queries";
import { WeekNavigator } from "@/features/schedule/components/WeekNavigator";
import { resolveWeekStart, todayIso } from "@/features/schedule/lib/dates";
import { AdminScheduleEditor } from "./AdminScheduleEditor";

export const metadata: Metadata = { title: "Schedule Manager" };

type Props = { searchParams: Promise<{ week?: string }> };

export default async function AdminSchedulePage({ searchParams }: Props) {
  const { week } = await searchParams;
  const today = todayIso();
  const weekStart = resolveWeekStart(week);

  const [schedule, teachers, t] = await Promise.all([
    getWeekSchedule(weekStart),
    getTeachers(),
    getTranslations("adminSchedule"),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[var(--navy-deep)]">
            {t("title")}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">{t("subtitle")}</p>
        </div>
        <Link
          href={`/schedule?week=${weekStart}`}
          target="_blank"
          className="flex items-center gap-1.5 text-sm font-semibold text-[var(--navy-mid)] hover:underline"
        >
          {t("viewPublic")}
          <ExternalLink size={14} aria-hidden />
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-3 sm:p-4">
        <WeekNavigator weekStart={weekStart} today={today} basePath="/admin/schedule" />
      </div>

      <AdminScheduleEditor week={schedule} today={today} teachers={teachers} />
    </div>
  );
}
