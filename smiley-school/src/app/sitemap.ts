import type { MetadataRoute } from "next";
import { SCHOOL } from "@/lib/constants";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smileyschool.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE}/about`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/courses`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE}/schedule`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE}/news`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${BASE}/gallery`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${BASE}/contact`, priority: 0.8, changeFrequency: "yearly" as const },
  ];

  return staticRoutes.map((route) => ({
    url: route.url,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}