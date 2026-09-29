/**
 * Colours a teacher can be given. Lessons on the timetable are tinted with
 * their teacher's colour, like the printed weekly schedule.
 *
 * Class names are written out in full so Tailwind can find them.
 */
type TeacherColorClasses = {
  /** lesson cell background + border */
  cell: string;
  /** lesson time text */
  time: string;
  /** lesson name text */
  name: string;
  /** solid dot used in the legend and colour picker */
  swatch: string;
};

export const TEACHER_COLORS = {
  green: {
    cell: "bg-green-100 border-green-200",
    time: "text-green-800",
    name: "text-green-900",
    swatch: "bg-green-600",
  },
  blue: {
    cell: "bg-blue-100 border-blue-200",
    time: "text-blue-800",
    name: "text-blue-900",
    swatch: "bg-blue-600",
  },
  red: {
    cell: "bg-red-100 border-red-200",
    time: "text-red-700",
    name: "text-red-900",
    swatch: "bg-red-600",
  },
  purple: {
    cell: "bg-violet-100 border-violet-200",
    time: "text-violet-800",
    name: "text-violet-900",
    swatch: "bg-violet-600",
  },
  amber: {
    cell: "bg-amber-100 border-amber-200",
    time: "text-amber-800",
    name: "text-amber-900",
    swatch: "bg-amber-500",
  },
  teal: {
    cell: "bg-teal-100 border-teal-200",
    time: "text-teal-800",
    name: "text-teal-900",
    swatch: "bg-teal-600",
  },
} as const satisfies Record<string, TeacherColorClasses>;

export type TeacherColor = keyof typeof TEACHER_COLORS;

export const TEACHER_COLOR_KEYS = Object.keys(TEACHER_COLORS) as TeacherColor[];

/** Used for lessons without a teacher. */
const UNASSIGNED: TeacherColorClasses = {
  cell: "bg-slate-50 border-slate-200",
  time: "text-slate-700",
  name: "text-slate-800",
  swatch: "bg-slate-400",
};

export function isTeacherColor(value: string): value is TeacherColor {
  return value in TEACHER_COLORS;
}

export function teacherColorClasses(color: string | null | undefined): TeacherColorClasses {
  return color && isTeacherColor(color) ? TEACHER_COLORS[color] : UNASSIGNED;
}
