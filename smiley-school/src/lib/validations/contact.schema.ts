import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(20).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
  inquiryType: z
    .enum(["GENERAL", "ENROLLMENT", "SCHEDULE", "CAMBRIDGE_EXAM", "PRICING"])
    .default("GENERAL"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
