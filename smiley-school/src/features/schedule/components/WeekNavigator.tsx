import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysIso, weekStartIso } from "../lib/dates";
import { formatDateRange } from "../lib/format";

type WeekNavigatorProps = {
  /** Monday, "YYYY-MM-DD" */
  weekStart: string;
  /** "YYYY-MM-DD" in the school's time zone */
  today: string;
  /** page to navigate within, e.g. "/schedule" */
  basePath: string;
};

const arrowClass =
  "p-2.5 rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--navy-light)] transition-colors active:scale-95";

export function WeekNavigator({ weekStart, today, basePath }: WeekNavigatorProps) {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const isCurrentWeek = weekStart === weekStartIso(today);
  const weekHref = (days: number) => `${basePath}?week=${addDaysIso(weekStart, days)}`;

  return (
    <nav className="flex items-center gap-2 sm:gap-4">
      <Link href={weekHref(-7)} scroll={false} aria-label={t("prevWeek")} className={arrowClass}>
        <ChevronLeft size={18} />
      </Link>

      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-semibold text-[var(--navy-deep)] sm:text-base">
          {formatDateRange(weekStart, addDaysIso(weekStart, 5), locale)}
        </p>
        {isCurrentWeek ? (
          <span className="text-xs font-semibold text-[var(--yellow-deep)]">{t("currentWeek")}</span>
        ) : (
          <Link
            href={basePath}
            scroll={false}
            className="text-xs font-semibold text-[var(--navy-mid)] underline underline-offset-2"
          >
            {t("today")}
          </Link>
        )}
      </div>

      <Link href={weekHref(7)} scroll={false} aria-label={t("nextWeek")} className={arrowClass}>
        <ChevronRight size={18} />
      </Link>
    </nav>
  );
}
