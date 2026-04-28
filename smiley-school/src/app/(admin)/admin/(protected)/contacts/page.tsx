import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { INQUIRY_TYPE_LABELS } from "@/lib/constants";
import { ContactRowActions } from "./ContactRowActions";

export const metadata: Metadata = { title: "Contact Submissions" };

export default async function AdminContactsPage() {
  const submissions = await db.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = submissions.filter((s) => !s.read).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[var(--navy-deep)]">
          Contact Submissions
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">
          {submissions.length} total ·{" "}
          <span className="text-[var(--yellow-deep)] font-semibold">{unread} unread</span>
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-3xl mb-3">📬</p>
          <p className="text-[var(--text-muted)] text-sm">No submissions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className={`px-5 py-4 flex items-start gap-4 flex-wrap ${!sub.read ? "bg-[var(--yellow-light)]/30" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {!sub.read && (
                      <span className="w-2 h-2 rounded-full bg-[var(--yellow-primary)] shrink-0" />
                    )}
                    <span className="font-semibold text-sm text-[var(--navy-deep)]">{sub.name}</span>
                    <span className="text-xs text-[var(--text-muted)] bg-gray-100 px-2 py-0.5 rounded-full">
                      {INQUIRY_TYPE_LABELS[sub.inquiryType] ?? sub.inquiryType}
                    </span>
                    {sub.repliedAt && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Replied {formatDate(sub.repliedAt, "MMM d")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    <a href={`mailto:${sub.email}`} className="hover:text-[var(--navy-deep)] underline">
                      {sub.email}
                    </a>
                    {sub.phone && <> · {sub.phone}</>}
                    {" · "}{formatDate(sub.createdAt, "MMM d, yyyy · HH:mm")}
                  </p>
                  {sub.subject && (
                    <p className="text-xs font-medium text-[var(--navy-mid)] mt-0.5">{sub.subject}</p>
                  )}
                  <p className="text-sm text-[var(--text-body)] mt-2 line-clamp-2">{sub.message}</p>
                </div>
                <ContactRowActions
                  id={sub.id}
                  name={sub.name}
                  email={sub.email}
                  subject={sub.subject}
                  read={sub.read}
                  repliedAt={sub.repliedAt}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
