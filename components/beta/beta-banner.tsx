"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquareWarning, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "skillsync.beta-banner.dismissedAt";
const DISMISS_TTL_MS = 10 * 60 * 1000; // 10 min before reappearing
const AUTO_DISMISS_MS = 15 * 1000; // auto-hide after 15 s

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function BetaBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  // Restore dismiss state on mount
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

  // Auto-dismiss after 15 s whenever the banner becomes visible
  useEffect(() => {
    if (!mounted || dismissed) return;
    const t = setTimeout(() => {
      setDismissed(true);
      persist();
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [mounted, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    persist();
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="beta-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="sticky top-0 z-[60]"
        >
          <div
            role="region"
            aria-label="Beta notice"
            className="relative border-b border-white/[0.05] backdrop-blur-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(15,15,20,0.55) 50%, rgba(0,0,0,0.6) 100%)",
            }}
          >
            {/* top shimmer */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(255,255,255,0.07) 35%, rgba(255,255,255,0.10) 65%, transparent)",
              }}
            />
            {/* violet–cyan tint */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(139,92,246,0.04), transparent 40%, transparent 60%, rgba(6,182,212,0.04))",
              }}
            />

            <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 sm:px-6">
              {/* Message */}
              <p className="min-w-0 flex-1 truncate text-[11px] text-zinc-600">
                SkillSync is in active development —{" "}
                <span className="text-zinc-500">
                  spot a bug? Help us improve.
                </span>
              </p>

              {/* Report */}
              <Link
                href="/report"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700/40 bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 backdrop-blur-sm transition-all hover:border-zinc-500/50 hover:bg-white/[0.06] hover:text-zinc-200"
              >
                <MessageSquareWarning className="h-3 w-3" />
                <span className="hidden sm:inline">Report</span>
              </Link>

              {/* Dismiss */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss beta notice"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-700 transition-colors hover:text-zinc-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
