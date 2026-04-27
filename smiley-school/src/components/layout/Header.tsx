"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-[var(--border)]"
          : "bg-white border-b border-[var(--border)]"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
            <Image
              src="/images/logo.svg"
              alt="Smiley School"
              width={160}
              height={38}
              priority
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
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
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-[var(--navy-deep)] bg-[var(--yellow-light)]"
                      : "text-[var(--text-body)] hover:text-[var(--navy-deep)] hover:bg-[var(--navy-light)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + mobile trigger */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-[var(--yellow-primary)] text-[var(--navy-deep)] text-sm font-semibold hover:bg-[var(--yellow-deep)] transition-colors"
            >
              Enroll Now
            </Link>
            <MobileMenu />
          </div>

        </div>
      </div>
    </header>
  );
}
