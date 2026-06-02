import { auth } from "@/features/auth/config";
import { redirect } from "next/navigation";

export type AuthUser = { id: string; email: string; role: string };

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export async function requireAdmin(): Promise<AuthUser> {
  const session = await auth();
  const user = session?.user as AuthUser | undefined;
  if (!user || !ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
    redirect("/admin/login");
  }
  return { id: user.id, email: user.email, role: user.role };
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  const session = await auth();
  const user = session?.user as AuthUser | undefined;
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }
  return { id: user.id, email: user.email, role: user.role };
}

export async function getUserRole(): Promise<string | null> {
  const session = await auth();
  return (session?.user as AuthUser | undefined)?.role ?? null;
}

export async function getAdminSession() {
  return auth();
}
