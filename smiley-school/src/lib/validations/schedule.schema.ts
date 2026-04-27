import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const classSchema = z.object({
  name: z.string().min(2, "Class name is required").max(100),
  level: z.string().max(10).optional().or(z.literal("")),
  teacher: z.string().max(100).optional().or(z.literal("")),
  room: z.string().max(50).optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional()
    .or(z.literal("")),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Must be HH:MM format"),
  endTime: z.string().regex(timeRegex, "Must be HH:MM format"),
  isActive: z.boolean().default(true),
});

export const classOverrideSchema = z.object({
  classId: z.string().cuid(),
  date: z.coerce.date(),
  type: z.enum(["CANCELLED", "RESCHEDULED", "NOTE_ONLY"]),
  overrideStartTime: z
    .string()
    .regex(timeRegex)
    .optional()
    .or(z.literal("")),
  overrideEndTime: z.string().regex(timeRegex).optional().or(z.literal("")),
  overrideRoom: z.string().max(50).optional().or(z.literal("")),
  note: z.string().max(300).optional().or(z.literal("")),
});

export type ClassFormData = z.infer<typeof classSchema>;
export type ClassOverrideFormData = z.infer<typeof classOverrideSchema>;
