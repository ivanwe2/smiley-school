"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/features/i18n/actions/locale.actions";
import { cn } from "@/lib/utils";

export function LanguageToggle({ currentLocale }: { currentLocale: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function switchTo(locale: "bg" | "en") {
    if (locale === currentLocale || pending) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-[var(--navy-light)] p-0.5">
      <button
        onClick={() => switchTo("bg")}
        disabled={pending}
        className={cn(
          "px-3 py-1 rounded-md text-xs font-semibold transition-all",
          currentLocale === "bg"
            ? "bg-background text-[var(--navy-deep)] shadow-sm"
            : "text-[var(--text-muted)] hover:text-[var(--navy-deep)]"
        )}
      >
        🇧🇬 БГ
      </button>
      <button
        onClick={() => switchTo("en")}
        disabled={pending}
        className={cn(
          "px-3 py-1 rounded-md text-xs font-semibold transition-all",
          currentLocale === "en"
            ? "bg-background text-[var(--navy-deep)] shadow-sm"
            : "text-[var(--text-muted)] hover:text-[var(--navy-deep)]"
        )}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
