import { isoToDate } from "./dates";

/** Message keys under `schedule.days` / `schedule.daysShort`. */
const DAY_KEYS = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
} as const;

export type DayKey = (typeof DAY_KEYS)[keyof typeof DAY_KEYS];

export function dayKey(dayOfWeek: number): DayKey {
  return DAY_KEYS[dayOfWeek as keyof typeof DAY_KEYS] ?? "monday";
}

function intlLocale(locale: string) {
  return locale === "bg" ? "bg-BG" : "en-GB";
}

/** "28.09" (bg) / "28 Sept" (en) */
export function formatDayMonth(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: locale === "bg" ? "2-digit" : "numeric",
    month: locale === "bg" ? "2-digit" : "short",
    timeZone: "UTC",
  }).format(isoToDate(iso));
}

/** "28.09 – 3.10.2026 г." (bg) / "28 Sept – 3 Oct 2026" (en) */
export function formatDateRange(from: string, to: string, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatRange(isoToDate(from), isoToDate(to));
}
