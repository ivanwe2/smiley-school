import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.CONTACT_EMAIL_FROM ?? "noreply@smileyschool.com";
const TO = process.env.CONTACT_EMAIL_TO ?? "info@smileyschool.com";

// ── Email helpers ────────────────────────────────────────────────────────────

type ContactNotificationData = {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  inquiryType: string;
};

/**
 * Sends a notification to the school when a contact form is submitted.
 */
export async function sendContactNotification(
  data: ContactNotificationData
): Promise<void> {
  const subject = data.subject
    ? `New inquiry: ${data.subject}`
    : `New ${data.inquiryType.toLowerCase().replace("_", " ")} inquiry from ${data.name}`;

  await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: data.email,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #0F1F3D;">New Contact Form Submission</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px; font-weight:bold;">Name</td><td>${data.name}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Email</td><td>${data.email}</td></tr>
          ${data.phone ? `<tr><td style="padding:8px; font-weight:bold;">Phone</td><td>${data.phone}</td></tr>` : ""}
          <tr><td style="padding:8px; font-weight:bold;">Type</td><td>${data.inquiryType}</td></tr>
        </table>
        <h3 style="color: #1E3A5F;">Message</h3>
        <p style="background:#f5f5f5; padding:16px; border-radius:8px;">${data.message.replace(/\n/g, "<br>")}</p>
        <p style="color:#888; font-size:12px;">Sent from smileyschool.com contact form</p>
      </div>
    `,
  });
}

/**
 * Sends an auto-reply confirmation to the person who filled in the form.
 */
export async function sendContactConfirmation(
  name: string,
  toEmail: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: "We received your message — Smiley School",
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #0F1F3D;">Thank you, ${name}!</h2>
        <p>We've received your message and will get back to you within 1 business day.</p>
        <p style="color:#1E3A5F; font-weight:bold;">Smiley School Team</p>
        <p style="color:#888; font-size:12px;">Cambridge-Certified English Language Center</p>
      </div>
    `,
  });
}