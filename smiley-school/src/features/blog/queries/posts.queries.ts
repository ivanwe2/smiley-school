import { cache } from "react";
import { db } from "@/lib/db";
import type { PostPreview } from "../types";

export const getPublishedPosts = cache(async (limit?: number) => {
  return db.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { id: true, title: true, slug: true, excerpt: true, coverImageUrl: true, category: true, publishedAt: true },
  }) as Promise<PostPreview[]>;
});

export const getPostBySlug = cache(async (slug: string) => {
  return db.post.findUnique({
    where: { slug, published: true },
  });
});

export const getAllPostsAdmin = cache(async () => {
  return db.post.findMany({ orderBy: { createdAt: "desc" } });
});