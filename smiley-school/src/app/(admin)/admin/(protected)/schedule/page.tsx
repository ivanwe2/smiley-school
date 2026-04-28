import type { Metadata } from "next";
import { getAllClasses } from "@/features/schedule/queries/schedule.queries";
import { DAY_LABELS } from "@/lib/utils";
import { AddClassButton } from "./AddClassButton";
import { ClassRowActions } from "./ClassRowActions";

export const metadata: Metadata = { title: "Schedule Manager" };

export default async function AdminSchedulePage() {
  const classes = await getAllClasses();

  const byDay: Record<number, typeof classes> = {};
  for (const cls of classes) {
    if (!byDay[cls.dayOfWeek]) byDay[cls.dayOfWeek] = [];
    byDay[cls.dayOfWeek]!.push(cls);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[var(--navy-deep)]">
            Schedule Manager
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">{classes.length} active classes</p>
        </div>
        <AddClassButton />
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-3xl mb-3">📅</p>
          <h3 className="font-fraunces text-lg font-semibold text-[var(--navy-deep)] mb-2">No classes yet</h3>
          <p className="text-[var(--text-muted)] text-sm">Add your first class to get the schedule started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((day) => {
            const dayCls = byDay[day];
            if (!dayCls?.length) return null;
            return (
              <div key={day} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="px-5 py-3 bg-[var(--navy-light)] border-b border-[var(--border)]">
                  <h2 className="font-fraunces font-semibold text-[var(--navy-deep)] text-sm">
                    {DAY_LABELS[day]}
                  </h2>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {dayCls.map((cls) => (
                    <div key={cls.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cls.color ?? "#0F1F3D" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--navy-deep)] truncate">
                          {cls.name}
                          {cls.level && (
                            <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">[{cls.level}]</span>
                          )}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {cls.startTime}–{cls.endTime}
                          {cls.teacher && ` · ${cls.teacher}`}
                          {cls.room && ` · ${cls.room}`}
                        </p>
                      </div>
                      <ClassRowActions cls={cls} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
