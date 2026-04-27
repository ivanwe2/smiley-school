import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit Post" };

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--navy-deep)] transition-colors mb-6">
        <ArrowLeft size={15} /> Back to Posts
      </Link>
      <h1 className="text-2xl font-fraunces font-semibold text-[var(--navy-deep)] mb-6">Edit Post</h1>
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 max-w-2xl">
        <p className="text-sm text-[var(--text-muted)] mb-4">Full rich text editor (Tiptap) will be wired here in the next iteration.</p>
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold">Title:</span> {post.title}</p>
          <p><span className="font-semibold">Slug:</span> <code className="bg-gray-100 px-1 rounded text-xs">{post.slug}</code></p>
          <p><span className="font-semibold">Status:</span> {post.published ? "Published" : "Draft"}</p>
          <p><span className="font-semibold">Category:</span> {post.category}</p>
        </div>
      </div>
    </div>
  );
}
