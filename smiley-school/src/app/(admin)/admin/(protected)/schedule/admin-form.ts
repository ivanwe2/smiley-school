"use client";

import { useTranslations } from "next-intl";

export const fieldClass =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white";

export const labelClass = "block text-xs font-medium text-[var(--text-body)] mb-1";

export const buttonClass = {
  primary:
    "px-4 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors disabled:opacity-60",
  danger:
    "px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60",
  secondary:
    "px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--navy-light)] transition-colors disabled:opacity-60",
} as const;

/** Turns an error key returned by a schedule action into a message. */
export function useActionErrorText() {
  const t = useTranslations("adminSchedule.errors");
  return (code: string) => (t.has(code) ? t(code) : t("invalid"));
}
