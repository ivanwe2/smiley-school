"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AdminDialog } from "@/components/shared/AdminDialog";
import { cn } from "@/lib/utils";
import {
  cancelLesson,
  deleteLesson,
  restoreLesson,
  rescheduleLesson,
  setLessonNote,
  updateLesson,
} from "@/features/schedule/actions/schedule.actions";
import { dayOfWeekIso } from "@/features/schedule/lib/dates";
import { dayKey, formatDayMonth } from "@/features/schedule/lib/format";
import { teacherColorClasses } from "@/features/schedule/lib/teacher-colors";
import type { Lesson, TeacherInfo, WeekSchedule } from "@/features/schedule/types";
import type { ActionResult } from "@/types";
import { AdminLessonForm } from "./AdminLessonForm";
import { buttonClass, fieldClass, labelClass, useActionErrorText } from "./admin-form";

type Mode = "menu" | "cancel" | "move" | "note" | "edit" | "delete";

type AdminLessonDialogProps = {
  lesson: Lesson;
  week: WeekSchedule;
  teachers: TeacherInfo[];
  onClose: () => void;
};

export function AdminLessonDialog({ lesson, week, teachers, onClose }: AdminLessonDialogProps) {
  const t = useTranslations("adminSchedule");
  const tSchedule = useTranslations("schedule");
  const locale = useLocale();
  const errorText = useActionErrorText();
  const [mode, setMode] = useState<Mode>("menu");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const occurrence = { classId: lesson.classId, date: lesson.originalDate };
  // Where this week's lesson actually is (a "moved" placeholder points elsewhere)
  const current = lesson.movedTo ?? { date: lesson.date, startTime: lesson.startTime, endTime: lesson.endTime };
  const isChanged = lesson.change === "CANCELLED" || lesson.change === "RESCHEDULED";

  const shortDay = (dayOfWeek: number) => tSchedule(`daysShort.${dayKey(dayOfWeek)}`);
  const dayLabel = (iso: string) => `${shortDay(dayOfWeekIso(iso))} ${formatDayMonth(iso, locale)}`;
  const longDayLabel = (iso: string) =>
    `${tSchedule(`days.${dayKey(dayOfWeekIso(iso))}`)} ${formatDayMonth(iso, locale)}`;

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.success) onClose();
      else setError(errorText(result.error));
    });
  }

  function goTo(next: Mode) {
    setError(null);
    setMode(next);
  }

  function submitWith(handler: (form: FormData) => Promise<ActionResult>) {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      run(() => handler(form));
    };
  }

  const text = (form: FormData, key: string) => String(form.get(key) ?? "");
  const teacherColors = teacherColorClasses(lesson.teacher?.color);

  const formButtons = (submitLabel: string, tone: "primary" | "danger" = "primary") => (
    <div className="flex gap-2 pt-1">
      <button type="submit" disabled={pending} className={cn(buttonClass[tone], "flex-1")}>
        {pending ? t("form.saving") : submitLabel}
      </button>
      <button type="button" onClick={() => goTo("menu")} disabled={pending} className={buttonClass.secondary}>
        {t("lesson.back")}
      </button>
    </div>
  );

  return (
    <AdminDialog open onClose={onClose} title={lesson.name}>
      {/* ── Summary ──────────────────────────────────────────────── */}
      <div className="mb-5 space-y-1 rounded-xl bg-[var(--navy-light)] p-3 text-sm">
        <p className="font-semibold text-[var(--navy-deep)]">
          {longDayLabel(current.date)} · {current.startTime}–{current.endTime}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <span aria-hidden className={cn("size-2.5 rounded-full", teacherColors.swatch)} />
          {lesson.teacher?.name ?? t("lesson.noTeacher")}
        </p>
        {lesson.change === "CANCELLED" && (
          <p className="text-xs font-semibold text-red-700">{t("lesson.statusCancelled")}</p>
        )}
        {lesson.change === "RESCHEDULED" && (
          <p className="text-xs font-semibold text-amber-700">
            {t("lesson.statusChanged", {
              day: shortDay(lesson.regular.dayOfWeek),
              start: lesson.regular.startTime,
              end: lesson.regular.endTime,
            })}
          </p>
        )}
        {lesson.note && <p className="text-xs italic text-[var(--text-body)]">{lesson.note}</p>}
      </div>

      {mode === "menu" && (
        <div className="space-y-5">
          {!lesson.isOneOff && (
            <MenuSection title={t("lesson.thisWeek", { date: dayLabel(lesson.originalDate) })}>
              {isChanged && (
                <MenuButton tone="primary" disabled={pending} onClick={() => run(() => restoreLesson(occurrence))}>
                  {t("lesson.restore")}
                </MenuButton>
              )}
              {lesson.change !== "CANCELLED" && (
                <MenuButton tone="danger" disabled={pending} onClick={() => goTo("cancel")}>
                  {t("lesson.cancel")}
                </MenuButton>
              )}
              <MenuButton disabled={pending} onClick={() => goTo("move")}>
                {t("lesson.move")}
              </MenuButton>
              <MenuButton disabled={pending} onClick={() => goTo("note")}>
                {lesson.note ? t("lesson.editNote") : t("lesson.addNote")}
              </MenuButton>
            </MenuSection>
          )}

          <MenuSection
            title={
              lesson.isOneOff
                ? t("lesson.oneOff", { date: dayLabel(lesson.originalDate) })
                : t("lesson.everyWeek", {
                    day: shortDay(lesson.regular.dayOfWeek),
                    start: lesson.regular.startTime,
                    end: lesson.regular.endTime,
                  })
            }
          >
            {lesson.isOneOff && (
              <MenuButton disabled={pending} onClick={() => goTo("note")}>
                {lesson.note ? t("lesson.editNote") : t("lesson.addNote")}
              </MenuButton>
            )}
            <MenuButton disabled={pending} onClick={() => goTo("edit")}>
              {t("lesson.edit")}
            </MenuButton>
            <MenuButton tone="danger" disabled={pending} onClick={() => goTo("delete")}>
              {t("lesson.delete")}
            </MenuButton>
          </MenuSection>
        </div>
      )}

      {mode === "cancel" && (
        <form
          onSubmit={submitWith((form) => cancelLesson({ ...occurrence, note: text(form, "note") }))}
          className="space-y-4"
        >
          <div>
            <label htmlFor="cancel-note" className={labelClass}>
              {t("form.reason")}
            </label>
            <input
              id="cancel-note"
              name="note"
              maxLength={300}
              placeholder={t("form.reasonPlaceholder")}
              className={fieldClass}
            />
          </div>
          {formButtons(t("form.confirmCancel"), "danger")}
        </form>
      )}

      {mode === "move" && (
        <form
          onSubmit={submitWith((form) =>
            rescheduleLesson({
              ...occurrence,
              newDate: text(form, "newDate"),
              startTime: text(form, "startTime"),
              endTime: text(form, "endTime"),
              note: text(form, "note"),
            })
          )}
          className="space-y-4"
        >
          <div>
            <label htmlFor="move-day" className={labelClass}>
              {t("form.newDay")}
            </label>
            <select id="move-day" name="newDate" defaultValue={current.date} className={fieldClass}>
              {week.days.map((day) => (
                <option key={day.date} value={day.date}>
                  {longDayLabel(day.date)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="move-start" className={labelClass}>
                {t("form.start")}
              </label>
              <input
                id="move-start"
                name="startTime"
                type="time"
                required
                defaultValue={current.startTime}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="move-end" className={labelClass}>
                {t("form.end")}
              </label>
              <input
                id="move-end"
                name="endTime"
                type="time"
                required
                defaultValue={current.endTime}
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="move-note" className={labelClass}>
              {t("form.note")}
            </label>
            <input
              id="move-note"
              name="note"
              maxLength={300}
              defaultValue={lesson.change === "RESCHEDULED" ? (lesson.note ?? "") : ""}
              className={fieldClass}
            />
          </div>
          {formButtons(t("form.save"))}
        </form>
      )}

      {mode === "note" && (
        <form
          onSubmit={submitWith((form) => setLessonNote({ ...occurrence, note: text(form, "note") }))}
          className="space-y-4"
        >
          <div>
            <label htmlFor="lesson-note" className={labelClass}>
              {t("form.note")}
            </label>
            <textarea
              id="lesson-note"
              name="note"
              rows={3}
              maxLength={300}
              required
              defaultValue={lesson.note ?? ""}
              placeholder={t("form.notePlaceholder")}
              className={cn(fieldClass, "resize-none")}
            />
          </div>
          {lesson.note && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setLessonNote({ ...occurrence, note: "" }))}
              className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
            >
              {t("form.removeNote")}
            </button>
          )}
          {formButtons(t("form.save"))}
        </form>
      )}

      {mode === "edit" && (
        <AdminLessonForm
          teachers={teachers}
          initial={{
            name: lesson.name,
            teacherId: lesson.teacher?.id ?? null,
            repeat: lesson.isOneOff ? "once" : "weekly",
            dayOfWeek: lesson.regular.dayOfWeek,
            date: lesson.originalDate,
            startTime: lesson.regular.startTime,
            endTime: lesson.regular.endTime,
          }}
          submitLabel={t("form.save")}
          hint={lesson.isOneOff ? undefined : t("form.everyWeekHint")}
          onSubmit={(input) => updateLesson(lesson.classId, input)}
          onDone={onClose}
          onCancel={() => goTo("menu")}
        />
      )}

      {mode === "delete" && (
        <form onSubmit={submitWith(() => deleteLesson(lesson.classId))} className="space-y-4">
          <p className="text-sm text-[var(--text-body)]">
            {lesson.isOneOff ? t("lesson.deleteConfirmOnce") : t("lesson.deleteConfirmWeekly")}
          </p>
          {formButtons(t("lesson.confirmDelete"), "danger")}
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </AdminDialog>
  );
}

function MenuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function MenuButton({
  tone = "default",
  ...props
}: { tone?: "default" | "primary" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors disabled:opacity-60",
        tone === "primary" && "bg-[var(--navy-deep)] text-white hover:bg-[var(--navy-mid)]",
        tone === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
        tone === "default" && "border border-[var(--border)] text-[var(--navy-deep)] hover:bg-[var(--navy-light)]"
      )}
    />
  );
}
