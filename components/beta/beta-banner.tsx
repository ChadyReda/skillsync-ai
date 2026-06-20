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
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="sticky top-0 z-[60]"
        >
          <div
            role="region"
            aria-label="Beta notice"
            className="border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
              {/* Dot */}
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />

              {/* Message */}
              <p className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Beta —{" "}
                <span className="text-zinc-400">
                  spot a bug? Help us improve.
                </span>
              </p>

              {/* Report */}
              <Link
                href="/report"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 backdrop-blur-sm transition-all hover:border-zinc-700/60 hover:text-zinc-200"
              >
                <MessageSquareWarning className="h-3 w-3" />
                <span className="hidden sm:inline">Report issue</span>
              </Link>

              {/* Dismiss */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss beta notice"
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-zinc-700 transition-colors hover:text-zinc-400"
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
