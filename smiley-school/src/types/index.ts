// Re-export common types used across the app
export type { ContactFormData } from "@/lib/validations/contact.schema";
export type { PostFormData } from "@/lib/validations/post.schema";
export type { LessonInput, TeacherInput } from "@/lib/validations/schedule.schema";

// ── Server Action result type ────────────────────────────────────────────────
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };