"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SCHOOL_DAYS } from "@/features/schedule/lib/dates";
import { dayKey } from "@/features/schedule/lib/format";
import type { TeacherInfo } from "@/features/schedule/types";
import type { LessonInput } from "@/lib/validations/schedule.schema";
import type { ActionResult } from "@/types";
import { buttonClass, fieldClass, labelClass, useActionErrorText } from "./admin-form";

export type LessonFormValues = {
  name: string;
  teacherId: string | null;
  repeat: "weekly" | "once";
  dayOfWeek: number;
  /** used when repeat is "once" */
  date: string;
  startTime: string;
  endTime: string;
};

type AdminLessonFormProps = {
  teachers: TeacherInfo[];
  initial: LessonFormValues;
  submitLabel: string;
  onSubmit: (input: LessonInput) => Promise<ActionResult<unknown>>;
  onDone: () => void;
  onCancel: () => void;
  /** shown above the buttons */
  hint?: string;
};

export function AdminLessonForm({
  teachers,
  initial,
  submitLabel,
  onSubmit,
  onDone,
  onCancel,
  hint,
}: AdminLessonFormProps) {
  const t = useTranslations("adminSchedule.form");
  const tDays = useTranslations("schedule.days");
  const errorText = useActionErrorText();
  const [repeat, setRepeat] = useState(initial.repeat);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");
    const input: LessonInput = {
      name: text("name"),
      teacherId: text("teacherId") || null,
      repeat,
      dayOfWeek: Number(form.get("dayOfWeek") ?? initial.dayOfWeek),
      date: repeat === "once" ? text("date") || null : null,
      startTime: text("startTime"),
      endTime: text("endTime"),
    };

    setError(null);
    startTransition(async () => {
      const result = await onSubmit(input);
      if (result.success) onDone();
      else setError(errorText(result.error));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="lesson-name" className={labelClass}>
          {t("name")} *
        </label>
        <input
          id="lesson-name"
          name="name"
          required
          maxLength={80}
          defaultValue={initial.name}
          placeholder={t("namePlaceholder")}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="lesson-teacher" className={labelClass}>
          {t("teacher")}
          {teachers.length > 0 && " *"}
        </label>
        <select
          id="lesson-teacher"
          name="teacherId"
          required={teachers.length > 0}
          defaultValue={initial.teacherId ?? ""}
          className={fieldClass}
        >
          <option value="">{teachers.length > 0 ? t("chooseTeacher") : t("noTeacher")}</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={labelClass}>{t("repeat")}</legend>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--navy-light)] p-1">
          {(["weekly", "once"] as const).map((option) => (
            <label
              key={option}
              className={cn(
                "cursor-pointer rounded-lg py-2 text-center text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--yellow-primary)]",
                repeat === option ? "bg-white text-[var(--navy-deep)] shadow-sm" : "text-[var(--text-muted)]"
              )}
            >
              <input
                type="radio"
                name="repeat"
                value={option}
                checked={repeat === option}
                onChange={() => setRepeat(option)}
                className="sr-only"
              />
              {t(option)}
            </label>
          ))}
        </div>
      </fieldset>

      {repeat === "weekly" ? (
        <div>
          <label htmlFor="lesson-day" className={labelClass}>
            {t("day")} *
          </label>
          <select id="lesson-day" name="dayOfWeek" defaultValue={String(initial.dayOfWeek)} className={fieldClass}>
            {SCHOOL_DAYS.map((day) => (
              <option key={day} value={day}>
                {tDays(dayKey(day))}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor="lesson-date" className={labelClass}>
            {t("date")} *
          </label>
          <input
            id="lesson-date"
            name="date"
            type="date"
            required
            defaultValue={initial.date}
            className={fieldClass}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="lesson-start" className={labelClass}>
            {t("start")} *
          </label>
          <input
            id="lesson-start"
            name="startTime"
            type="time"
            required
            defaultValue={initial.startTime}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="lesson-end" className={labelClass}>
            {t("end")} *
          </label>
          <input
            id="lesson-end"
            name="endTime"
            type="time"
            required
            defaultValue={initial.endTime}
            className={fieldClass}
          />
        </div>
      </div>

      {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending} className={cn(buttonClass.primary, "flex-1")}>
          {pending ? t("saving") : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={pending} className={buttonClass.secondary}>
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
