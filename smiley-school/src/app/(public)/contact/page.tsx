import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-fraunces text-4xl font-semibold text-[var(--navy-deep)]">
          Contact
        </h1>
        <p className="mt-4 text-[var(--text-muted)]">Coming soon — this page is under construction.</p>
      </div>
    </section>
  );
}
