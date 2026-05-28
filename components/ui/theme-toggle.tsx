"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-full border border-black/5 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] ${className}`}
        aria-hidden
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`
        group relative inline-flex h-9 w-9 items-center justify-center
        rounded-full border border-black/5 bg-white/20
        text-zinc-600 backdrop-blur-xl
        transition-all duration-300
        hover:bg-white/50 hover:text-black
        dark:border-white/10 dark:bg-white/[0.02]
        dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:hover:text-white
        ${className}
      `}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
        ) : (
          <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 text-white" />
        )}
      </div>
    </button>
  );
}
