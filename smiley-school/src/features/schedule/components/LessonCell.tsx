import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { dayOfWeekIso } from "../lib/dates";
import { dayKey } from "../lib/format";
import { teacherColorClasses } from "../lib/teacher-colors";
import type { Lesson } from "../types";

type LessonCellProps = {
  lesson: Lesson;
  /** column: compact, centred (desktop grid) · row: time beside name (phone list) */
  variant: "column" | "row";
};

const TAG_TONES = {
  cancelled: "text-red-700",
  changed: "text-amber-700",
  moved: "text-slate-600",
  extra: "text-[var(--navy-mid)]",
} as const;

export function LessonCell({ lesson, variant }: LessonCellProps) {
  const t = useTranslations("schedule");
  const colors = teacherColorClasses(lesson.teacher?.color);
  const isCancelled = lesson.status === "cancelled";
  const isMoved = lesson.status === "moved";
  const shortDay = (iso: string) => t(`daysShort.${dayKey(dayOfWeekIso(iso))}`);

  const tag = isCancelled
    ? { tone: TAG_TONES.cancelled, text: t("cancelled") }
    : isMoved
      ? { tone: TAG_TONES.moved, text: t("moved") }
      : lesson.status === "changed"
        ? {
            tone: TAG_TONES.changed,
            text: lesson.movedFrom ? t("movedFrom", { day: shortDay(lesson.movedFrom) }) : t("changed"),
          }
        : lesson.isOneOff
          ? { tone: TAG_TONES.extra, text: t("extra") }
          : null;

  const details = (
    <>
      {tag && (
        <span
          className={cn(
            "mt-1 inline-block rounded-full bg-white/80 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide",
            tag.tone
          )}
        >
          {tag.text}
        </span>
      )}
      {isMoved && lesson.movedTo && (
        <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
          {t("movedTo", { day: shortDay(lesson.movedTo.date), time: lesson.movedTo.startTime })}
        </p>
      )}
      {lesson.note && !isMoved && (
        <p className="mt-1 text-[11px] italic leading-snug text-[var(--text-body)]">{lesson.note}</p>
      )}
    </>
  );

  const time = (
    <span className={cn("font-bold tabular-nums", colors.time, (isCancelled || isMoved) && "line-through")}>
      {lesson.startTime}–{lesson.endTime}
    </span>
  );

  const name = (
    <span className={cn(colors.name, (isCancelled || isMoved) && "line-through")}>{lesson.name}</span>
  );

  if (variant === "row") {
    return (
      <div
        className={cn(
          "flex gap-3 rounded-xl border px-3 py-2.5 text-left",
          colors.cell,
          (isCancelled || isMoved) && "opacity-75",
          isMoved && "border-dashed"
        )}
      >
        <p className="min-w-[6.5rem] shrink-0 whitespace-nowrap text-sm">{time}</p>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{name}</p>
          {lesson.teacher && <p className="text-xs text-[var(--text-muted)]">{lesson.teacher.name}</p>}
          {details}
        </div>
      </div>
    );
  }

  return (
    <div
      title={lesson.teacher?.name}
      className={cn(
        "rounded-lg border px-2 py-1.5 text-center",
        colors.cell,
        (isCancelled || isMoved) && "opacity-75",
        isMoved && "border-dashed"
      )}
    >
      <p className="text-[13px] leading-tight">{time}</p>
      <p className="text-xs leading-snug">{name}</p>
      {lesson.teacher && <span className="sr-only">{lesson.teacher.name}</span>}
      {details}
    </div>
  );
}
