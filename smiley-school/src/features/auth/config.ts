import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { loginRateLimiter, getIpFromRequest } from "@/lib/rate-limit";
import { authConfig } from "./auth.config";

// Pre-computed sentinel — bcrypt.compare() always runs even when user is not found,
// preventing timing-based email enumeration. This hash can never match real input.
const DUMMY_HASH = "$2a$12$invalidhashpaddingthatcannotevermatchwithanypassword___";

// Login only checks the password against its hash. The strength policy
// (password.schema.ts) applies when a password is set, so existing accounts
// with older passwords can still sign in.
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const ip = await getIpFromRequest();
        const ipLimited = loginRateLimiter.test(`ip:${ip}`);
        const emailLimited = loginRateLimiter.test(`email:${email.toLowerCase()}`);

        if (!ipLimited.success || !emailLimited.success) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        const isValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});