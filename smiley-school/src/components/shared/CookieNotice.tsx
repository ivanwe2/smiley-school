"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "cookie-notice-dismissed";

export function CookieNotice() {
  const t = useTranslations("cookieNotice");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — skip notice
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--navy-deep)] border-t border-[var(--navy-mid)] text-[var(--navy-light)] shadow-lg"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <p className="text-sm text-center sm:text-left">
          {t("text")}{" "}
          <Link href="/privacy" className="underline hover:text-[var(--yellow-primary)] transition-colors">
            {t("learnMore")}
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-[var(--yellow-primary)] text-[var(--navy-deep)] text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
