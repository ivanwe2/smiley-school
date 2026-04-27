import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostsAdmin } from "@/features/blog/queries/posts.queries";
import { formatDate } from "@/lib/utils";
import { POST_CATEGORY_LABELS } from "@/lib/constants";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Blog Posts" };

export default async function AdminPostsPage() {
  const posts = await getAllPostsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[var(--navy-deep)]">Posts</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">{posts.length} total · {posts.filter(p => p.published).length} published</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors"
        >
          <Plus size={16} /> New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-3xl mb-3">📝</p>
          <p className="text-[var(--text-muted)] text-sm">No posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {posts.map((post) => (
              <div key={post.id} className="px-5 py-4 flex items-start gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${post.published ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-gray-100 text-gray-500"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                      {POST_CATEGORY_LABELS[post.category]}
                    </span>
                  </div>
                  <p className="font-fraunces font-semibold text-[var(--navy-deep)] text-sm truncate">{post.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {post.publishedAt ? formatDate(post.publishedAt, "MMM d, yyyy") : `Created ${formatDate(post.createdAt, "MMM d, yyyy")}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--navy-mid)] hover:bg-[var(--navy-light)] transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/news/${post.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--navy-light)] text-[var(--navy-mid)] hover:bg-[var(--navy-deep)] hover:text-white transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
