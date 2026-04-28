"use client";

import { useState, useTransition } from "react";
import { AdminDialog } from "@/components/shared/AdminDialog";
import { replyToContact, markContactAsRead } from "@/features/contact/actions/contact.actions";

type Props = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  read: boolean;
  repliedAt: Date | null;
};

export function ContactRowActions({ id, name, email, subject, read, repliedAt }: Props) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const message = (new FormData(e.currentTarget).get("message") as string) ?? "";
    startTransition(async () => {
      const result = await replyToContact(id, message);
      if (result.success) {
        setSent(true);
        setTimeout(() => setReplyOpen(false), 1500);
      } else {
        setError(result.error);
      }
    });
  }

  function handleMarkRead() {
    if (read) return;
    startTransition(async () => { await markContactAsRead(id); });
  }

  return (
    <div className="flex gap-2 shrink-0">
      {!read && (
        <button
          onClick={handleMarkRead}
          disabled={pending}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--navy-light)] transition-colors disabled:opacity-50"
        >
          Mark read
        </button>
      )}
      <button
        onClick={() => { setError(null); setSent(false); setReplyOpen(true); }}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--navy-deep)] text-white hover:bg-[var(--navy-mid)] transition-colors"
      >
        {repliedAt ? "Reply again" : "Reply"}
      </button>

      <AdminDialog open={replyOpen} onClose={() => setReplyOpen(false)} title={`Reply to ${name}`}>
        <div className="mb-3 text-xs text-[var(--text-muted)]">
          Sending to: <span className="font-medium text-[var(--navy-deep)]">{email}</span>
          {subject && <> · Subject: <em>Re: {subject}</em></>}
        </div>
        {sent ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-medium text-[var(--navy-deep)]">Reply sent!</p>
          </div>
        ) : (
          <form onSubmit={handleReply} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-body)] mb-1">Message *</label>
              <textarea
                name="message"
                required
                rows={6}
                placeholder="Type your reply here…"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send Reply"}
              </button>
              <button
                type="button"
                onClick={() => setReplyOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--navy-light)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </AdminDialog>
    </div>
  );
}
