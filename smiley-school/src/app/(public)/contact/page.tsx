import type { Metadata } from "next";
import type React from "react";
import { getTranslations } from "next-intl/server";
import { SCHOOL } from "@/lib/constants";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SCHOOL.name}. Book a free placement assessment or ask about our Cambridge English programmes.`,
};

export default async function ContactPage() {
  const t = await getTranslations("contact");

  const contactItems: { Icon: React.ComponentType<{ size?: number; className?: string }>; key: "address" | "phone" | "email" | "hours"; value: string; href?: string }[] = [
    { Icon: MapPin, key: "address", value: SCHOOL.address },
    { Icon: Phone, key: "phone", value: SCHOOL.phone, href: `tel:${SCHOOL.phone.replace(/\s/g, "")}` },
    { Icon: Mail, key: "email", value: SCHOOL.email, href: `mailto:${SCHOOL.email}` },
    { Icon: Clock, key: "hours", value: SCHOOL.hours },
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-[var(--navy-deep)] text-white py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold leading-tight mb-4 text-white">
              {t("hero.heading")}{" "}
              <span className="text-[var(--yellow-primary)]">{t("hero.headingAccent")}</span>
            </h1>
            <p className="text-[var(--navy-light)]/80 text-lg">
              {t("hero.description")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

            {/* Contact details */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-fraunces text-2xl font-semibold text-[var(--navy-deep)] mb-5">
                  {t("findUs")}
                </h2>
                <ul className="space-y-4">
                  {contactItems.map(({ Icon, key, value, href }) => (
                    <li key={key} className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[var(--yellow-light)] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={16} className="text-[var(--yellow-deep)]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-0.5">
                          {t(`labels.${key}`)}
                        </p>
                        {href ? (
                          <a href={href} className="text-sm text-[var(--text-body)] hover:text-[var(--navy-deep)] transition-colors">
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm text-[var(--text-body)]">{value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Map embed */}
              <div className="rounded-2xl overflow-hidden border border-[var(--border)] aspect-video lg:aspect-square bg-[var(--navy-light)] flex items-center justify-center">
                <div className="text-center p-6">
                  <MapPin size={32} className="text-[var(--yellow-primary)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">
                    {SCHOOL.address}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(SCHOOL.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs font-semibold text-[var(--yellow-deep)] hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="font-fraunces text-2xl font-semibold text-[var(--navy-deep)] mb-6">
                {t("form.heading")}
              </h2>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
