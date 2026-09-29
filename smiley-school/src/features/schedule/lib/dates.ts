/**
 * Calendar-date helpers for the timetable.
 *
 * Dates are "YYYY-MM-DD" strings (ISO dates) so they mean the same thing on
 * the server, in the browser and in Postgres `DATE` columns, whatever the
 * machine's time zone. "Today" is always taken in the school's time zone.
 */

export const SCHOOL_TIME_ZONE = "Europe/Sofia";

/** Days shown on the timetable: Monday (1) … Saturday (6). */
export const SCHOOL_DAYS = [1, 2, 3, 4, 5, 6] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" of the given instant in the school's time zone. */
export function todayIso(now: Date = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** True for a well-formed, real calendar date ("2026-02-30" is rejected). */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** UTC-midnight Date for an ISO date — the form Prisma uses for `@db.Date`. */
export function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

/** ISO date of a Date read from a `@db.Date` column (UTC midnight). */
export function dateToIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
  return dateToIso(new Date(isoToDate(iso).getTime() + days * DAY_MS));
}

/** 0 = Sunday … 6 = Saturday */
export function dayOfWeekIso(iso: string): number {
  return isoToDate(iso).getUTCDay();
}

/** Monday of the week containing `iso`. */
export function weekStartIso(iso: string): string {
  const day = dayOfWeekIso(iso);
  return addDaysIso(iso, day === 0 ? -6 : 1 - day);
}

/** Date of `dayOfWeek` (0–6) in the week that starts on Monday `weekStart`. */
export function dateInWeek(weekStart: string, dayOfWeek: number): string {
  return addDaysIso(weekStart, dayOfWeek === 0 ? 6 : dayOfWeek - 1);
}

/** Monday of the week to show for a `?week=` param; falls back to this week. */
export function resolveWeekStart(param: string | undefined, now: Date = new Date()): string {
  return weekStartIso(param && isIsoDate(param) ? param : todayIso(now));
}

/** "HH:MM" → minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
