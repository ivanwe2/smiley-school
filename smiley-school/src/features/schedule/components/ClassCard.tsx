import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import type { ScheduledClass } from "../types";

export async function ClassCard({ cls }: { cls: ScheduledClass }) {
  const t = await getTranslations("schedule");
  const isCancelled = cls.status === "cancelled";
  const isRescheduled = cls.status === "rescheduled";
  const hasNote = cls.status === "note";
  const accentColor = cls.color ?? "#0F1F3D";

  return (
    <div
      className={cn(
        "relative rounded-xl border p-3.5 sm:p-4 transition-all",
        isCancelled
          ? "bg-red-50 border-red-200 opacity-75"
          : "bg-white border-[var(--border)] shadow-sm hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: isCancelled ? "#ef4444" : accentColor }}
      />

      <div className="pl-3">
        {/* Status badges */}
        {isCancelled && (
          <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5">
            {t("cancelled")}
          </span>
        )}
        {isRescheduled && (
          <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5">
            {t("rescheduled")}
          </span>
        )}
        {hasNote && cls.override?.note && (
          <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5">
            {t("notice")}
          </span>
        )}

        {/* Class name */}
        <h3 className={cn(
          "font-semibold text-sm text-[var(--navy-deep)] leading-snug",
          isCancelled && "line-through text-[var(--text-muted)]"
        )}>
          {cls.name}
        </h3>

        {/* Level badge */}
        {cls.level && (
          <span
            className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: accentColor }}
          >
            {cls.level}
          </span>
        )}

        {/* Meta */}
        <div className="mt-2 space-y-0.5">
          <p className="text-xs text-[var(--text-muted)] font-mono">
            {cls.startTime} – {cls.endTime}
          </p>
          {cls.teacher && (
            <p className="text-xs text-[var(--text-muted)]">👤 {cls.teacher}</p>
          )}
          {cls.room && (
            <p className="text-xs text-[var(--text-muted)]">📍 {cls.room}</p>
          )}
        </div>

        {/* Override note */}
        {cls.override?.note && (
          <p className="mt-2 text-xs text-[var(--navy-mid)] bg-[var(--navy-light)] rounded-lg px-2.5 py-1.5 italic">
            {cls.override.note}
          </p>
        )}
      </div>
    </div>
  );
}
