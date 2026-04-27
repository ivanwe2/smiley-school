import type { Metadata } from "next";
import Link from "next/link";
import { SCHOOL, CAMBRIDGE_LEVELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Smiley School — Cambridge English Language Center",
  description: SCHOOL.tagline,
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--navy-deep)] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy-mid)] to-[var(--navy-deep)] opacity-90" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            {/* Cambridge badge */}
            <span className="inline-flex items-center gap-1.5 bg-[var(--yellow-primary)]/10 border border-[var(--yellow-primary)]/30 text-[var(--yellow-primary)] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              Cambridge Authorised Centre
            </span>

            <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              English that opens{" "}
              <span className="text-[var(--yellow-primary)] relative">
                every door
              </span>
            </h1>
            <p className="text-lg text-[var(--navy-light)]/80 mb-8 leading-relaxed">
              {SCHOOL.tagline}. We prepare students of all ages for Cambridge
              A2, B1, B2, and C1 exams — with a {SCHOOL.passRate}% pass rate
              and {SCHOOL.yearsExperience}+ years of experience.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/schedule"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-semibold text-sm hover:bg-[var(--yellow-deep)] transition-colors"
              >
                View Schedule
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <section className="bg-[var(--yellow-primary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: `${SCHOOL.studentsCertified}+`, label: "Students Certified" },
              { value: `${SCHOOL.yearsExperience}+`, label: "Years Experience" },
              { value: `${SCHOOL.passRate}%`, label: "Exam Pass Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-fraunces font-bold text-[var(--navy-deep)]">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-[var(--navy-mid)] mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses preview ───────────────────────────────────────── */}
      <section className="py-20 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)] mb-3">
              Our Cambridge Programmes
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              From first steps in English to advanced professional certification — we have a class for every level.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAMBRIDGE_LEVELS.map((level) => (
              <Link
                key={level.code}
                href="/courses"
                className="group relative bg-white border border-[var(--border)] rounded-2xl p-6 card-hover text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-fraunces font-bold text-sm mb-4"
                  style={{ backgroundColor: level.color }}
                >
                  {level.code}
                </div>
                <h3 className="font-fraunces font-semibold text-[var(--navy-deep)] mb-2 leading-snug">
                  {level.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {level.description}
                </p>
                <span className="mt-4 inline-block text-xs font-semibold text-[var(--yellow-deep)] group-hover:text-[var(--navy-deep)] transition-colors">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Smiley School ─────────────────────────────────────── */}
      <section className="py-20 bg-[var(--navy-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)] mb-3">
              Why Smiley School?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎓",
                title: "Cambridge Certified",
                body: "We are an officially recognised Cambridge English preparation centre with a proven track record of exam success.",
              },
              {
                icon: "👩‍🏫",
                title: "Expert Teachers",
                body: "Our teachers are Cambridge-qualified, experienced, and passionate about helping every student reach their potential.",
              },
              {
                icon: "📅",
                title: "Flexible Schedule",
                body: "Morning, afternoon, and evening classes for children and adults. Check our live schedule for available slots.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-7 shadow-sm">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-fraunces font-semibold text-[var(--navy-deep)] text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-[var(--navy-deep)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-white mb-4">
            Ready to start your{" "}
            <span className="text-[var(--yellow-primary)]">English journey?</span>
          </h2>
          <p className="text-[var(--navy-light)]/80 mb-8">
            Contact us today for a free placement assessment and find the class that's right for you.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-semibold text-sm hover:bg-[var(--yellow-deep)] transition-colors"
            >
              Get in Touch
            </Link>
            <Link
              href="/schedule"
              className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              See the Schedule
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
