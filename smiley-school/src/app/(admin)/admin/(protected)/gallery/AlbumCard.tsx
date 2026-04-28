"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { AdminDialog } from "@/components/shared/AdminDialog";
import {
  updateAlbum,
  deleteAlbum,
  addImageToAlbum,
} from "@/features/gallery/actions/gallery.actions";
import { formatDate } from "@/lib/utils";

type Album = {
  id: string;
  name: string;
  description: string | null;
  date: Date | null;
  published: boolean;
  images: { url: string; alt: string | null }[];
};

const fieldClass =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white";

export function AlbumCard({ album }: { album: Album }) {
  const [manageOpen, setManageOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cover = album.images[0];

  function handleManage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateAlbum(album.id, formData);
      if (result.success) {
        setManageOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete album "${album.name}" and all its photos? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteAlbum(album.id);
      if (!result.success) setError(result.error);
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadProgress(`Uploading 0 / ${files.length}…`);
    let done = 0;

    for (const file of files) {
      try {
        // Get signed upload params from our API
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "smiley-school/gallery" }),
        });
        const { signature, apiKey, cloudName, timestamp } = await signRes.json() as {
          signature: string;
          apiKey: string;
          cloudName: string;
          timestamp: number;
        };

        // Upload directly to Cloudinary
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", apiKey);
        form.append("timestamp", String(timestamp));
        form.append("signature", signature);
        form.append("folder", "smiley-school/gallery");

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: form }
        );
        const uploadData = await uploadRes.json() as {
          secure_url: string;
          public_id: string;
          width: number;
          height: number;
        };

        // Save to DB via server action
        await addImageToAlbum(album.id, {
          url: uploadData.secure_url,
          publicId: uploadData.public_id,
          width: uploadData.width,
          height: uploadData.height,
          alt: album.name,
        });

        done++;
        setUploadProgress(`Uploading ${done} / ${files.length}…`);
      } catch (err) {
        console.error("Upload failed for file:", file.name, err);
      }
    }

    setUploadProgress(null);
    setUploadOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="aspect-video bg-[var(--navy-light)] relative">
          {cover?.url ? (
            <Image
              src={cover.url}
              alt={cover.alt ?? album.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20">🎓</div>
          )}
          {!album.published && (
            <span className="absolute top-2 left-2 bg-gray-800/80 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full">
              Hidden
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="font-fraunces font-semibold text-sm text-[var(--navy-deep)] truncate">{album.name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {album.images.length} photos{album.date && ` · ${formatDate(album.date, "MMM yyyy")}`}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setError(null); setManageOpen(true); }}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--navy-mid)] hover:bg-[var(--navy-light)] transition-colors"
            >
              Manage
            </button>
            <button
              onClick={() => { setError(null); setUploadOpen(true); }}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[var(--yellow-light)] text-[var(--yellow-deep)] hover:bg-[var(--yellow-primary)] hover:text-white transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* ── Manage Album Dialog ───────────────────────────────────── */}
      <AdminDialog open={manageOpen} onClose={() => setManageOpen(false)} title={`Manage: ${album.name}`}>
        <form onSubmit={handleManage} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Album Name *</label>
            <input name="name" required defaultValue={album.name} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Description</label>
            <textarea name="description" rows={2} defaultValue={album.description ?? ""} className={`${fieldClass} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Event Date</label>
            <input
              name="date"
              type="date"
              defaultValue={album.date ? new Date(album.date).toISOString().split("T")[0] : ""}
              className={fieldClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              value="true"
              id={`pub-${album.id}`}
              defaultChecked={album.published}
              className="w-4 h-4 rounded"
            />
            <label htmlFor={`pub-${album.id}`} className="text-sm font-medium text-[var(--text-body)]">Visible to visitors</label>
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
              Delete
            </button>
          </div>
        </form>
      </AdminDialog>

      {/* ── Upload Photos Dialog ──────────────────────────────────── */}
      <AdminDialog open={uploadOpen} onClose={() => !uploadProgress && setUploadOpen(false)} title={`Upload to: ${album.name}`}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Select one or more images to upload. They go directly to Cloudinary and are saved to this album.
          </p>
          {uploadProgress ? (
            <div className="flex items-center gap-3 bg-[var(--navy-light)] rounded-xl px-4 py-3">
              <Loader2 size={16} className="animate-spin text-[var(--navy-deep)]" />
              <span className="text-sm font-medium text-[var(--navy-deep)]">{uploadProgress}</span>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-xl p-8 cursor-pointer hover:border-[var(--yellow-primary)] hover:bg-[var(--yellow-light)] transition-colors">
              <Upload size={24} className="text-[var(--text-muted)]" />
              <span className="text-sm font-medium text-[var(--navy-mid)]">Click to select photos</span>
              <span className="text-xs text-[var(--text-muted)]">JPG, PNG, WebP — multiple files allowed</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleUpload}
              />
            </label>
          )}
          {!uploadProgress && (
            <button
              onClick={() => setUploadOpen(false)}
              className="w-full py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--navy-light)] transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </AdminDialog>
    </>
  );
}
