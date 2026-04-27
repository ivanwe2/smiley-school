import { cache } from "react";
import { db } from "@/lib/db";

export const getPublishedAlbums = cache(async () => {
  return db.galleryAlbum.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { date: "desc" }],
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
});

export const getAlbumWithImages = cache(async (albumId: string) => {
  return db.galleryAlbum.findUnique({
    where: { id: albumId, published: true },
    include: { images: { orderBy: { order: "asc" } } },
  });
});

export const getAllAlbumsAdmin = cache(async () => {
  return db.galleryAlbum.findMany({
    orderBy: [{ order: "asc" }, { date: "desc" }],
    include: { images: { orderBy: { order: "asc" } } },
  });
});
