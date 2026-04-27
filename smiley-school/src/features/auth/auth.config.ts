import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config — no Node.js-only imports (no db, no bcrypt).
 * Used by middleware to validate JWT tokens without hitting the database.
 * The full config (with Credentials provider + db) lives in config.ts.
 */
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [],
  callbacks: {
    authorized({ request, auth: session }) {
      const { pathname } = request.nextUrl;
      if (
        pathname.startsWith("/admin") &&
        !pathname.startsWith("/admin/login")
      ) {
        return !!session?.user;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
