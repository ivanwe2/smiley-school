"use client";

import { useEffect, useState, useCallback } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

const THEME_KEY = "smiley-school-theme";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((t: Theme) => {
    const isDark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const resolved = stored ?? "system";
    setTheme(resolved);
    applyTheme(resolved);
  }, [applyTheme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  function cycle() {
    const order: Theme[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % 3];
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  if (!mounted) {
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

  const icons = { system: <Monitor size={18} />, light: <Moon size={18} />, dark: <Sun size={18} /> };
  const labels = { system: "Follow system theme", light: "Switch to dark mode", dark: "Switch to system theme" };

  return (
    <button
      onClick={cycle}
      aria-label={labels[theme]}
      title={labels[theme]}
      className="flex items-center justify-center rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--navy-deep)] hover:bg-[var(--navy-light)] transition-colors"
    >
      {icons[theme]}
    </button>
  );
}
