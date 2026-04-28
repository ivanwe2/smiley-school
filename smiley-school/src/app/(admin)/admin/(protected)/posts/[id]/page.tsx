import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { updatePost, deletePost } from "@/features/blog/actions/posts.actions";

export const metadata: Metadata = { title: "Edit Post" };

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  async function updatePostAction(formData: FormData): Promise<void> {
    "use server";
    const result = await updatePost(id, formData);
    if (result.success) {
      redirect("/admin/posts");
    }
  }

  async function deletePostAction(): Promise<void> {
    "use server";
    await deletePost(id);
    redirect("/admin/posts");
  }

  return (
    <div>
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--navy-deep)] transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Back to Posts
      </Link>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[var(--navy-deep)]">
          Edit Post
        </h1>
        <form action={deletePostAction}>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            Delete Post
          </button>
        </form>
      </div>

      <form action={updatePostAction} className="space-y-5 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Title *</label>
          <input
            name="title"
            required
            defaultValue={post.title}
            className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">
            Slug <span className="text-[var(--text-muted)] font-normal">(auto-generated from title if empty)</span>
          </label>
          <input
            name="slug"
            defaultValue={post.slug}
            className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Category</label>
          <select
            name="category"
            defaultValue={post.category}
            className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white"
          >
            <option value="NEWS">News</option>
            <option value="EVENTS">Events</option>
            <option value="GRADUATIONS">Graduations</option>
            <option value="ANNOUNCEMENTS">Announcements</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Excerpt</label>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={post.excerpt ?? ""}
            className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Cover Image URL</label>
          <input
            name="coverImageUrl"
            type="url"
            defaultValue={post.coverImageUrl ?? ""}
            placeholder="https://res.cloudinary.com/..."
            className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Cover Image Alt Text</label>
          <input
            name="coverImageAlt"
            defaultValue={post.coverImageAlt ?? ""}
            className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Content (HTML) *</label>
          <textarea
            name="content"
            required
            rows={14}
            defaultValue={post.content}
            className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white resize-y font-mono text-xs"
          />
        </div>

        <div className="border-t border-[var(--border)] pt-5">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">SEO (optional)</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">SEO Title <span className="text-[var(--text-muted)] font-normal">max 60 chars</span></label>
              <input
                name="seoTitle"
                maxLength={60}
                defaultValue={post.seoTitle ?? ""}
                className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">SEO Description <span className="text-[var(--text-muted)] font-normal">max 160 chars</span></label>
              <textarea
                name="seoDescription"
                maxLength={160}
                rows={2}
                defaultValue={post.seoDescription ?? ""}
                className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            value="true"
            id="published"
            defaultChecked={post.published}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="published" className="text-sm font-medium text-[var(--text-body)]">
            Published
            {post.publishedAt && (
              <span className="ml-2 text-xs text-[var(--text-muted)] font-normal">
                (first published {new Date(post.publishedAt).toLocaleDateString()})
              </span>
            )}
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors active:scale-95"
          >
            Save Changes
          </button>
          <Link
            href="/admin/posts"
            className="px-6 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--navy-light)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
