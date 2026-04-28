"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { AdminDialog } from "@/components/shared/AdminDialog";
import { createAlbum } from "@/features/gallery/actions/gallery.actions";

const fieldClass =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white";

export function NewAlbumButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createAlbum(formData);
      if (result.success) {
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors"
      >
        <Plus size={16} /> New Album
      </button>

      <AdminDialog open={open} onClose={() => setOpen(false)} title="New Album">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Album Name *</label>
            <input name="name" required placeholder="Graduation 2024" className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Description</label>
            <textarea name="description" rows={2} className={`${fieldClass} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Event Date</label>
            <input name="date" type="date" className={fieldClass} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="published" value="true" id="pub-new" defaultChecked className="w-4 h-4 rounded" />
            <label htmlFor="pub-new" className="text-sm font-medium text-[var(--text-body)]">Visible to visitors</label>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create Album"}
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
