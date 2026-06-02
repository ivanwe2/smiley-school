import { getLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/shared/PageTransition";
import { CookieNotice } from "@/components/shared/CookieNotice";
import { SCHOOL } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smileyschool.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LanguageSchool",
  name: SCHOOL.name,
  description: `${SCHOOL.tagline}. Cambridge-certified English language center since ${SCHOOL.founded}.`,
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo.svg`,
  image: `${BASE_URL}/images/og-image.jpg`,
  foundingDate: String(SCHOOL.founded),
  telephone: SCHOOL.phone,
  email: SCHOOL.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: SCHOOL.address,
  },
  openingHours: SCHOOL.hours,
  sameAs: [SCHOOL.social.facebook, SCHOOL.social.instagram],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    name: "Cambridge English Authorised Preparation Centre",
    credentialCategory: "Cambridge English Language Assessment",
  },
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header locale={locale} />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CookieNotice />
    </>
  );
}
