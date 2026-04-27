import NextAuth from "next-auth";
import { authConfig } from "@/features/auth/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    // Protect /admin and all sub-routes except /admin/login
    "/admin",
    "/admin/((?!login).+)",
  ],
};
