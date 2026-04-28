import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smileyschool.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${BASE}/about`, priority: 0.8, changeFrequency: "monthly", lastModified: new Date() },
    { url: `${BASE}/courses`, priority: 0.9, changeFrequency: "monthly", lastModified: new Date() },
    { url: `${BASE}/schedule`, priority: 0.9, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${BASE}/news`, priority: 0.7, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${BASE}/gallery`, priority: 0.6, changeFrequency: "monthly", lastModified: new Date() },
    { url: `${BASE}/contact`, priority: 0.8, changeFrequency: "yearly", lastModified: new Date() },
  ];

  try {
    const [posts, albums] = await Promise.all([
      db.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      db.galleryAlbum.findMany({ where: { published: true }, select: { id: true, createdAt: true } }),
    ]);

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${BASE}/news/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const albumRoutes: MetadataRoute.Sitemap = albums.map((album) => ({
      url: `${BASE}/gallery/${album.id}`,
      lastModified: album.createdAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...postRoutes, ...albumRoutes];
  } catch {
    return staticRoutes;
  }
}
