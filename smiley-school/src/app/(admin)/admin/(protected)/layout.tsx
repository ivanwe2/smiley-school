import { redirect } from "next/navigation";
import { auth } from "@/features/auth/config";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminMobileNav } from "@/components/layout/AdminMobileNav";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--navy-light)]">
      {/* Desktop sidebar */}
      <AdminSidebar user={session.user} />
      {/* Mobile top bar + drawer */}
      <AdminMobileNav user={session.user} />
      <main className="flex-1 overflow-y-auto">
        {/* pt-14 accounts for the fixed mobile top bar height */}
        <div className="p-6 pt-20 md:p-8 md:pt-8">{children}</div>
      </main>
    </div>
  );
}
