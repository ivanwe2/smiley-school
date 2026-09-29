import { cache } from "react";
import { db } from "@/lib/db";
import { addDaysIso, isoToDate } from "../lib/dates";
import { buildWeekSchedule } from "../lib/build-week";
import type { TeacherInfo, WeekSchedule } from "../types";

/**
 * The timetable for the week starting on Monday `weekStart` ("YYYY-MM-DD"),
 * with that week's cancellations, changes and notes applied.
 */
export const getWeekSchedule = cache(async (weekStart: string): Promise<WeekSchedule> => {
  const from = isoToDate(weekStart);
  const to = isoToDate(addDaysIso(weekStart, 6));

  const classes = await db.class.findMany({
    where: { OR: [{ date: null }, { date: { gte: from, lte: to } }] },
    select: {
      id: true,
      name: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      date: true,
      teacher: { select: { id: true, name: true, color: true } },
      overrides: {
        where: { date: { gte: from, lte: to } },
        select: {
          date: true,
          type: true,
          newDate: true,
          overrideStartTime: true,
          overrideEndTime: true,
          note: true,
        },
      },
    },
  });

  return buildWeekSchedule(weekStart, classes);
});

export const getTeachers = cache(async (): Promise<TeacherInfo[]> => {
  return db.teacher.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, color: true },
  });
});
