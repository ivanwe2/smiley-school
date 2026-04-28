"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ClassCard } from "./ClassCard";
import type { WeekSchedule } from "../types";

const DAY_KEYS = [
  { index: 1, key: "monday" },
  { index: 2, key: "tuesday" },
  { index: 3, key: "wednesday" },
  { index: 4, key: "thursday" },
  { index: 5, key: "friday" },
  { index: 6, key: "saturday" },
] as const;

export function WeeklySchedule({
  schedule,
  todayIndex,
}: {
  schedule: WeekSchedule;
  todayIndex: number;
}) {
  const t = useTranslations("schedule");
  const defaultDay = DAY_KEYS.find((d) => d.index === todayIndex) ? todayIndex : 1;
  const [activeDay, setActiveDay] = useState(defaultDay);

  const activeDayClasses = schedule[activeDay] ?? [];

  return (
    <div>
      {/* ── Mobile day tabs ─────────────────────────────────────── */}
      <div className="md:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {DAY_KEYS.map((day) => {
            const fullName = t(`days.${day.key}`);
            const shortName = fullName.substring(0, 3);
            const count = (schedule[day.index] ?? []).length;
            const isActive = day.index === activeDay;
            const isToday = day.index === todayIndex;
            return (
              <button
                key={day.index}
                onClick={() => setActiveDay(day.index)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all",
                  isActive
                    ? "bg-[var(--navy-deep)] text-white"
                    : "bg-[var(--navy-light)] text-[var(--navy-mid)] hover:bg-[var(--navy-deep)]/10"
                )}
              >
                <span>{shortName}</span>
                {isToday && <span className="w-1 h-1 rounded-full bg-[var(--yellow-primary)] mt-0.5" />}
                {count > 0 && !isToday && (
                  <span className={cn("mt-0.5 text-[9px]", isActive ? "text-white/70" : "text-[var(--text-muted)]")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active day content on mobile */}
        <div className="mt-4">
          <h3 className="font-fraunces font-semibold text-[var(--navy-deep)] text-lg mb-3">
            {t(`days.${DAY_KEYS.find((d) => d.index === activeDay)?.key ?? "monday"}`)}
          </h3>
          {activeDayClasses.length === 0 ? (
            <div className="bg-[var(--navy-light)] rounded-2xl p-8 text-center">
              <p className="text-3xl mb-2">🌙</p>
              <p className="text-sm text-[var(--text-muted)]">{t("noClassesDay")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDayClasses.map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop grid ────────────────────────────────────────── */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4">
        {DAY_KEYS.map((day) => {
          const classes = schedule[day.index] ?? [];
          const isToday = day.index === todayIndex;
          return (
            <div key={day.index}>
              <div className={cn(
                "text-center mb-3 pb-2 border-b",
                isToday ? "border-[var(--yellow-primary)]" : "border-[var(--border)]"
              )}>
                <p className={cn(
                  "font-fraunces font-semibold text-sm",
                  isToday ? "text-[var(--yellow-deep)]" : "text-[var(--navy-deep)]"
                )}>
                  {t(`days.${day.key}`)}
                </p>
                {isToday && (
                  <span className="text-[10px] text-[var(--yellow-deep)] font-semibold">{t("today")}</span>
                )}
              </div>
              {classes.length === 0 ? (
                <div className="rounded-xl bg-[var(--navy-light)]/50 p-4 text-center">
                  <p className="text-xs text-[var(--text-muted)]">{t("noClassesDay")}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {classes.map((cls) => (
                    <ClassCard key={cls.id} cls={cls} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
