import { z } from "zod";
import { dayOfWeekIso, isIsoDate, timeToMinutes, weekStartIso } from "@/features/schedule/lib/dates";
import { TEACHER_COLOR_KEYS } from "@/features/schedule/lib/teacher-colors";

// Messages are keys under `adminSchedule.errors` in messages/*.json

const time = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "invalidTime");
const isoDate = z.string().refine(isIsoDate, "invalidDate");
const id = z.string().min(1).max(50);
const note = z.string().trim().max(300);

function endsAfterStart(value: { startTime: string; endTime: string }) {
  return timeToMinutes(value.endTime) > timeToMinutes(value.startTime);
}

export const lessonSchema = z
  .object({
    name: z.string().trim().min(1, "nameRequired").max(80),
    teacherId: id.nullable(),
    /** weekly: every week on dayOfWeek; once: only on date */
    repeat: z.enum(["weekly", "once"]),
    dayOfWeek: z.number().int().min(1).max(6),
    date: isoDate.nullable(),
    startTime: time,
    endTime: time,
  })
  .refine(endsAfterStart, { message: "endBeforeStart", path: ["endTime"] })
  .refine((v) => v.repeat === "weekly" || v.date !== null, { message: "invalidDate", path: ["date"] })
  .refine((v) => v.repeat === "weekly" || (v.date !== null && dayOfWeekIso(v.date) !== 0), {
    message: "sunday",
    path: ["date"],
  });

/** One occurrence of a lesson: the lesson and its (original) date. */
export const lessonOccurrenceSchema = z.object({
  classId: id,
  date: isoDate,
});

export const cancelLessonSchema = lessonOccurrenceSchema.extend({ note });

export const lessonNoteSchema = lessonOccurrenceSchema.extend({ note });

export const rescheduleLessonSchema = lessonOccurrenceSchema
  .extend({
    newDate: isoDate,
    startTime: time,
    endTime: time,
    note,
  })
  .refine(endsAfterStart, { message: "endBeforeStart", path: ["endTime"] })
  .refine((v) => dayOfWeekIso(v.newDate) !== 0, { message: "sunday", path: ["newDate"] })
  .refine((v) => weekStartIso(v.newDate) === weekStartIso(v.date), {
    message: "outsideWeek",
    path: ["newDate"],
  });

export const teacherSchema = z.object({
  name: z.string().trim().min(1, "teacherNameRequired").max(60),
  color: z.enum(TEACHER_COLOR_KEYS),
});

export type LessonInput = z.infer<typeof lessonSchema>;
export type LessonOccurrenceInput = z.infer<typeof lessonOccurrenceSchema>;
export type CancelLessonInput = z.infer<typeof cancelLessonSchema>;
export type LessonNoteInput = z.infer<typeof lessonNoteSchema>;
export type RescheduleLessonInput = z.infer<typeof rescheduleLessonSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
