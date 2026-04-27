"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";

export function MobileMenu() {
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
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="p-2 rounded-lg text-[var(--navy-deep)] hover:bg-[var(--navy-light)] transition-colors"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <nav
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--border)]">
          <span className="font-fraunces font-semibold text-[var(--navy-deep)]">
            Menu
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-[var(--navy-deep)] hover:bg-[var(--navy-light)] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--yellow-light)] text-[var(--navy-deep)] font-semibold"
                    : "text-[var(--text-body)] hover:bg-[var(--navy-light)] hover:text-[var(--navy-deep)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA at bottom */}
        <div className="p-4 border-t border-[var(--border)]">
          <Link
            href="/contact"
            className="block w-full text-center py-3 rounded-xl bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-semibold text-sm hover:bg-[var(--yellow-deep)] transition-colors"
          >
            Enroll Now
          </Link>
        </div>
      </nav>
    </div>
  );
}
