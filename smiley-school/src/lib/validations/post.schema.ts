import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  coverImageAlt: z.string().max(200).optional().or(z.literal("")),
  category: z.enum(["NEWS", "EVENTS", "GRADUATIONS", "ANNOUNCEMENTS"]).default("NEWS"),
  published: z.boolean().default(false),
  seoTitle: z.string().max(60).optional().or(z.literal("")),
  seoDescription: z.string().max(160).optional().or(z.literal("")),
});

export type PostFormData = z.infer<typeof postSchema>;