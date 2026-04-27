import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createPost } from "@/features/blog/actions/posts.actions";

export const metadata: Metadata = { title: "New Post" };

async function createPostAction(formData: FormData): Promise<void> {
  "use server";
  const result = await createPost(formData);
  if (result.success) {
    redirect(`/admin/posts/${result.data.id}`);
  }
}

export default function NewPostPage() {
  return (
    <div>
      <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--navy-deep)] transition-colors mb-6">
        <ArrowLeft size={15} /> Back to Posts
      </Link>
      <h1 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[var(--navy-deep)] mb-6">New Post</h1>
      <form action={createPostAction} className="space-y-5 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Title *</label>
          <input name="title" required className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Slug <span className="text-[var(--text-muted)] font-normal">(auto-generated if empty)</span></label>
          <input name="slug" className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white font-mono" placeholder="my-post-title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Category</label>
          <select name="category" className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white">
            <option value="NEWS">News</option>
            <option value="EVENTS">Events</option>
            <option value="GRADUATIONS">Graduations</option>
            <option value="ANNOUNCEMENTS">Announcements</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Excerpt</label>
          <textarea name="excerpt" rows={2} className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-1.5">Content (HTML) *</label>
          <textarea name="content" required rows={10} className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] bg-white resize-y font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="published" value="true" id="published" className="w-4 h-4 rounded" />
          <label htmlFor="published" className="text-sm font-medium text-[var(--text-body)]">Publish immediately</label>
        </div>
        <button type="submit" className="px-6 py-3 rounded-xl bg-[var(--navy-deep)] text-white text-sm font-semibold hover:bg-[var(--navy-mid)] transition-colors active:scale-95">
          Create Post
        </button>
      </form>
    </div>
  );
}
