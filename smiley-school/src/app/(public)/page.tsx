import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SCHOOL, CAMBRIDGE_LEVELS } from "@/lib/constants";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { getPublishedPosts } from "@/features/blog/queries/posts.queries";
import { PostCard } from "@/features/blog/components/PostCard";

export const metadata: Metadata = {
  title: "Smiley School — Cambridge English Language Center",
  description: `${SCHOOL.tagline}. ${SCHOOL.passRate}% pass rate, ${SCHOOL.yearsExperience}+ years experience.`,
};

export const revalidate = 3600;

const TESTIMONIALS = [
  { name: "Maria K.", level: "B2 First", quote: "I passed my FCE with a B grade on the first attempt. The classes were incredibly well-structured and my teacher always found time to give me extra help." },
  { name: "Nikos P.", level: "C1 Advanced", quote: "Smiley School prepared me for CAE in a way I never expected. I got an A — the highest grade. Can't recommend them enough." },
  { name: "Anna S.", level: "B1 Preliminary", quote: "My daughter went from complete beginner to B1 certified in just 18 months. The teachers are wonderful with kids." },
  { name: "Dimitris A.", level: "B2 First", quote: "After failing at another school, I joined Smiley School and passed within a year. The difference in teaching quality is night and day." },
];

const WHY_REASONS = [
  { icon: "🎓", key: "cambridge" },
  { icon: "👩‍🏫", key: "teachers" },
  { icon: "📊", key: "results" },
  { icon: "🤝", key: "community" },
  { icon: "📅", key: "flexible" },
  { icon: "⭐", key: "proven" },
] as const;

export default async function HomePage() {
  const latestPosts = await getPublishedPosts(3);
  const t = await getTranslations("home");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--navy-deep)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--navy-mid)] via-[var(--navy-deep)] to-[var(--navy-deep)] opacity-80" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--yellow-primary)]/5 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[var(--navy-mid)]/40 blur-2xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-[var(--yellow-primary)]/10 border border-[var(--yellow-primary)]/30 text-[var(--yellow-primary)] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              {t("hero.badge")}
            </span>
            <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-6">
              {t("hero.heading")}{" "}
              <span className="text-[var(--yellow-primary)]">{t("hero.headingAccent")}</span>
            </h1>
            <p className="text-lg text-[var(--navy-light)]/80 mb-8 leading-relaxed">
              {t("hero.description", { passRate: SCHOOL.passRate, yearsExperience: SCHOOL.yearsExperience })}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/schedule"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-semibold text-sm hover:bg-[var(--yellow-deep)] transition-colors active:scale-95"
              >
                {t("hero.viewSchedule")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors active:scale-95"
              >
                {t("hero.bookAssessment")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <section className="bg-[var(--yellow-primary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {[
              { value: `${SCHOOL.studentsCertified}+`, label: t("stats.studentsCertified") },
              { value: `${SCHOOL.yearsExperience}+`, label: t("stats.yearsExperience") },
              { value: `${SCHOOL.passRate}%`, label: t("stats.passRate") },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-fraunces font-bold text-[var(--navy-deep)]">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-[var(--navy-mid)] mt-0.5 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cambridge levels ──────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-10 md:mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--yellow-deep)] block mb-3">Cambridge Programmes</span>
              <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)]">
                {t("levels.heading")}
              </h2>
              <p className="mt-3 text-[var(--text-muted)] max-w-xl mx-auto">
                {t("levels.subheading")}
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAMBRIDGE_LEVELS.map((level, i) => (
              <RevealOnScroll key={level.code} delay={i * 0.08}>
                <Link
                  href="/courses"
                  className="group block bg-white border border-[var(--border)] rounded-2xl p-6 card-hover h-full"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-fraunces font-bold text-sm mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: level.color }}
                  >
                    {level.code}
                  </div>
                  <h3 className="font-fraunces font-semibold text-[var(--navy-deep)] mb-2 leading-snug">
                    {level.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{level.description}</p>
                  <span className="mt-4 inline-block text-xs font-semibold text-[var(--yellow-deep)] group-hover:text-[var(--navy-deep)] transition-colors">
                    {t("levels.learnMore")}
                  </span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Smiley School ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[var(--navy-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-10 md:mb-14">
              <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)]">
                {t("whySmiley.heading")}
              </h2>
              <p className="mt-3 text-[var(--text-muted)] max-w-xl mx-auto">
                {t("whySmiley.subheading")}
              </p>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {WHY_REASONS.map((item, i) => (
              <RevealOnScroll key={item.key} delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-7 shadow-sm h-full">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-fraunces font-semibold text-[var(--navy-deep)] text-lg mb-2">
                    {t(`whySmiley.reasons.${item.key}.title`)}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {t(`whySmiley.reasons.${item.key}.desc`)}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-10 md:mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--yellow-deep)] block mb-3">Student Stories</span>
              <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)]">
                {t("testimonials.heading")}
              </h2>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TESTIMONIALS.map((testimonial, i) => (
              <RevealOnScroll key={testimonial.name} delay={i * 0.07}>
                <div className="bg-[var(--navy-light)] rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="text-[var(--yellow-primary)] text-sm">★</span>
                    ))}
                  </div>
                  <blockquote className="text-[var(--text-body)] text-sm leading-relaxed mb-5 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--navy-deep)] flex items-center justify-center shrink-0">
                      <span className="text-[var(--yellow-primary)] font-fraunces font-bold text-xs">
                        {testimonial.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--navy-deep)]">{testimonial.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">Cambridge {testimonial.level}</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest news ─────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="py-16 bg-[var(--navy-light)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
                <h2 className="font-fraunces text-3xl font-semibold text-[var(--navy-deep)]">
                  {t("latestNews.heading")}
                </h2>
                <Link href="/news" className="text-sm font-semibold text-[var(--yellow-deep)] hover:underline">
                  {t("latestNews.viewAll")}
                </Link>
              </div>
            </RevealOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post, i) => (
                <RevealOnScroll key={post.id} delay={i * 0.08}>
                  <PostCard post={post} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[var(--navy-deep)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-white mb-4">
              {t("cta.heading")}
            </h2>
            <p className="text-[var(--navy-light)]/80 mb-8 text-lg">
              {t("cta.subheading")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/contact"
                className="px-7 py-3.5 rounded-xl bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-semibold text-sm hover:bg-[var(--yellow-deep)] transition-colors active:scale-95"
              >
                {t("cta.book")}
              </Link>
              <Link
                href="/schedule"
                className="px-7 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors active:scale-95"
              >
                {t("cta.viewSchedule")}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
