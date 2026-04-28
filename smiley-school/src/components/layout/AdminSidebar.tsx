"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Images,
  Mail,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "@/lib/constants";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Images,
  Mail,
};

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[var(--navy-deep)] border-r border-[var(--navy-mid)] h-full">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--navy-mid)]">
        <Image
          src="/images/logo-dark.svg"
          alt="Smiley School"
          width={130}
          height={32}
          className="h-8 w-auto"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ADMIN_NAV_LINKS.map((link) => {
          const Icon = ICON_MAP[link.icon] ?? LayoutDashboard;
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--yellow-primary)] text-[var(--navy-deep)]"
                  : "text-[var(--navy-light)]/80 hover:bg-[var(--navy-mid)] hover:text-white"
              )}
            >
              <Icon size={17} className="shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-[var(--navy-mid)]">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-[var(--navy-light)]/60 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--navy-light)]/80 hover:bg-[var(--navy-mid)] hover:text-white transition-colors"
        >
          <LogOut size={17} className="shrink-0" />
          Sign out
        </button>
      </div>

    </aside>
  );
}