"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "smiley-school-theme";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      applyTheme("system");
    }
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    const isDark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  function toggle() {
    const current = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    const next: Theme = current === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  if (!mounted) {
    // Render placeholder to avoid hydration mismatch
    return (
      <button
        aria-label="Toggle theme"
        className="flex items-center justify-center rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--navy-deep)] hover:bg-[var(--navy-light)] transition-colors"
        disabled
      >
        <Sun size={18} />
      </button>
    );
  }

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--navy-deep)] hover:bg-[var(--navy-light)] transition-colors"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
