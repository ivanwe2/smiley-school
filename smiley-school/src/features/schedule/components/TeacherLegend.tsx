import { cn } from "@/lib/utils";
import { teacherColorClasses } from "../lib/teacher-colors";
import type { TeacherInfo } from "../types";

export function TeacherLegend({ teachers, label }: { teachers: TeacherInfo[]; label: string }) {
  if (teachers.length === 0) return null;

  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {teachers.map((teacher) => {
        const colors = teacherColorClasses(teacher.color);
        return (
          <li
            key={teacher.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
              colors.cell,
              colors.time
            )}
          >
            <span aria-hidden className={cn("size-2.5 rounded-full", colors.swatch)} />
            {teacher.name}
          </li>
        );
      })}
    </ul>
  );
}
