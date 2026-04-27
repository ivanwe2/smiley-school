"use server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validations/contact.schema";
import { sendContactNotification, sendContactConfirmation } from "@/lib/email";
import type { ActionResult } from "@/types";

export async function submitContactForm(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      subject: formData.get("subject") || undefined,
      message: formData.get("message"),
      inquiryType: formData.get("inquiryType") || "GENERAL",
    };

    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid form data";
      return { success: false, error: firstError };
    }

    const data = parsed.data;

    // Save to DB
    const submission = await db.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
        inquiryType: data.inquiryType as "GENERAL" | "ENROLLMENT" | "SCHEDULE" | "CAMBRIDGE_EXAM" | "PRICING",
      },
    });

    // Send emails (don't block response on failure)
    try {
      await Promise.all([
        sendContactNotification(data),
        sendContactConfirmation(data.name, data.email),
      ]);
    } catch (emailErr) {
      console.error("Email send failed (non-fatal):", emailErr);
    }

    return { success: true, data: { id: submission.id } };
  } catch (err) {
    console.error("Contact form error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
