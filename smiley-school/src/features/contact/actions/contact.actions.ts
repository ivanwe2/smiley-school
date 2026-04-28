"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validations/contact.schema";
import { sendContactNotification, sendContactConfirmation, resend } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/types";

const FROM = process.env.CONTACT_EMAIL_FROM ?? "noreply@smileyschool.com";

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

export async function replyToContact(id: string, message: string): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    const submission = await db.contactSubmission.findUnique({ where: { id }, select: { name: true, email: true, subject: true } });
    if (!submission) return { success: false, error: "Submission not found." };

    await resend.emails.send({
      from: FROM,
      to: submission.email,
      subject: `Re: ${submission.subject ?? "Your enquiry"} — Smiley School`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <p>Dear ${submission.name},</p>
          <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; margin: 16px 0; white-space: pre-wrap;">${message.replace(/\n/g, "<br>")}</div>
          <p style="color:#1E3A5F; font-weight:bold;">Smiley School Team</p>
          <p style="color:#888; font-size:12px;">Cambridge-Certified English Language Center</p>
        </div>
      `,
    });

    await db.contactSubmission.update({
      where: { id },
      data: { read: true, repliedAt: new Date() },
    });

    revalidatePath("/admin/contacts");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("Reply error:", err);
    return { success: false, error: "Failed to send reply." };
  }
}

export async function markContactAsRead(id: string): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    await db.contactSubmission.update({ where: { id }, data: { read: true } });
    revalidatePath("/admin/contacts");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to mark as read." };
  }
}