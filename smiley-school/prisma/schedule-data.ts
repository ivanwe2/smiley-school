import type { PrismaClient } from "../src/generated/prisma";

/** The weekly schedule, as in the printed "Седмичен график" (seminaren_grafik.pdf). */
export const TEACHERS = [
  { key: "ruseva", name: "Mrs Ruseva", color: "green" },
  { key: "keti", name: "Miss Keti", color: "blue" },
  { key: "kali", name: "Miss Kali", color: "red" },
] as const;

type TeacherKey = (typeof TEACHERS)[number]["key"];

// [dayOfWeek (1 = Monday), start, end, group / student, teacher]
export const LESSONS: [number, string, string, string, TeacherKey][] = [
  [1, "10:00", "11:00", "Диана", "kali"],
  [1, "14:20", "16:20", "6 клас", "ruseva"],
  [1, "16:00", "17:00", "Криси", "keti"],
  [1, "16:25", "17:50", "3 клас", "ruseva"],
  [1, "16:45", "17:45", "Даная, 4 клас", "kali"],
  [1, "17:00", "18:00", "Васи", "keti"],
  [1, "17:45", "18:45", "Борис", "kali"],

  [2, "10:00", "11:20", "Йоана, 10 кл.", "ruseva"],
  [2, "14:40", "16:00", "9–10 кл.", "ruseva"],
  [2, "16:00", "18:00", "4 клас", "ruseva"],
  [2, "16:45", "17:45", "Георги, 3 клас", "kali"],
  [2, "18:00", "19:00", "Тинка", "keti"],

  [3, "10:00", "11:00", "Диди, Алекс", "kali"],
  [3, "10:00", "12:00", "6 клас", "ruseva"],
  [3, "14:45", "16:45", "6 клас", "ruseva"],
  [3, "16:45", "17:45", "CAE, Станислава", "kali"],
  [3, "18:00", "19:00", "Мими", "keti"],

  [4, "10:00", "12:00", "5 клас", "ruseva"],
  [4, "13:30", "14:30", "Боряна и 6 кл. Михаела", "keti"],
  [4, "15:00", "17:00", "5 клас", "ruseva"],
  [4, "17:00", "18:00", "Даная, 6 клас", "keti"],
  [4, "17:10", "18:10", "Сияна", "ruseva"],
  [4, "17:30", "18:30", "2 клас", "kali"],
  [4, "18:00", "19:00", "Мая", "keti"],

  [5, "11:00", "12:00", "B2+", "ruseva"],
  [5, "14:30", "15:30", "B2+", "ruseva"],
  [5, "15:45", "17:45", "5 клас", "ruseva"],
  [5, "17:15", "18:15", "Борис", "kali"],

  [6, "10:00", "11:20", "B1+", "kali"],
  [6, "11:30", "12:30", "Маги, 3 клас", "kali"],
];

/**
 * Creates the teachers and weekly lessons above. With `replace`, first
 * deletes every existing lesson (with its weekly changes) and teacher.
 */
export async function seedSchedule(db: PrismaClient, { replace = false } = {}) {
  await db.$transaction(async (tx) => {
    if (replace) {
      await tx.class.deleteMany();
      await tx.teacher.deleteMany();
    }

    const teacherIds = {} as Record<TeacherKey, string>;
    for (const [order, teacher] of TEACHERS.entries()) {
      const created = await tx.teacher.create({
        data: { name: teacher.name, color: teacher.color, order },
      });
      teacherIds[teacher.key] = created.id;
    }

    await tx.class.createMany({
      data: LESSONS.map(([dayOfWeek, startTime, endTime, name, teacher]) => ({
        name,
        dayOfWeek,
        startTime,
        endTime,
        teacherId: teacherIds[teacher],
      })),
    });
  });
}
