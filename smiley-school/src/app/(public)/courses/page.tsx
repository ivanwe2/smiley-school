import type { Metadata } from "next";
import Link from "next/link";
import { CAMBRIDGE_LEVELS, SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Courses & Cambridge Certificates",
  description: "Cambridge A2 Key, B1 Preliminary, B2 First, and C1 Advanced exam preparation courses for all ages at Smiley School.",
};

const LEVEL_DETAILS = {
  A2: {
    fullName: "A2 Key (KET)",
    tagline: "Your first step in English",
    who: "Children and beginners building their first solid foundation in English",
    skills: ["Reading short texts and notices", "Writing simple messages and notes", "Listening to everyday conversations", "Speaking about familiar topics"],
    duration: "6–9 months preparation",
    exam: "Reading, Writing, Listening, Speaking",
  },
  B1: {
    fullName: "B1 Preliminary (PET)",
    tagline: "Confident everyday communication",
    who: "Students who can handle everyday situations in English and want to prove it",
    skills: ["Understanding main points of clear speech", "Writing short essays and emails", "Reading a range of texts for information", "Taking part in discussions and conversations"],
    duration: "9–12 months preparation",
    exam: "Reading, Writing, Listening, Speaking",
  },
  B2: {
    fullName: "B2 First (FCE)",
    tagline: "The benchmark of upper-intermediate English",
    who: "Students targeting university entry, professional life, or international opportunities",
    skills: ["Reading complex texts with implicit meaning", "Writing well-structured essays and reports", "Understanding fast native-speaker speech", "Discussing abstract topics fluently"],
    duration: "12–15 months preparation",
    exam: "Reading & Use of English, Writing, Listening, Speaking",
  },
  C1: {
    fullName: "C1 Advanced (CAE)",
    tagline: "High-achiever certification",
    who: "Advanced learners targeting top universities, professional careers, or international recognition",
    skills: ["Comprehending demanding academic texts", "Writing sophisticated, nuanced arguments", "Understanding a wide range of accents and styles", "Expressing ideas with precision and fluency"],
    duration: "15–18 months preparation",
    exam: "Reading & Use of English, Writing, Listening, Speaking",
  },
};

const FAQ = [
  { q: "Which exam is right for my child?", a: "We assess every new student before enrolment to place them at the exact right level. Book a free placement session and we'll guide you." },
  { q: "How long does it take to get certified?", a: "Preparation time depends on your current level and target exam. As a guide: A2 takes around 6–9 months, B1 takes 9–12 months, B2 takes 12–15 months, and C1 takes 15–18 months from scratch." },
  { q: "Do you offer classes for adults?", a: "Absolutely. We have separate classes for children (6–12), teenagers (13–17), and adults (18+) at all levels." },
  { q: "What are the class sizes?", a: "We keep classes small — typically 6–10 students — so every student gets personal attention from the teacher." },
  { q: "What does a Cambridge certificate mean for my career?", a: "Cambridge certificates are recognised by thousands of universities, employers, and governments worldwide. B2 First and C1 Advanced are especially valued for university admission and professional contexts." },
];

export default function CoursesPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-[var(--navy-deep)] text-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block bg-[var(--yellow-primary)]/10 border border-[var(--yellow-primary)]/30 text-[var(--yellow-primary)] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              Cambridge Programmes
            </span>
            <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold leading-tight mb-5">
              Find your{" "}
              <span className="text-[var(--yellow-primary)]">level</span>
            </h1>
            <p className="text-[var(--navy-light)]/80 text-lg leading-relaxed">
              From first words to fluent academic English — we prepare students for every
              Cambridge level with a {SCHOOL.passRate}% exam pass rate.
            </p>
          </div>
        </div>
      </section>

      {/* ── Level cards ───────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {CAMBRIDGE_LEVELS.map((level) => {
            const detail = LEVEL_DETAILS[level.code as keyof typeof LEVEL_DETAILS];
            return (
              <div
                key={level.code}
                className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Card header */}
                <div
                  className="flex items-center gap-4 px-6 py-5"
                  style={{ backgroundColor: level.color }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <span className="font-fraunces text-white font-bold text-lg">{level.code}</span>
                  </div>
                  <div>
                    <h2 className="font-fraunces text-xl font-semibold text-white">{detail.fullName}</h2>
                    <p className="text-white/80 text-sm">{detail.tagline}</p>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Who it's for</h3>
                    <p className="text-sm text-[var(--text-body)] leading-relaxed">{detail.who}</p>
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="text-[var(--yellow-deep)]">⏱</span> {detail.duration}
                      </div>
                      <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                        <span className="text-[var(--yellow-deep)] mt-px">📋</span>
                        <span>Papers: {detail.exam}</span>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">What you'll master</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detail.skills.map((skill) => (
                        <li key={skill} className="flex items-start gap-2 text-sm text-[var(--text-body)]">
                          <span className="text-[var(--success)] mt-0.5 shrink-0">✓</span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-6 pb-5">
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-95"
                    style={{ backgroundColor: level.color, color: "white" }}
                  >
                    Enquire about {level.code} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-[var(--navy-light)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-fraunces text-3xl font-semibold text-[var(--navy-deep)] text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-[var(--border)] open:shadow-sm"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-[var(--navy-deep)] text-sm sm:text-base">
                  {item.q}
                  <span className="shrink-0 text-[var(--yellow-primary)] group-open:rotate-45 transition-transform duration-200 text-xl leading-none">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-[var(--text-body)] leading-relaxed border-t border-[var(--border)] pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 bg-[var(--navy-deep)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="font-fraunces text-3xl font-semibold text-white mb-4">
            Not sure which level?
          </h2>
          <p className="text-[var(--navy-light)]/80 mb-7">
            Book a free placement assessment and we'll find the perfect starting point for you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-semibold text-sm hover:bg-[var(--yellow-deep)] transition-colors active:scale-95"
          >
            Book Free Placement Assessment
          </Link>
        </div>
      </section>
    </>
  );
}