import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { NAV_LINKS, SCHOOL } from "@/lib/constants";
import { Logo } from "@/components/shared/Logo";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export async function Footer() {
  const year = new Date().getFullYear();
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");

  return (
    <footer className="bg-[var(--navy-deep)] text-[var(--navy-light)]">
      {/* Cambridge badge strip */}
      <div className="border-b border-[var(--navy-mid)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <Image
            src="/images/cambridge-badge.svg"
            alt="Cambridge Authorised Preparation Centre"
            width={120}
            height={40}
            className="flex-shrink-0"
          />
          <p className="text-sm text-[var(--navy-light)]/80 text-center sm:text-left">
            {tFooter("cambridgeStrip")}
          </p>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Logo variant="dark" className="h-9 w-auto mb-4" />
            <p className="text-sm leading-relaxed text-[var(--navy-light)]/80 max-w-sm">
              {tFooter("tagline")}
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href={SCHOOL.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-lg bg-[var(--navy-mid)] hover:bg-[var(--yellow-primary)] hover:text-[var(--navy-deep)] text-[var(--navy-light)] transition-colors"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href={SCHOOL.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-lg bg-[var(--navy-mid)] hover:bg-[var(--yellow-primary)] hover:text-[var(--navy-deep)] text-[var(--navy-light)] transition-colors"
              >
                <InstagramIcon size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {tFooter("navigationHeading")}
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--navy-light)]/80 hover:text-[var(--yellow-primary)] transition-colors"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {tFooter("contactHeading")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[var(--yellow-primary)] mt-0.5 shrink-0" />
                <span className="text-sm text-[var(--navy-light)]/80">{SCHOOL.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-[var(--yellow-primary)] shrink-0" />
                <a
                  href={`tel:${SCHOOL.phone.replace(/\s/g, "")}`}
                  className="text-sm text-[var(--navy-light)]/80 hover:text-[var(--yellow-primary)] transition-colors"
                >
                  {SCHOOL.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-[var(--yellow-primary)] shrink-0" />
                <a
                  href={`mailto:${SCHOOL.email}`}
                  className="text-sm text-[var(--navy-light)]/80 hover:text-[var(--yellow-primary)] transition-colors"
                >
                  {SCHOOL.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="text-[var(--yellow-primary)] mt-0.5 shrink-0" />
                <span className="text-sm text-[var(--navy-light)]/80">{SCHOOL.hours}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--navy-mid)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--navy-light)]/60">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <p>© {year} {SCHOOL.name}. {tFooter("copyright")}</p>
            <Link href="/privacy" className="hover:text-[var(--yellow-primary)] transition-colors">
              {tFooter("privacyPolicy")}
            </Link>
          </div>
          <p>{tFooter("cambridgeCertified")}</p>
        </div>
      </div>
    </footer>
  );
}
