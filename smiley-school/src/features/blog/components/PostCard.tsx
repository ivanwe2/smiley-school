import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { POST_CATEGORY_LABELS } from "@/lib/constants";
import type { PostPreview } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: "bg-blue-100 text-blue-700",
  EVENTS: "bg-purple-100 text-purple-700",
  GRADUATIONS: "bg-[var(--success)]/10 text-[var(--success)]",
  ANNOUNCEMENTS: "bg-amber-100 text-amber-700",
};

export function PostCard({ post }: { post: PostPreview }) {
  return (
    <Link href={`/news/${post.slug}`} className="group block bg-white rounded-2xl border border-[var(--border)] overflow-hidden card-hover">
      {/* Cover image */}
      <div className="aspect-video bg-[var(--navy-light)] relative overflow-hidden">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-30">📰</span>
          </div>
        )}
        {/* Category badge overlay */}
        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-600"}`}>
          {POST_CATEGORY_LABELS[post.category] ?? post.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-fraunces font-semibold text-[var(--navy-deep)] text-base leading-snug mb-2 group-hover:text-[var(--yellow-deep)] transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
        )}
        <p className="text-xs text-[var(--text-muted)]">
          {post.publishedAt ? formatDate(post.publishedAt, "MMM d, yyyy") : "Draft"}
        </p>
      </div>
    </Link>
  );
}