"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, LogOut, LayoutDashboard, CalendarDays, FileText, Images, Mail, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "@/lib/constants";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Images,
  Mail,
};

type User = { name?: string | null; email?: string | null };

export function AdminMobileNav({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="flex md:hidden">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-[var(--navy-deep)] border-b border-[var(--navy-mid)]">
        <Image src="/images/logo-dark.svg" alt="Smiley School" width={110} height={28} className="h-7 w-auto" />
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg text-[var(--navy-light)] hover:bg-[var(--navy-mid)] transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-64 bg-[var(--navy-deep)] flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--navy-mid)]">
          <Image src="/images/logo-dark.svg" alt="Smiley School" width={110} height={28} className="h-7 w-auto" />
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-[var(--navy-light)] hover:bg-[var(--navy-mid)] transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
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
    </div>
  );
}
