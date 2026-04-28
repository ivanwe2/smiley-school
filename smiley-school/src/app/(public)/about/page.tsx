import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SCHOOL, CAMBRIDGE_LEVELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SCHOOL.name} — a Cambridge-certified English language center with ${SCHOOL.yearsExperience}+ years of experience helping students achieve their language goals.`,
};

const TEAM = [
  { name: "Elena Papadopoulou", role: "Director & B2/C1 Teacher", bio: "Cambridge CELTA-qualified with 15 years of teaching experience. Passionate about helping students unlock their potential.", initials: "EP" },
  { name: "Dimitris Alexiou", role: "C1 Advanced Teacher", bio: "Holds a Cambridge DELTA and a Masters in Applied Linguistics. Specialist in CAE exam preparation.", initials: "DA" },
  { name: "Sofia Nikolaou", role: "B1 Preliminary Teacher", bio: "Brings warmth and creativity to every lesson. 8 years of experience with young learners and adults.", initials: "SN" },
  { name: "Maria Kostaki", role: "Young Learners Specialist", bio: "Expert in kids' English with a CELTA and a background in child psychology. Kids love her classes.", initials: "MK" },
];

export default async function AboutPage() {
  const t = await getTranslations("about");
  const tHome = await getTranslations("home");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-[var(--navy-deep)] text-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block bg-[var(--yellow-primary)]/10 border border-[var(--yellow-primary)]/30 text-[var(--yellow-primary)] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              {t("hero.badge")}
            </span>
            <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold leading-tight mb-5 text-white">
              {t("hero.heading")}{" "}
              <span className="text-[var(--yellow-primary)]">{t("hero.headingAccent")}</span>
            </h1>
            <p className="text-[var(--navy-light)]/80 text-lg leading-relaxed">
              {t("hero.description", { founded: SCHOOL.founded })}
            </p>
          </div>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)] mb-5">
                {t("story.heading")}
              </h2>
              <div className="space-y-4 text-[var(--text-body)] leading-relaxed">
                <p>{t("story.p1")}</p>
                <p>{t("story.p2")}</p>
                <p>{t("story.p3", { studentsCertified: SCHOOL.studentsCertified, passRate: SCHOOL.passRate })}</p>
              </div>
            </div>

            {/* Stats card */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: `${SCHOOL.founded}`, label: "Year Founded", icon: "🏫" },
                { value: `${SCHOOL.yearsExperience}+`, label: "Years Experience", icon: "📅" },
                { value: `${SCHOOL.studentsCertified}+`, label: "Students Certified", icon: "🎓" },
                { value: `${SCHOOL.passRate}%`, label: "Cambridge Pass Rate", icon: "✅" },
              ].map((s) => (
                <div key={s.label} className="bg-[var(--navy-light)] rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="font-fraunces text-2xl font-bold text-[var(--navy-deep)]">{s.value}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Cambridge Affiliation ─────────────────────────────────── */}
      <section className="py-16 bg-[var(--navy-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[var(--navy-deep)] flex items-center justify-center">
              <span className="text-[var(--yellow-primary)] font-fraunces font-bold text-xl">C</span>
            </div>
            <div>
              <h2 className="font-fraunces text-2xl font-semibold text-[var(--navy-deep)] mb-2">
                {t("cambridge.heading")}
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed max-w-2xl">
                {t("cambridge.description")}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {CAMBRIDGE_LEVELS.map((l) => (
                  <span
                    key={l.code}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: l.color }}
                  >
                    {l.code}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)] mb-3">
              {t("team.heading")}
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              {t("team.subheading")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-[var(--navy-light)] rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--navy-deep)] flex items-center justify-center mx-auto mb-4">
                  <span className="font-fraunces text-lg font-bold text-[var(--yellow-primary)]">
                    {member.initials}
                  </span>
                </div>
                <h3 className="font-fraunces font-semibold text-[var(--navy-deep)] mb-0.5">
                  {member.name}
                </h3>
                <p className="text-xs font-medium text-[var(--yellow-deep)] mb-3">{member.role}</p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 bg-[var(--navy-deep)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="font-fraunces text-3xl font-semibold text-white mb-4">
            {tHome("cta.heading")}
          </h2>
          <p className="text-[var(--navy-light)]/80 mb-7">
            {tHome("cta.subheading")}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-semibold text-sm hover:bg-[var(--yellow-deep)] transition-colors active:scale-95"
          >
            {tHome("cta.book")}
          </Link>
        </div>
      </section>
    </>
  );
}
