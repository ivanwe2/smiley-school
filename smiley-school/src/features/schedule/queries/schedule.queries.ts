import { cache } from "react";
import { db } from "@/lib/db";
import { addDays, startOfWeek, endOfWeek } from "date-fns";
import type { WeekSchedule, ScheduledClass } from "../types";

/**
 * Returns all active classes with overrides for a given week.
 * Cached per request to avoid duplicate DB calls.
 */
export const getWeekSchedule = cache(async (weekStart: Date): Promise<WeekSchedule> => {
  const weekEnd = addDays(weekStart, 6);

  const classes = await db.class.findMany({
    where: { isActive: true },
    include: {
      overrides: {
        where: {
          date: { gte: weekStart, lte: weekEnd },
        },
      },
    },
  });

  const schedule: WeekSchedule = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  for (const cls of classes as (typeof classes[number] & { overrides: { type: string; overrideStartTime: string | null; overrideEndTime: string | null; overrideRoom: string | null; note: string | null }[] })[]) {
    const override = cls.overrides[0]; // at most one per class per date

    const scheduled: ScheduledClass = {
      id: cls.id,
      name: cls.name,
      level: cls.level,
      teacher: cls.teacher,
      room: override?.overrideRoom ?? cls.room,
      color: cls.color,
      dayOfWeek: cls.dayOfWeek,
      startTime: override?.overrideStartTime ?? cls.startTime,
      endTime: override?.overrideEndTime ?? cls.endTime,
      status: override
        ? override.type === "CANCELLED"
          ? "cancelled"
          : override.type === "RESCHEDULED"
          ? "rescheduled"
          : "note"
        : "normal",
      override: override
        ? {
            type: override.type as "CANCELLED" | "RESCHEDULED" | "NOTE_ONLY",
            overrideStartTime: override.overrideStartTime,
            overrideEndTime: override.overrideEndTime,
            overrideRoom: override.overrideRoom,
            note: override.note,
          }
        : undefined,
    };

    schedule[cls.dayOfWeek]?.push(scheduled);
  }

  // Sort each day by start time
  for (const day of Object.values(schedule)) {
    day.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return schedule;
});

export const getAllClasses = cache(async () => {
  return db.class.findMany({
    where: { isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
});
