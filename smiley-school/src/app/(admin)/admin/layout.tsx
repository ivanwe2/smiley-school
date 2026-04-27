import { redirect } from "next/navigation";
import { auth } from "@/features/auth/config";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--navy-light)]">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
