export type TeacherInfo = {
  id: string;
  name: string;
  color: string;
};

export type LessonChangeType = "CANCELLED" | "RESCHEDULED" | "NOTE_ONLY";

/**
 * - normal:    runs as usual (may still carry a note)
 * - cancelled: does not take place this week
 * - changed:   takes place at a different time and/or day this week
 * - moved:     placeholder left on the original day of a lesson moved to another day
 */
export type LessonStatus = "normal" | "cancelled" | "changed" | "moved";

/** One occurrence of a lesson in a given week, ready to render. */
export type Lesson = {
  /** unique per rendered cell */
  key: string;
  classId: string;
  name: string;
  teacher: TeacherInfo | null;
  /** date the cell is shown on */
  date: string;
  /** the occurrence's original date — what per-week changes are keyed on */
  originalDate: string;
  startTime: string;
  endTime: string;
  status: LessonStatus;
  /** shown to students (not on "moved" placeholders — the moved lesson shows it) */
  note: string | null;
  /** only on this date, not every week */
  isOneOff: boolean;
  /** "changed" lesson moved here from another day of the week */
  movedFrom: string | null;
  /** "moved" placeholder: where the lesson went */
  movedTo: { date: string; startTime: string; endTime: string } | null;
  /** the lesson's usual slot, before this week's change */
  regular: { dayOfWeek: number; startTime: string; endTime: string };
  /** this week's change, if any */
  change: LessonChangeType | null;
};

export type ScheduleDay = {
  date: string;
  /** 1 = Monday … 6 = Saturday */
  dayOfWeek: number;
  lessons: Lesson[];
};

export type WeekSchedule = {
  /** Monday, "YYYY-MM-DD" */
  weekStart: string;
  days: ScheduleDay[];
};
