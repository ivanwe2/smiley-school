"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { submitContactForm } from "@/features/contact/actions/contact.actions";
import { cn } from "@/lib/utils";

type State = { success: boolean; error?: string; id?: string } | null;

const INQUIRY_KEYS = ["GENERAL", "ENROLLMENT", "SCHEDULE", "CAMBRIDGE_EXAM", "PRICING"] as const;

function ContactField({
  label, name, required, error, children,
}: {
  label: string; name: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[var(--text-body)] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--text-body)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] focus:border-[var(--yellow-primary)] transition-colors placeholder:text-[var(--text-muted)]";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, action, pending] = useActionState<State, FormData>(
    async (_prev: State, formData: FormData) => {
      const result = await submitContactForm(formData);
      if (result.success) return { success: true, id: result.data.id };
      return { success: false, error: result.error };
    },
    null
  );

  if (state?.success) {
    return (
      <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="font-fraunces text-xl font-semibold text-[var(--navy-deep)] mb-2">{t("successHeading")}</h3>
        <p className="text-[var(--text-muted)] text-sm">{t("successDesc")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ContactField label={t("name")} name="name" required>
          <input id="name" name="name" type="text" required placeholder="Maria Papadaki" className={inputClass} />
        </ContactField>
        <ContactField label={t("email")} name="email" required>
          <input id="email" name="email" type="email" required placeholder="maria@example.com" className={inputClass} />
        </ContactField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ContactField label={t("phone")} name="phone">
          <input id="phone" name="phone" type="tel" placeholder="+30 210 000 0000" className={inputClass} />
        </ContactField>
        <ContactField label={t("inquiryType")} name="inquiryType" required>
          <select id="inquiryType" name="inquiryType" className={inputClass}>
            {INQUIRY_KEYS.map((key) => (
              <option key={key} value={key}>{t(`inquiryTypes.${key}`)}</option>
            ))}
          </select>
        </ContactField>
      </div>

      <ContactField label={t("subject")} name="subject">
        <input id="subject" name="subject" type="text" placeholder="e.g. B2 First class availability" className={inputClass} />
      </ContactField>

      <ContactField label={t("message")} name="message" required>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a bit about yourself and what you're looking for…"
          className={cn(inputClass, "resize-none")}
        />
      </ContactField>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]",
          "bg-[var(--navy-deep)] text-white hover:bg-[var(--navy-mid)]",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {pending ? t("sending") : t("submit")}
      </button>

      <p className="text-xs text-[var(--text-muted)] text-center">
        {t("privacyText")}{" "}
        <Link href="/privacy" className="underline hover:text-[var(--navy-deep)] transition-colors">
          {t("privacyLink")}
        </Link>
        .
      </p>
    </form>
  );
}
