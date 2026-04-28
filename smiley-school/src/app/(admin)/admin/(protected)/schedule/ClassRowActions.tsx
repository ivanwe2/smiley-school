"use client";

import { useState, useTransition } from "react";
import { AdminDialog } from "@/components/shared/AdminDialog";
import {
  updateClass,
  deleteClass,
  upsertClassOverride,
} from "@/features/schedule/actions/schedule.actions";

type ClassData = {
  id: string;
  name: string;
  level: string | null;
  teacher: string | null;
  room: string | null;
  color: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

const DAY_OPTIONS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const fieldClass =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white";

export function ClassRowActions({ cls }: { cls: ClassData }) {
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateClass(cls.id, formData);
      if (result.success) {
        setEditOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Remove this class from the schedule? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteClass(cls.id);
    });
  }

  function handleCancel(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("classId", cls.id);
    formData.set("type", "CANCELLED");
    startTransition(async () => {
      const result = await upsertClassOverride(formData);
      if (result.success) {
        setCancelOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  function handleNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("classId", cls.id);
    formData.set("type", "NOTE_ONLY");
    startTransition(async () => {
      const result = await upsertClassOverride(formData);
      if (result.success) {
        setNoteOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  function clearError() { setError(null); }

  return (
    <>
      <div className="flex gap-2 shrink-0 flex-wrap">
        <button
          onClick={() => { clearError(); setEditOpen(true); }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--navy-mid)] hover:bg-[var(--navy-light)] transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => { clearError(); setCancelOpen(true); }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Cancel date
        </button>
        <button
          onClick={() => { clearError(); setNoteOpen(true); }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--yellow-light)] text-[var(--yellow-deep)] hover:bg-[var(--yellow-primary)] hover:text-white transition-colors"
        >
          Add note
        </button>
      </div>

      {/* ── Edit Class Dialog ─────────────────────────────────────── */}
      <AdminDialog open={editOpen} onClose={() => setEditOpen(false)} title={`Edit: ${cls.name}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Class Name *</label>
            <input name="name" required defaultValue={cls.name} className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Level</label>
              <input name="level" defaultValue={cls.level ?? ""} placeholder="B2" className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Room</label>
              <input name="room" defaultValue={cls.room ?? ""} placeholder="Room 1" className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Teacher</label>
            <input name="teacher" defaultValue={cls.teacher ?? ""} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Day of Week *</label>
            <select name="dayOfWeek" defaultValue={String(cls.dayOfWeek)} className={fieldClass}>
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Start Time *</label>
              <input name="startTime" required type="time" defaultValue={cls.startTime} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">End Time *</label>
              <input name="endTime" required type="time" defaultValue={cls.endTime} className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Colour</label>
            <input name="color" type="color" defaultValue={cls.color ?? "#0F1F3D"} className="w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer p-1" />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </form>
      </AdminDialog>

      {/* ── Cancel Date Dialog ───────────────────────────────────── */}
      <AdminDialog open={cancelOpen} onClose={() => setCancelOpen(false)} title={`Cancel a date: ${cls.name}`}>
        <form onSubmit={handleCancel} className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Select the specific date to mark as cancelled. Students will see a &ldquo;Cancelled&rdquo; badge on the schedule.
          </p>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Date *</label>
            <input name="date" required type="date" className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">
              Reason <span className="text-[var(--text-muted)] font-normal">(shown to students)</span>
            </label>
            <input name="note" placeholder="e.g. Public holiday" className={fieldClass} />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {pending ? "Saving…" : "Mark as Cancelled"}
            </button>
            <button
              type="button"
              onClick={() => setCancelOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--navy-light)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminDialog>

      {/* ── Add Note / Homework Dialog ───────────────────────────── */}
      <AdminDialog open={noteOpen} onClose={() => setNoteOpen(false)} title={`Add note: ${cls.name}`}>
        <form onSubmit={handleNote} className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Add homework or a note for a specific date. The class runs normally — the note appears below it on the schedule.
          </p>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Date *</label>
            <input name="date" required type="date" className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Note / Homework *</label>
            <textarea
              name="note"
              required
              rows={3}
              placeholder="e.g. Homework: Unit 5 exercises, pages 42–44"
              className={`${fieldClass} resize-none`}
            />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-[var(--yellow-deep)] text-white text-sm font-semibold hover:bg-[var(--yellow-primary)] transition-colors disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save Note"}
            </button>
            <button
              type="button"
              onClick={() => setNoteOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--navy-light)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminDialog>
    </>
  );
}
