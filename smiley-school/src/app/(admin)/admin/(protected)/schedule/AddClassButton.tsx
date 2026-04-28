"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { AdminDialog } from "@/components/shared/AdminDialog";
import { createClass } from "@/features/schedule/actions/schedule.actions";

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

export function AddClassButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createClass(formData);
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors active:scale-95"
      >
        <Plus size={16} />
        Add Class
      </button>

      <AdminDialog open={open} onClose={() => setOpen(false)} title="Add New Class">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Class Name *</label>
            <input name="name" required placeholder="Cambridge B2 First" className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Level</label>
              <input name="level" placeholder="B2" className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Room</label>
              <input name="room" placeholder="Room 1" className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Teacher</label>
            <input name="teacher" placeholder="Ms. Elena" className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Day of Week *</label>
            <select name="dayOfWeek" required className={fieldClass}>
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Start Time *</label>
              <input name="startTime" required type="time" className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">End Time *</label>
              <input name="endTime" required type="time" className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Colour</label>
            <div className="flex items-center gap-2">
              <input name="color" type="color" defaultValue="#0F1F3D" className="w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer p-1" />
              <span className="text-xs text-[var(--text-muted)]">Shown as a dot on the schedule</span>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors disabled:opacity-60"
            >
              {pending ? "Saving…" : "Add Class"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
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
