import type { Metadata } from "next";
import Link from "next/link";
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

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-[var(--navy-deep)] text-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block bg-[var(--yellow-primary)]/10 border border-[var(--yellow-primary)]/30 text-[var(--yellow-primary)] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              Our Story
            </span>
            <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold leading-tight mb-5 text-white">
              More than a school —{" "}
              <span className="text-[var(--yellow-primary)]">a community</span>
            </h1>
            <p className="text-[var(--navy-light)]/80 text-lg leading-relaxed">
              Since {SCHOOL.founded}, Smiley School has been helping students of all ages
              discover the joy of English — and the confidence that comes with it.
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
                How it all began
              </h2>
              <div className="space-y-4 text-[var(--text-body)] leading-relaxed">
                <p>
                  Smiley School was founded in {SCHOOL.founded} with a simple belief: every student
                  deserves a teacher who genuinely cares about their progress. Our founder,
                  herself a Cambridge-certified educator, wanted to create a place where
                  academic rigour and personal warmth could coexist.
                </p>
                <p>
                  What started as a small after-school programme has grown into a full
                  Cambridge authorised preparation centre, serving children, teenagers, and
                  adults at every level — from complete beginners to C1 Advanced candidates.
                </p>
                <p>
                  Over {SCHOOL.yearsExperience} years and {SCHOOL.studentsCertified}+ certified students
                  later, the mission is the same: help every student walk out of the exam room
                  feeling prepared, confident, and proud.
                </p>
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
                Cambridge Authorised Preparation Centre
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed max-w-2xl">
                Smiley School is officially recognised by Cambridge Assessment English as
                an authorised exam preparation centre. This means our teaching materials,
                methodology, and results are held to the highest Cambridge standards. When
                you study with us, you're studying the real thing.
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
              Meet the team
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Our teachers are Cambridge-qualified, experienced, and genuinely passionate
              about English language education.
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
            Come visit us
          </h2>
          <p className="text-[var(--navy-light)]/80 mb-7">
            We offer a free placement assessment — come in, meet the team, and find the right class for you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-semibold text-sm hover:bg-[var(--yellow-deep)] transition-colors active:scale-95"
          >
            Book a Free Assessment
          </Link>
        </div>
      </section>
    </>
  );
}