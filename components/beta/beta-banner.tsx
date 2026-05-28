"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquareWarning, X } from "lucide-react";

const STORAGE_KEY = "skillsync.beta-banner.dismissedAt";
const DISMISS_TTL_MS = 10 * 60 * 1000;

function HiloSquare({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
    </svg>
  );
}

export function BetaBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const dismissedAt = raw ? Number(raw) : 0;
      const stillHidden =
        Number.isFinite(dismissedAt) &&
        dismissedAt > 0 &&
        Date.now() - dismissedAt < DISMISS_TTL_MS;
      setDismissed(stillHidden);

      if (stillHidden) {
        const remaining = DISMISS_TTL_MS - (Date.now() - dismissedAt);
        const t = setTimeout(() => setDismissed(false), remaining);
        return () => clearTimeout(t);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Beta notice"
      className="sticky top-0 z-[60] border-b border-zinc-800/60 bg-black/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        {/* Icon */}
        <span className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-800/60 bg-zinc-900/60 sm:inline-flex">
          <HiloSquare className="h-3.5 w-3.5 text-white" />
        </span>

        {/* Beta pill + message */}
        <p className="min-w-0 flex-1 truncate text-xs text-zinc-400 sm:text-[13px]">
          <span className="mr-2 inline-flex items-center rounded-md border border-zinc-700/50 bg-zinc-900/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
            Beta
          </span>
          SkillSync is in active development — spot a bug? Help us improve.
        </p>

        {/* Report button */}
        <Link
          href="/report"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/20 bg-white px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-zinc-100"
        >
          <MessageSquareWarning className="h-3 w-3" />
          <span className="hidden sm:inline">Report an Issue</span>
          <span className="sm:hidden">Report</span>
        </Link>

        {/* Dismiss */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss beta notice"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-zinc-600 transition-colors hover:border-zinc-800/60 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
