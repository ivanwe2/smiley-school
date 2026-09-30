"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminDialog } from "@/components/shared/AdminDialog";
import { createLesson } from "@/features/schedule/actions/schedule.actions";
import { ScheduleBoard } from "@/features/schedule/components/ScheduleBoard";
import { TeacherLegend } from "@/features/schedule/components/TeacherLegend";
import type { Lesson, ScheduleDay, TeacherInfo, WeekSchedule } from "@/features/schedule/types";
import { AdminLessonDialog } from "./AdminLessonDialog";
import { AdminLessonForm } from "./AdminLessonForm";
import { AdminTeachersDialog } from "./AdminTeachersDialog";

type AdminScheduleEditorProps = {
  week: WeekSchedule;
  today: string;
  teachers: TeacherInfo[];
};

/** The week's timetable, where every lesson and day can be edited. */
export function AdminScheduleEditor({ week, today, teachers }: AdminScheduleEditorProps) {
  const t = useTranslations("adminSchedule");
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [adding, setAdding] = useState<ScheduleDay | null>(null);
  const [teachersOpen, setTeachersOpen] = useState(false);

  const defaultDay = week.days.find((day) => day.date === today) ?? week.days[0];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TeacherLegend teachers={teachers} label={t("teachers")} />
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setTeachersOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--navy-deep)] transition-colors hover:bg-[var(--navy-light)]"
          >
            <Users size={16} aria-hidden />
            {t("teachers")}
          </button>
          <button
            type="button"
            onClick={() => setAdding(defaultDay ?? null)}
            className="flex items-center gap-2 rounded-xl bg-[var(--navy-deep)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--navy-mid)] active:scale-95"
          >
            <Plus size={16} aria-hidden />
            {t("addLesson")}
          </button>
        </div>
      </div>

      <p className="mb-5 text-xs text-[var(--text-muted)]">{t("hint")}</p>

      <ScheduleBoard
        week={week}
        today={today}
        onLessonSelect={setSelected}
        onAddLesson={setAdding}
        addLabel={t("addLesson")}
      />

      {selected && (
        <AdminLessonDialog
          key={selected.key}
          lesson={selected}
          week={week}
          teachers={teachers}
          onClose={() => setSelected(null)}
        />
      )}

      {adding && (
        <AdminDialog open onClose={() => setAdding(null)} title={t("form.addTitle")}>
          <AdminLessonForm
            key={adding.date}
            teachers={teachers}
            initial={{
              name: "",
              teacherId: null,
              repeat: "weekly",
              dayOfWeek: adding.dayOfWeek,
              date: adding.date,
              startTime: "",
              endTime: "",
            }}
            submitLabel={t("addLesson")}
            onSubmit={createLesson}
            onDone={() => setAdding(null)}
            onCancel={() => setAdding(null)}
          />
        </AdminDialog>
      )}

      {teachersOpen && <AdminTeachersDialog teachers={teachers} onClose={() => setTeachersOpen(false)} />}
    </>
  );
}
