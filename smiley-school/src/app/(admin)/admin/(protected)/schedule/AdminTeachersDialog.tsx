"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminDialog } from "@/components/shared/AdminDialog";
import { cn } from "@/lib/utils";
import { createTeacher, deleteTeacher, updateTeacher } from "@/features/schedule/actions/schedule.actions";
import { TEACHER_COLOR_KEYS, isTeacherColor, teacherColorClasses, type TeacherColor } from "@/features/schedule/lib/teacher-colors";
import type { TeacherInfo } from "@/features/schedule/types";
import type { TeacherInput } from "@/lib/validations/schedule.schema";
import type { ActionResult } from "@/types";
import { buttonClass, fieldClass, labelClass, useActionErrorText } from "./admin-form";

type AdminTeachersDialogProps = {
  teachers: TeacherInfo[];
  onClose: () => void;
};

export function AdminTeachersDialog({ teachers, onClose }: AdminTeachersDialogProps) {
  const t = useTranslations("adminSchedule.teachersDialog");
  const tForm = useTranslations("adminSchedule.form");
  const errorText = useActionErrorText();
  /** teacher being edited, "new" for the add form */
  const [editing, setEditing] = useState<string | null>(teachers.length === 0 ? "new" : null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const unusedColor = TEACHER_COLOR_KEYS.find((key) => !teachers.some((teacher) => teacher.color === key));

  function run(action: () => Promise<ActionResult>, after: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.success) after();
      else setError(errorText(result.error));
    });
  }

  function open(next: { editing?: string | null; deleting?: string | null }) {
    setError(null);
    setEditing(next.editing ?? null);
    setDeleting(next.deleting ?? null);
  }

  return (
    <AdminDialog open onClose={onClose} title={t("title")}>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{t("hint")}</p>

      {teachers.length === 0 && editing !== "new" && (
        <p className="mb-4 text-sm text-[var(--text-muted)]">{t("empty")}</p>
      )}

      <ul className="space-y-2">
        {teachers.map((teacher) => (
          <li key={teacher.id} className="rounded-xl border border-[var(--border)] p-3">
            {editing === teacher.id ? (
              <TeacherForm
                initial={{ name: teacher.name, color: isTeacherColor(teacher.color) ? teacher.color : "green" }}
                pending={pending}
                submitLabel={tForm("save")}
                onSubmit={(input) => run(() => updateTeacher(teacher.id, input), () => open({}))}
                onCancel={() => open({})}
              />
            ) : deleting === teacher.id ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-body)]">{t("deleteConfirm", { name: teacher.name })}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteTeacher(teacher.id), () => open({}))}
                    className={cn(buttonClass.danger, "flex-1")}
                  >
                    {pending ? tForm("saving") : t("delete")}
                  </button>
                  <button type="button" onClick={() => open({})} className={buttonClass.secondary}>
                    {tForm("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span aria-hidden className={cn("size-4 shrink-0 rounded-full", teacherColorClasses(teacher.color).swatch)} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--navy-deep)]">
                  {teacher.name}
                </span>
                <button
                  type="button"
                  onClick={() => open({ editing: teacher.id })}
                  aria-label={`${t("edit")}: ${teacher.name}`}
                  className="rounded-lg p-2 text-[var(--navy-mid)] hover:bg-[var(--navy-light)]"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => open({ deleting: teacher.id })}
                  aria-label={`${t("delete")}: ${teacher.name}`}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {editing === "new" ? (
          <div className="rounded-xl border border-dashed border-[var(--navy-mid)] p-3">
            <TeacherForm
              initial={{ name: "", color: unusedColor ?? "green" }}
              pending={pending}
              submitLabel={t("add")}
              onSubmit={(input) => run(() => createTeacher(input), () => open({}))}
              onCancel={() => open({})}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => open({ editing: "new" })}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] py-2.5 text-sm font-semibold text-[var(--navy-mid)] hover:border-[var(--navy-mid)] hover:bg-[var(--navy-light)]"
          >
            <Plus size={16} aria-hidden />
            {t("add")}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </AdminDialog>
  );
}

type TeacherFormProps = {
  initial: { name: string; color: TeacherColor };
  pending: boolean;
  submitLabel: string;
  onSubmit: (input: TeacherInput) => void;
  onCancel: () => void;
};

function TeacherForm({ initial, pending, submitLabel, onSubmit, onCancel }: TeacherFormProps) {
  const t = useTranslations("adminSchedule.teachersDialog");
  const tForm = useTranslations("adminSchedule.form");
  const tColors = useTranslations("adminSchedule.colors");
  const [color, setColor] = useState<TeacherColor>(initial.color);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ name: String(new FormData(e.currentTarget).get("name") ?? ""), color });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="teacher-name" className={labelClass}>
          {t("name")}
        </label>
        <input
          id="teacher-name"
          name="name"
          required
          maxLength={60}
          defaultValue={initial.name}
          placeholder="Mrs Ruseva"
          className={fieldClass}
        />
      </div>
      <fieldset>
        <legend className={labelClass}>{t("color")}</legend>
        <div className="flex flex-wrap gap-2.5 p-1">
          {TEACHER_COLOR_KEYS.map((key) => (
            <label
              key={key}
              title={tColors(key)}
              className={cn(
                "size-8 cursor-pointer rounded-full ring-offset-2 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--yellow-primary)]",
                teacherColorClasses(key).swatch,
                color === key && "ring-2 ring-[var(--navy-deep)]"
              )}
            >
              <input
                type="radio"
                name="color"
                value={key}
                checked={color === key}
                onChange={() => setColor(key)}
                className="sr-only"
              />
              <span className="sr-only">{tColors(key)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={cn(buttonClass.primary, "flex-1")}>
          {pending ? tForm("saving") : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={pending} className={buttonClass.secondary}>
          {tForm("cancel")}
        </button>
      </div>
    </form>
  );
}
