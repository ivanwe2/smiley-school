"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  cancelLessonSchema,
  lessonNoteSchema,
  lessonOccurrenceSchema,
  lessonSchema,
  rescheduleLessonSchema,
  teacherSchema,
  type CancelLessonInput,
  type LessonInput,
  type LessonNoteInput,
  type LessonOccurrenceInput,
  type RescheduleLessonInput,
  type TeacherInput,
} from "@/lib/validations/schedule.schema";
import { dateToIso, dayOfWeekIso, isoToDate } from "../lib/dates";
import type { ActionResult } from "@/types";

// Error strings are keys under `adminSchedule.errors` in messages/*.json

function revalidateSchedule() {
  revalidatePath("/schedule");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin");
}

function invalid(error: z.ZodError): { success: false; error: string } {
  return { success: false, error: error.issues[0]?.message ?? "invalid" };
}

function failed(e: unknown): { success: false; error: string } {
  console.error(e);
  return { success: false, error: "saveFailed" };
}

const ok = { success: true, data: undefined } as const;

function toClassData(input: LessonInput) {
  const once = input.repeat === "once" && input.date !== null;
  return {
    name: input.name,
    teacherId: input.teacherId,
    dayOfWeek: once && input.date ? dayOfWeekIso(input.date) : input.dayOfWeek,
    date: once && input.date ? isoToDate(input.date) : null,
    startTime: input.startTime,
    endTime: input.endTime,
  };
}

/** The lesson, if it really takes place on `date` (its original slot). */
async function findOccurrence(classId: string, date: string) {
  const cls = await db.class.findUnique({
    where: { id: classId },
    select: { dayOfWeek: true, date: true, startTime: true, endTime: true },
  });
  if (!cls) return null;
  const takesPlace = cls.date ? dateToIso(cls.date) === date : cls.dayOfWeek === dayOfWeekIso(date);
  return takesPlace ? cls : null;
}

// ─── Lessons (every week / one-time) ─────────────────────────────────────────

export async function createLesson(input: LessonInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  try {
    const cls = await db.class.create({ data: toClassData(parsed.data), select: { id: true } });
    revalidateSchedule();
    return { success: true, data: { id: cls.id } };
  } catch (e) {
    return failed(e);
  }
}

export async function updateLesson(id: string, input: LessonInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  try {
    const existing = await db.class.findUnique({ where: { id }, select: { dayOfWeek: true, date: true } });
    if (!existing) return { success: false, error: "lessonNotFound" };

    const data = toClassData(parsed.data);
    // Per-week changes are tied to the old dates; drop them if the lesson moves
    const slotChanged =
      existing.dayOfWeek !== data.dayOfWeek ||
      (existing.date && dateToIso(existing.date)) !== (data.date && dateToIso(data.date));

    await db.$transaction([
      ...(slotChanged ? [db.classOverride.deleteMany({ where: { classId: id } })] : []),
      db.class.update({ where: { id }, data }),
    ]);
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.class.deleteMany({ where: { id } });
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}

// ─── This week only ──────────────────────────────────────────────────────────

export async function cancelLesson(input: CancelLessonInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = cancelLessonSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { classId, date, note } = parsed.data;

  try {
    if (!(await findOccurrence(classId, date))) return { success: false, error: "notOccurrence" };

    const change = {
      type: "CANCELLED" as const,
      note: note || null,
      newDate: null,
      overrideStartTime: null,
      overrideEndTime: null,
    };
    await db.classOverride.upsert({
      where: { classId_date: { classId, date: isoToDate(date) } },
      create: { classId, date: isoToDate(date), ...change },
      update: change,
    });
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}

export async function rescheduleLesson(input: RescheduleLessonInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = rescheduleLessonSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { classId, date, newDate, startTime, endTime, note } = parsed.data;

  try {
    const cls = await findOccurrence(classId, date);
    if (!cls) return { success: false, error: "notOccurrence" };

    const where = { classId_date: { classId, date: isoToDate(date) } };
    const backToUsual = newDate === date && startTime === cls.startTime && endTime === cls.endTime;

    if (backToUsual) {
      // Nothing left to change — keep only the note, if there is one
      if (note) {
        const change = { type: "NOTE_ONLY" as const, note, newDate: null, overrideStartTime: null, overrideEndTime: null };
        await db.classOverride.upsert({ where, create: { classId, date: isoToDate(date), ...change }, update: change });
      } else {
        await db.classOverride.deleteMany({ where: { classId, date: isoToDate(date) } });
      }
    } else {
      const change = {
        type: "RESCHEDULED" as const,
        note: note || null,
        newDate: newDate === date ? null : isoToDate(newDate),
        overrideStartTime: startTime,
        overrideEndTime: endTime,
      };
      await db.classOverride.upsert({ where, create: { classId, date: isoToDate(date), ...change }, update: change });
    }
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}

export async function setLessonNote(input: LessonNoteInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = lessonNoteSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { classId, date, note } = parsed.data;

  try {
    if (!(await findOccurrence(classId, date))) return { success: false, error: "notOccurrence" };

    const day = isoToDate(date);
    if (note) {
      await db.classOverride.upsert({
        where: { classId_date: { classId, date: day } },
        create: { classId, date: day, type: "NOTE_ONLY", note },
        update: { note },
      });
    } else {
      // Removing the note: a note-only change disappears, others just lose the note
      await db.$transaction([
        db.classOverride.deleteMany({ where: { classId, date: day, type: "NOTE_ONLY" } }),
        db.classOverride.updateMany({ where: { classId, date: day }, data: { note: null } }),
      ]);
    }
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}

/** Undo this week's change: the lesson runs as usual again. */
export async function restoreLesson(input: LessonOccurrenceInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = lessonOccurrenceSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  try {
    await db.classOverride.deleteMany({
      where: { classId: parsed.data.classId, date: isoToDate(parsed.data.date) },
    });
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}

// ─── Teachers ────────────────────────────────────────────────────────────────

export async function createTeacher(input: TeacherInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = teacherSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  try {
    const last = await db.teacher.aggregate({ _max: { order: true } });
    await db.teacher.create({ data: { ...parsed.data, order: (last._max.order ?? -1) + 1 } });
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}

export async function updateTeacher(id: string, input: TeacherInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = teacherSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  try {
    await db.teacher.update({ where: { id }, data: parsed.data });
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}

/** Lessons of a deleted teacher stay on the timetable, without a teacher. */
export async function deleteTeacher(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.teacher.deleteMany({ where: { id } });
    revalidateSchedule();
    return ok;
  } catch (e) {
    return failed(e);
  }
}
