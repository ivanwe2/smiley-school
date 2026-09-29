"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { dayKey, formatDayMonth } from "../lib/format";
import { LessonCell } from "./LessonCell";
import type { Lesson, ScheduleDay, WeekSchedule } from "../types";

type ScheduleBoardProps = {
  week: WeekSchedule;
  /** "YYYY-MM-DD" in the school's time zone */
  today: string;
  /** Makes lessons clickable (admin editor). */
  onLessonSelect?: (lesson: Lesson) => void;
  /** Shows an "add" button under each day (admin editor). */
  onAddLesson?: (day: ScheduleDay) => void;
  addLabel?: string;
};

/**
 * The weekly timetable: Monday–Saturday columns on larger screens, one day
 * at a time (with day tabs) on phones. Lessons are tinted by teacher.
 */
export function ScheduleBoard({ week, today, onLessonSelect, onAddLesson, addLabel }: ScheduleBoardProps) {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const [activeDay, setActiveDay] = useState(
    () => week.days.find((day) => day.date === today)?.dayOfWeek ?? 1
  );
  const active = week.days.find((day) => day.dayOfWeek === activeDay) ?? week.days[0];

  function renderDay(day: ScheduleDay, variant: "column" | "row") {
    return (
      <>
        {day.lessons.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] py-4 text-center text-xs text-[var(--text-muted)]">
            {t("noClassesDay")}
          </p>
        ) : (
          <ul className={variant === "row" ? "space-y-2" : "space-y-1.5"}>
            {day.lessons.map((lesson) => (
              <li key={lesson.key}>
                {onLessonSelect ? (
                  <button
                    type="button"
                    onClick={() => onLessonSelect(lesson)}
                    className="block w-full rounded-lg transition hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--yellow-primary)] focus-visible:outline-none"
                  >
                    <LessonCell lesson={lesson} variant={variant} />
                  </button>
                ) : (
                  <LessonCell lesson={lesson} variant={variant} />
                )}
              </li>
            ))}
          </ul>
        )}
        {onAddLesson && (
          <button
            type="button"
            onClick={() => onAddLesson(day)}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--border)] py-2 text-xs font-semibold text-[var(--navy-mid)] transition-colors hover:border-[var(--navy-mid)] hover:bg-white"
          >
            <Plus size={14} aria-hidden />
            {addLabel}
          </button>
        )}
      </>
    );
  }

  return (
    <div>
      {/* ── Phones: one day at a time ─────────────────────────────── */}
      <div className="md:hidden">
        <div role="tablist" className="grid grid-cols-6 gap-1">
          {week.days.map((day) => {
            const isActive = day.dayOfWeek === active?.dayOfWeek;
            const isToday = day.date === today;
            return (
              <button
                key={day.date}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveDay(day.dayOfWeek)}
                className={cn(
                  "flex flex-col items-center rounded-xl py-2 transition-colors",
                  isActive
                    ? "bg-[var(--navy-deep)] text-white"
                    : "bg-[var(--navy-light)] text-[var(--navy-mid)] hover:bg-[var(--navy-deep)]/10"
                )}
              >
                <span className="text-xs font-bold">{t(`daysShort.${dayKey(day.dayOfWeek)}`)}</span>
                <span className={cn("text-[10px]", isActive ? "text-white/75" : "text-[var(--text-muted)]")}>
                  {formatDayMonth(day.date, locale)}
                </span>
                <span
                  aria-hidden
                  className={cn("mt-0.5 size-1 rounded-full", isToday ? "bg-[var(--yellow-primary)]" : "bg-transparent")}
                />
              </button>
            );
          })}
        </div>

        {active && (
          <div role="tabpanel" className="mt-4">
            <h3 className="mb-3 font-fraunces text-lg font-semibold text-[var(--navy-deep)]">
              {t(`days.${dayKey(active.dayOfWeek)}`)}{" "}
              <span className="text-sm font-normal text-[var(--text-muted)]">
                {formatDayMonth(active.date, locale)}
                {active.date === today && ` · ${t("today")}`}
              </span>
            </h3>
            {renderDay(active, "row")}
          </div>
        )}
      </div>

      {/* ── Tablets & desktops: the whole week ───────────────────── */}
      <div className="hidden gap-2 md:grid md:grid-cols-3 lg:grid-cols-6">
        {week.days.map((day) => {
          const isToday = day.date === today;
          return (
            <section key={day.date} aria-label={t(`days.${dayKey(day.dayOfWeek)}`)}>
              <header
                className={cn(
                  "mb-2 rounded-lg px-2 py-1.5 text-center",
                  isToday ? "bg-[var(--yellow-primary)] text-[var(--navy-deep)]" : "bg-[var(--navy-deep)] text-white"
                )}
              >
                <p className="text-sm font-bold">{t(`days.${dayKey(day.dayOfWeek)}`)}</p>
                <p className="text-[11px] opacity-80">
                  {formatDayMonth(day.date, locale)}
                  {isToday && ` · ${t("today")}`}
                </p>
              </header>
              {renderDay(day, "column")}
            </section>
          );
        })}
      </div>
    </div>
  );
}
