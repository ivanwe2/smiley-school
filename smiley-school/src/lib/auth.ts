import { auth } from "@/features/auth/config";
import { redirect } from "next/navigation";

export type AuthUser = { id: string; email: string; role: string };

export async function requireAdmin(): Promise<AuthUser> {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  const user = session.user as AuthUser;
  return { id: user.id, email: user.email, role: user.role ?? "ADMIN" };
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
