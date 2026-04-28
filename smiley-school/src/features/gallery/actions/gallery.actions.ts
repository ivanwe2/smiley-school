"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types";

export async function createAlbum(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  try {
    const album = await db.galleryAlbum.create({
      data: {
        name: String(formData.get("name")),
        description: String(formData.get("description") || ""),
        date: formData.get("date") ? new Date(String(formData.get("date"))) : null,
        published: formData.get("published") !== "false",
      },
    });
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true, data: { id: album.id } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create album." };
  }
}

export async function addImageToAlbum(
  albumId: string,
  imageData: { url: string; publicId: string; caption?: string; alt?: string; width?: number; height?: number }
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  try {
    const image = await db.galleryImage.create({
      data: { albumId, ...imageData },
    });
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${albumId}`);
    return { success: true, data: { id: image.id } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to add image." };
  }
}

export async function deleteImage(id: string, albumId: string): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    await db.galleryImage.delete({ where: { id } });
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${albumId}`);
    return { success: true, data: undefined };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to delete image." };
  }
}