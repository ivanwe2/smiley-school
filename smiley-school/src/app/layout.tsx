import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smileyschool.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | Smiley School",
    default: "Smiley School — Cambridge English Language Center",
  },
  description:
    "Smiley School is a Cambridge-certified English language center offering A2, B1, B2, and C1 exam preparation for all ages.",
  keywords: [
    "Cambridge English",
    "English language school",
    "FCE",
    "B2 First",
    "CAE",
    "Smiley School",
  ],
  openGraph: {
    type: "website",
    siteName: "Smiley School",
    title: "Smiley School — Cambridge English Language Center",
    description:
      "Cambridge-certified English exam preparation for all ages. A2, B1, B2, and C1 courses.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Smiley School" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smiley School — Cambridge English Language Center",
    description: "Cambridge-certified English exam preparation for all ages. A2, B1, B2, and C1 courses.",
    images: ["/images/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plusJakartaSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}