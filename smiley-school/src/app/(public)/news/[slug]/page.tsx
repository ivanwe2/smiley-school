import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getPublishedPosts } from "@/features/blog/queries/posts.queries";
import { formatDate } from "@/lib/utils";
import { POST_CATEGORY_LABELS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
  };
}

export const revalidate = 3600;

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const recentPosts = await getPublishedPosts(3);
  const related = recentPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      {post.coverImageUrl && (
        <div className="relative h-56 sm:h-72 md:h-96 bg-[var(--navy-light)] overflow-hidden">
          <Image src={post.coverImageUrl} alt={post.coverImageAlt ?? post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <article className="py-10 md:py-16 bg-[var(--white)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

          {/* Back link */}
          <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--navy-deep)] transition-colors mb-6">
            <ArrowLeft size={15} />
            Back to News
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider bg-[var(--yellow-light)] text-[var(--yellow-deep)] px-2.5 py-1 rounded-full">
              {POST_CATEGORY_LABELS[post.category]}
            </span>
            {post.publishedAt && (
              <span className="text-sm text-[var(--text-muted)]">
                {formatDate(post.publishedAt, "MMMM d, yyyy")}
              </span>
            )}
          </div>

          <h1 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)] leading-tight mb-6">
            {post.title}
          </h1>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none text-[var(--text-body)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share */}
          <div className="mt-10 pt-8 border-t border-[var(--border)] flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-[var(--navy-deep)]">Share:</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/news/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-14">
            <h2 className="font-fraunces text-xl font-semibold text-[var(--navy-deep)] mb-5">More from the blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="group block bg-[var(--navy-light)] rounded-xl p-4 hover:bg-[var(--yellow-light)] transition-colors">
                  <p className="font-fraunces font-semibold text-sm text-[var(--navy-deep)] group-hover:text-[var(--yellow-deep)] line-clamp-2 transition-colors">
                    {p.title}
                  </p>
                  {p.publishedAt && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(p.publishedAt, "MMM d, yyyy")}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
