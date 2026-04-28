"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { postSchema } from "@/lib/validations/post.schema";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";

export async function createPost(formData: FormData): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  try {
    const title = String(formData.get("title") ?? "");
    const raw = {
      title,
      slug: String(formData.get("slug") || slugify(title)),
      excerpt: formData.get("excerpt") || undefined,
      content: formData.get("content") || "",
      coverImageUrl: formData.get("coverImageUrl") || undefined,
      coverImageAlt: formData.get("coverImageAlt") || undefined,
      category: formData.get("category") || "NEWS",
      published: formData.get("published") === "true",
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
    };
    const parsed = postSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

    const post = await db.post.create({
      data: {
        ...parsed.data,
        publishedAt: parsed.data.published ? new Date() : null,
      },
    });
    revalidatePath("/news");
    revalidatePath("/admin/posts");
    return { success: true, data: { id: post.id, slug: post.slug } };
  } catch (e: unknown) {
    console.error(e);
    if ((e as { code?: string }).code === "P2002") return { success: false, error: "A post with this slug already exists." };
    return { success: false, error: "Failed to create post." };
  }
}

export async function updatePost(id: string, formData: FormData): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  try {
    const title = String(formData.get("title") ?? "");
    const raw = {
      title,
      slug: String(formData.get("slug") || slugify(title)),
      excerpt: formData.get("excerpt") || undefined,
      content: formData.get("content") || "",
      coverImageUrl: formData.get("coverImageUrl") || undefined,
      coverImageAlt: formData.get("coverImageAlt") || undefined,
      category: formData.get("category") || "NEWS",
      published: formData.get("published") === "true",
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
    };
    const parsed = postSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

    const existing = await db.post.findUnique({ where: { id }, select: { publishedAt: true, published: true } });
    const publishedAt = parsed.data.published
      ? existing?.publishedAt ?? new Date()
      : null;

    const post = await db.post.update({
      where: { id },
      data: { ...parsed.data, publishedAt },
    });
    revalidatePath("/news");
    revalidatePath(`/news/${post.slug}`);
    revalidatePath("/admin/posts");
    return { success: true, data: { slug: post.slug } };
  } catch (e: unknown) {
    console.error(e);
    if ((e as { code?: string }).code === "P2002") return { success: false, error: "A post with this slug already exists." };
    return { success: false, error: "Failed to update post." };
  }
}

export async function togglePublishPost(id: string, published: boolean): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    await db.post.update({
      where: { id },
      data: { published, publishedAt: published ? new Date() : null },
    });
    revalidatePath("/news");
    revalidatePath("/admin/posts");
    return { success: true, data: undefined };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to update post." };
  }
}

export async function deletePost(id: string): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    await db.post.delete({ where: { id } });
    revalidatePath("/news");
    revalidatePath("/admin/posts");
    return { success: true, data: undefined };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to delete post." };
  }
}