import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function resetPassword() {
  const newPassword = process.env.NEW_PASSWORD || "ChangeMe!_NotThis";
  const hash = await bcrypt.hash(newPassword, 12);

  const updated = await db.user.update({
    where: { email: "admin@smileyschool.com" },
    data: { passwordHash: hash },
  });

  console.log("✅ Admin password reset!");
  console.log("   Email: admin@smileyschool.com");
  console.log("   Password:", newPassword);

  await db.$disconnect();
}

resetPassword().catch(console.error);
