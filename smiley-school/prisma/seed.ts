import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { LESSONS, seedSchedule } from "./schedule-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! }); // seed only runs in controlled CLI context
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Smiley School database...");

  // ── Admin user ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin1234", 12);
  await db.user.upsert({
    where: { email: "admin@smileyschool.com" },
    update: {},
    create: {
      email: "admin@smileyschool.com",
      passwordHash,
      name: "School Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created (admin@smileyschool.com / admin1234)");

  // ── Weekly schedule ─────────────────────────────────────────────
  if ((await db.class.count()) === 0) {
    await seedSchedule(db);
    console.log(`✅ Weekly schedule created (${LESSONS.length} lessons)`);
  } else {
    console.log("↷ Schedule already has lessons — skipped");
  }

  // ── Sample gallery album ─────────────────────────────────────────
  await db.galleryAlbum.create({
    data: {
      name: "June 2024 Graduation Ceremony",
      description: "Congratulations to our B2 and C1 graduates!",
      date: new Date("2024-06-15"),
      published: true,
      order: 0,
    },
  });
  console.log("✅ Sample gallery album created");

  // ── Sample post ─────────────────────────────────────────────────
  await db.post.create({
    data: {
      title: "Welcome to Smiley School!",
      slug: "welcome-to-smiley-school",
      excerpt: "We are thrilled to open our doors to a new academic year.",
      content:
        "<p>Welcome to Smiley School! We are a Cambridge-certified English language center dedicated to helping students of all ages achieve their language goals.</p><p>Our experienced teachers and proven methodology have helped hundreds of students pass their Cambridge exams with flying colours.</p>",
      category: "NEWS",
      published: true,
      publishedAt: new Date(),
    },
  });
  console.log("✅ Sample blog post created");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
