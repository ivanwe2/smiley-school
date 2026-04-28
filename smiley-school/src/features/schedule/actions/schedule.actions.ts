"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { classSchema, classOverrideSchema } from "@/lib/validations/schedule.schema";
import type { ActionResult } from "@/types";

export async function createClass(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  try {
    const raw = {
      name: formData.get("name"),
      level: formData.get("level") || undefined,
      teacher: formData.get("teacher") || undefined,
      room: formData.get("room") || undefined,
      color: formData.get("color") || undefined,
      dayOfWeek: Number(formData.get("dayOfWeek")),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      isActive: true,
    };
    const parsed = classSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

    const cls = await db.class.create({ data: parsed.data });
    revalidatePath("/schedule");
    revalidatePath("/admin/schedule");
    return { success: true, data: { id: cls.id } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create class." };
  }
}

export async function updateClass(id: string, formData: FormData): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    const raw = {
      name: formData.get("name"),
      level: formData.get("level") || undefined,
      teacher: formData.get("teacher") || undefined,
      room: formData.get("room") || undefined,
      color: formData.get("color") || undefined,
      dayOfWeek: Number(formData.get("dayOfWeek")),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      isActive: formData.get("isActive") !== "false",
    };
    const parsed = classSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

    await db.class.update({ where: { id }, data: parsed.data });
    revalidatePath("/schedule");
    revalidatePath("/admin/schedule");
    return { success: true, data: undefined };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to update class." };
  }
}

export async function deleteClass(id: string): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    await db.class.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/schedule");
    revalidatePath("/admin/schedule");
    return { success: true, data: undefined };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to delete class." };
  }
}

export async function upsertClassOverride(formData: FormData): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    const raw = {
      classId: formData.get("classId"),
      date: formData.get("date"),
      type: formData.get("type"),
      overrideStartTime: formData.get("overrideStartTime") || undefined,
      overrideEndTime: formData.get("overrideEndTime") || undefined,
      overrideRoom: formData.get("overrideRoom") || undefined,
      note: formData.get("note") || undefined,
    };
    const parsed = classOverrideSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

    const { classId, date, ...rest } = parsed.data;
    await db.classOverride.upsert({
      where: { classId_date: { classId, date } },
      update: rest,
      create: { classId, date, ...rest },
    });

    revalidatePath("/schedule");
    revalidatePath("/admin/schedule");
    return { success: true, data: undefined };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to save override." };
  }
}

export async function deleteClassOverride(classId: string, date: Date): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    await db.classOverride.delete({ where: { classId_date: { classId, date } } });
    revalidatePath("/schedule");
    revalidatePath("/admin/schedule");
    return { success: true, data: undefined };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to remove override." };
  }
}