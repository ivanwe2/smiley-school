import { auth } from "@/features/auth/config";
import { redirect } from "next/navigation";

/**
 * Server-side helper: asserts the current request is from an authenticated admin.
 * Throws a redirect to /admin/login if not authenticated.
 * Use at the top of every Server Action and admin Server Component.
 *
 * @example
 * export async function deletePost(id: string) {
 *   await requireAdmin();
 *   // ... safe to proceed
 * }
 */
export async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
}

/**
 * Server-side helper: asserts the current request is from a SUPER_ADMIN user.
 * Throws a redirect to /admin/login if not authenticated or not a super admin.
 * Use for actions that only super admins should perform (user management, system config).
 */
export async function requireSuperAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }
}

/**
 * Server-side helper: returns the session if authenticated, or null.
 * Use in layouts/pages to conditionally show admin UI.
 */
export async function getAdminSession() {
  return auth();
}