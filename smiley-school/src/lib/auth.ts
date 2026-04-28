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
 * Server-side helper: returns the session if authenticated, or null.
 * Use in layouts/pages to conditionally show admin UI.
 */
export async function getAdminSession() {
  return auth();
}