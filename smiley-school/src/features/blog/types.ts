import type { Post, PostCategory } from "@/generated/prisma";
export type { Post, PostCategory };

export type PostPreview = Pick<Post, "id" | "title" | "slug" | "excerpt" | "coverImageUrl" | "category" | "publishedAt">;
