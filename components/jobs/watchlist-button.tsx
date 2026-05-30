"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { addToWatchlist, removeFromWatchlist } from "@/app/dashboard/jobs-tracker/actions";

interface Props {
  jobId: string;
  initialWatchlisted: boolean;
  size?: "sm" | "md";
}

export function WatchlistButton({ jobId, initialWatchlisted, size = "md" }: Props) {
  const [watchlisted, setWatchlisted] = useState(initialWatchlisted);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const next = !watchlisted;
    setWatchlisted(next);

    startTransition(async () => {
      try {
        if (next) {
          await addToWatchlist(jobId);
        } else {
          await removeFromWatchlist(jobId);
        }
      } catch {
        setWatchlisted(!next);
      }
    });
  }

  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={watchlisted ? "Remove from tracker" : "Save to tracker"}
      className={[
        `flex shrink-0 items-center justify-center rounded-lg border transition-all duration-150 disabled:opacity-50 ${dim}`,
        watchlisted
          ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          : "border-zinc-800/60 bg-zinc-900/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300",
      ].join(" ")}
      title={watchlisted ? "Remove from tracker" : "Save to tracker"}
    >
      <Bookmark className={`${icon} ${watchlisted ? "fill-current" : ""} transition-all`} />
    </button>
  );
}
