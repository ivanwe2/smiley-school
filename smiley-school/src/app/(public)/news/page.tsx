import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPublishedPosts } from "@/features/blog/queries/posts.queries";
import { PostCard } from "@/features/blog/components/PostCard";
import { SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "News & Events",
  description: `Latest news, events, and graduations from ${SCHOOL.name}.`,
};

export const revalidate = 3600;

export default async function NewsPage() {
  const posts = await getPublishedPosts();
  const t = await getTranslations("news");

  return (
    <>
      <section className="bg-[var(--navy-deep)] text-white py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold mb-3 text-white">
            {t("hero.heading")} <span className="text-[var(--yellow-primary)]">{t("hero.headingAccent")}</span>
          </h1>
          <p className="text-[var(--navy-light)]/80 text-lg">{t("hero.description")}</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📬</p>
              <h2 className="font-fraunces text-xl font-semibold text-[var(--navy-deep)] mb-2">{t("empty.heading")}</h2>
              <p className="text-[var(--text-muted)] text-sm">{t("empty.description")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
