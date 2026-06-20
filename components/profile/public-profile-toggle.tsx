"use client";

import { useState, useTransition } from "react";
import { togglePublicProfile } from "@/app/dashboard/cv/actions";
import { Link2, ExternalLink, Loader2 } from "lucide-react";

interface Props {
  isPublic: boolean;
  publicUsername: string | null;
}

export default function PublicProfileToggle({ isPublic, publicUsername }: Props) {
  const [enabled, setEnabled] = useState(isPublic);
  const [slug, setSlug] = useState(publicUsername ?? "");
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const handleToggle = () => {
    startTransition(async () => {
      const result = await togglePublicProfile(!enabled, slug || undefined);
      setEnabled((prev) => !prev);
      if (result.slug) setSlug(result.slug);
    });
  };

  const handleCopy = () => {
    if (!slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/profile/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-2xl border border-zinc-800/60 bg-zinc-950/50 px-4 py-3 backdrop-blur-sm"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              "h-1.5 w-1.5 rounded-full transition-colors duration-300",
              enabled ? "bg-emerald-400" : "bg-zinc-600",
            ].join(" ")}
            style={enabled ? { boxShadow: "0 0 6px rgba(52,211,153,0.7)" } : undefined}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            Public portfolio
          </span>
          {enabled && slug && (
            <span className="hidden font-mono text-[10px] text-zinc-600 sm:inline">
              · /profile/{slug}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enabled && slug && (
            <>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-700/60 hover:text-zinc-200"
              >
                <Link2 className="h-3 w-3" />
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={`/profile/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-700/60 hover:text-zinc-200"
              >
                <ExternalLink className="h-3 w-3" />
                View
              </a>
            </>
          )}

          {/* Toggle */}
          <button
            onClick={handleToggle}
            disabled={pending}
            role="switch"
            aria-checked={enabled}
            className={[
              "relative flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-300",
              enabled ? "border-emerald-500/30 bg-emerald-500/15" : "border-zinc-700/60 bg-zinc-900/60",
              pending ? "cursor-not-allowed opacity-50" : "",
            ].join(" ")}
          >
            {pending ? (
              <Loader2 className="absolute inset-0 m-auto h-2.5 w-2.5 animate-spin text-zinc-500" />
            ) : (
              <span
                className={[
                  "absolute h-3.5 w-3.5 rounded-full transition-all duration-300",
                  enabled ? "translate-x-[18px] bg-emerald-400" : "translate-x-0.5 bg-zinc-600",
                ].join(" ")}
                style={enabled ? { boxShadow: "0 0 6px rgba(52,211,153,0.5)" } : undefined}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
