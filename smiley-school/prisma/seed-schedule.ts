/**
 * Loads the weekly schedule from prisma/schedule-data.ts into the database.
 *
 *   npm run db:seed-schedule                — only when there are no lessons yet
 *   npm run db:seed-schedule -- --replace   — deletes ALL lessons, their weekly
 *                                             changes and teachers first
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { LESSONS, TEACHERS, seedSchedule } from "./schedule-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! }); // CLI-only script
const db = new PrismaClient({ adapter });

async function main() {
  const replace = process.argv.includes("--replace");
  const existing = await db.class.count();

  if (existing > 0 && !replace) {
    console.log(`The schedule already has ${existing} lessons — nothing changed.`);
    console.log("Run with --replace to delete them (and all teachers) and load the schedule.");
    return;
  }

  await seedSchedule(db, { replace });
  console.log(`✅ Schedule loaded: ${TEACHERS.length} teachers, ${LESSONS.length} weekly lessons`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
