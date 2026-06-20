"use client";

import { useState, useTransition } from "react";
import { togglePublicProfile } from "@/app/dashboard/cv/actions";
import { Globe, Lock, Link2, ExternalLink, Loader2 } from "lucide-react";

interface Props {
  isPublic: boolean;
  publicUsername: string | null;
}

export default function PublicProfileToggle({ isPublic, publicUsername }: Props) {
  const [enabled, setEnabled] = useState(isPublic);
  const [slug, setSlug] = useState(publicUsername ?? "");
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const profileUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${slug}`
    : "";

  const handleToggle = () => {
    startTransition(async () => {
      const result = await togglePublicProfile(!enabled, slug || undefined);
      setEnabled((prev) => !prev);
      if (result.slug) setSlug(result.slug);
    });
  };

  const handleCopy = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 backdrop-blur-sm"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
    >
      {/* Row: icon + label + toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={[
              "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300",
              enabled
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-zinc-700/60 bg-zinc-900/60",
            ].join(" ")}
          >
            {enabled ? (
              <Globe className="h-4 w-4 text-emerald-400" />
            ) : (
              <Lock className="h-4 w-4 text-zinc-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Public Portfolio</p>
            <p className="text-xs text-zinc-500">
              {enabled
                ? "Anyone with the link can view your portfolio"
                : "Your portfolio is private — only you can see it"}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          disabled={pending}
          aria-checked={enabled}
          role="switch"
          className={[
            "relative flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-300",
            enabled
              ? "border-emerald-500/40 bg-emerald-500/20"
              : "border-zinc-700/60 bg-zinc-900/60",
            pending ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        >
          {pending ? (
            <Loader2 className="absolute inset-0 m-auto h-3.5 w-3.5 animate-spin text-zinc-400" />
          ) : (
            <span
              className={[
                "absolute top-0.5 h-5 w-5 rounded-full shadow-sm transition-all duration-300",
                enabled
                  ? "translate-x-6 bg-emerald-400 shadow-emerald-400/40"
                  : "translate-x-0.5 bg-zinc-600",
              ].join(" ")}
              style={enabled ? { boxShadow: "0 0 8px rgba(52,211,153,0.6)" } : {}}
            />
          )}
        </button>
      </div>

      {/* URL row — only when enabled and slug exists */}
      {enabled && slug && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-3 py-2.5">
            <Globe className="h-3 w-3 shrink-0 text-emerald-400/70" />
            <p className="truncate font-mono text-[11px] text-zinc-400">
              /profile/<span className="text-zinc-200">{slug}</span>
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-500/60 hover:text-white"
          >
            <Link2 className="h-3 w-3" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <a
            href={`/profile/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-500/60 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            Preview
          </a>
        </div>
      )}
    </section>
  );
}
