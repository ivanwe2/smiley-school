import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

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

  // ── Sample classes ──────────────────────────────────────────────
  const classes = [
    {
      name: "Cambridge B2 First",
      level: "B2",
      teacher: "Ms. Elena",
      room: "Room 1",
      color: "#0F1F3D",
      dayOfWeek: 1, // Monday
      startTime: "18:00",
      endTime: "20:00",
    },
    {
      name: "Cambridge C1 Advanced",
      level: "C1",
      teacher: "Mr. Dimitris",
      room: "Room 2",
      color: "#1E3A5F",
      dayOfWeek: 2, // Tuesday
      startTime: "18:00",
      endTime: "20:00",
    },
    {
      name: "Cambridge B1 Preliminary",
      level: "B1",
      teacher: "Ms. Sofia",
      room: "Room 3",
      color: "#D97706",
      dayOfWeek: 3, // Wednesday
      startTime: "17:00",
      endTime: "19:00",
    },
    {
      name: "Cambridge A2 Key",
      level: "A2",
      teacher: "Ms. Maria",
      room: "Room 1",
      color: "#059669",
      dayOfWeek: 4, // Thursday
      startTime: "17:00",
      endTime: "18:30",
    },
    {
      name: "General English (Adults)",
      level: null,
      teacher: "Mr. Nikos",
      room: "Room 2",
      color: "#F4B942",
      dayOfWeek: 5, // Friday
      startTime: "10:00",
      endTime: "12:00",
    },
    {
      name: "Kids English",
      level: null,
      teacher: "Ms. Anna",
      room: "Room 3",
      color: "#F4B942",
      dayOfWeek: 6, // Saturday
      startTime: "10:00",
      endTime: "11:30",
    },
    {
      name: "Cambridge B2 First",
      level: "B2",
      teacher: "Ms. Elena",
      room: "Room 1",
      color: "#0F1F3D",
      dayOfWeek: 3, // Wednesday
      startTime: "18:00",
      endTime: "20:00",
    },
    {
      name: "Cambridge C1 Advanced",
      level: "C1",
      teacher: "Mr. Dimitris",
      room: "Room 2",
      color: "#1E3A5F",
      dayOfWeek: 4, // Thursday
      startTime: "18:30",
      endTime: "20:30",
    },
  ];

  for (const cls of classes) {
    await db.class.create({ data: cls });
  }
  console.log(`✅ ${classes.length} classes created`);

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
