import type { Class, ClassOverride, OverrideType } from "@/generated/prisma";

export type ClassWithOverrides = Class & {
  overrides: ClassOverride[];
};

export type ScheduledClass = {
  id: string;
  name: string;
  level: string | null;
  teacher: string | null;
  room: string | null;
  color: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  status: "normal" | "cancelled" | "rescheduled" | "note";
  override?: {
    type: OverrideType;
    overrideStartTime?: string | null;
    overrideEndTime?: string | null;
    overrideRoom?: string | null;
    note?: string | null;
  };
};

export type WeekSchedule = Record<number, ScheduledClass[]>; // dayOfWeek → classes