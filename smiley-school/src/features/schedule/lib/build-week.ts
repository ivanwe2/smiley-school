import { SCHOOL_DAYS, dateInWeek, dateToIso } from "./dates";
import type { Lesson, LessonChangeType, ScheduleDay, TeacherInfo, WeekSchedule } from "../types";

export type ClassRow = {
  id: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  /** set for one-time lessons */
  date: Date | null;
  teacher: TeacherInfo | null;
  overrides: {
    date: Date;
    type: LessonChangeType;
    newDate: Date | null;
    overrideStartTime: string | null;
    overrideEndTime: string | null;
    note: string | null;
  }[];
};

/**
 * Lays out one week (Monday–Saturday) of the timetable: every weekly lesson
 * on its day, plus one-time lessons dated in that week, with the week's
 * cancellations, time/day changes and notes applied.
 */
export function buildWeekSchedule(weekStart: string, classes: ClassRow[]): WeekSchedule {
  const days: ScheduleDay[] = SCHOOL_DAYS.map((dayOfWeek) => ({
    date: dateInWeek(weekStart, dayOfWeek),
    dayOfWeek,
    lessons: [],
  }));
  const dayByDate = new Map(days.map((day) => [day.date, day]));

  for (const cls of classes) {
    const originalDate = cls.date ? dateToIso(cls.date) : dateInWeek(weekStart, cls.dayOfWeek);
    const day = dayByDate.get(originalDate);
    if (!day) continue; // one-time lesson in another week, or a Sunday

    const override = cls.overrides.find((o) => dateToIso(o.date) === originalDate);
    const lesson: Lesson = {
      key: `${cls.id}:${originalDate}`,
      classId: cls.id,
      name: cls.name,
      teacher: cls.teacher,
      date: originalDate,
      originalDate,
      startTime: cls.startTime,
      endTime: cls.endTime,
      status: "normal",
      note: override?.note || null,
      isOneOff: cls.date !== null,
      movedFrom: null,
      movedTo: null,
      regular: { dayOfWeek: cls.dayOfWeek, startTime: cls.startTime, endTime: cls.endTime },
      change: override?.type ?? null,
    };

    if (override?.type === "CANCELLED") {
      day.lessons.push({ ...lesson, status: "cancelled" });
    } else if (override?.type === "RESCHEDULED") {
      const changed: Lesson = {
        ...lesson,
        status: "changed",
        startTime: override.overrideStartTime || cls.startTime,
        endTime: override.overrideEndTime || cls.endTime,
      };
      // Moves are limited to the same week; anything else stays put
      const target = (override.newDate && dayByDate.get(dateToIso(override.newDate))) || day;
      if (target === day) {
        day.lessons.push(changed);
      } else {
        day.lessons.push({
          ...lesson,
          key: `${lesson.key}:moved`,
          status: "moved",
          movedTo: { date: target.date, startTime: changed.startTime, endTime: changed.endTime },
        });
        target.lessons.push({ ...changed, date: target.date, movedFrom: originalDate });
      }
    } else {
      day.lessons.push(lesson);
    }
  }

  for (const day of days) {
    day.lessons.sort(
      (a, b) =>
        a.startTime.localeCompare(b.startTime) ||
        a.endTime.localeCompare(b.endTime) ||
        a.name.localeCompare(b.name, "bg")
    );
  }

  return { weekStart, days };
}
