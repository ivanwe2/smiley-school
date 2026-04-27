"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClassCard } from "./ClassCard";
import type { WeekSchedule } from "../types";

const DAYS = [
  { index: 1, short: "Mon", full: "Monday" },
  { index: 2, short: "Tue", full: "Tuesday" },
  { index: 3, short: "Wed", full: "Wednesday" },
  { index: 4, short: "Thu", full: "Thursday" },
  { index: 5, short: "Fri", full: "Friday" },
  { index: 6, short: "Sat", full: "Saturday" },
];

export function WeeklySchedule({
  schedule,
  todayIndex,
}: {
  schedule: WeekSchedule;
  todayIndex: number;
}) {
  // Mobile: default to today's tab (or Monday if weekend)
  const defaultDay = DAYS.find((d) => d.index === todayIndex) ? todayIndex : 1;
  const [activeDay, setActiveDay] = useState(defaultDay);

  const activeDayClasses = schedule[activeDay] ?? [];

  return (
    <div>
      {/* ── Mobile day tabs ─────────────────────────────────────── */}
      <div className="md:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {DAYS.map((day) => {
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
                <span>{day.short}</span>
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
            {DAYS.find((d) => d.index === activeDay)?.full}
          </h3>
          {activeDayClasses.length === 0 ? (
            <div className="bg-[var(--navy-light)] rounded-2xl p-8 text-center">
              <p className="text-3xl mb-2">🌙</p>
              <p className="text-sm text-[var(--text-muted)]">No classes scheduled</p>
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
        {DAYS.map((day) => {
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
                  {day.full}
                </p>
                {isToday && (
                  <span className="text-[10px] text-[var(--yellow-deep)] font-semibold">Today</span>
                )}
              </div>
              {classes.length === 0 ? (
                <div className="rounded-xl bg-[var(--navy-light)]/50 p-4 text-center">
                  <p className="text-xs text-[var(--text-muted)]">No classes</p>
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
