"use client";

import { useState } from "react";
import {
  GitBranch,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Code2,
  Star,
  TrendingUp,
} from "lucide-react";
import type { GitHubData } from "@/lib/github/types";

interface Props {
  initialUsername?: string | null;
  initialData?: GitHubData | null;
  initialUpdatedAt?: string | null;
}

export default function GitHubConnect({
  initialUsername,
  initialData,
  initialUpdatedAt,
}: Props) {
  const [inputValue, setInputValue] = useState(initialUsername ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GitHubData | null>(initialData ?? null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(
    initialUpdatedAt ? new Date(initialUpdatedAt).toLocaleString() : null,
  );
  const [success, setSuccess] = useState(false);

  const handleFetch = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/github/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputValue.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to fetch GitHub data");
        return;
      }

      setData(json.githubData as GitHubData);
      setUpdatedAt(new Date().toLocaleString());
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isConnected = !!data;

  return (
    <div className="space-y-5 border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-800 bg-black">
          <GitBranch className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">
            GitHub Analytics
          </h2>
          <p className="text-xs text-zinc-500">
            Connect your GitHub to showcase your engineering profile
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none font-mono text-sm text-zinc-500">
            github.com/
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleFetch()}
            placeholder="your-username"
            className="w-full border border-zinc-800 bg-black py-2.5 pl-[103px] pr-4 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-zinc-600 focus:outline-none"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={loading || !inputValue.trim()}
          className="inline-flex shrink-0 items-center gap-2 border border-white bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {loading ? "Fetching..." : isConnected ? "Refresh" : "Connect"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 border border-rose-500/40 bg-rose-500/5 p-3 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && !error && (
        <div className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          GitHub analytics connected.
        </div>
      )}

      {loading && (
        <div className="animate-pulse">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 border border-zinc-800 bg-zinc-900" />
            ))}
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-emerald-400" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Connected as{" "}
                <span className="font-semibold text-white">
                  @{data.username}
                </span>
              </span>
            </div>
            {updatedAt && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Updated {updatedAt}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 border border-zinc-800">
            {[
              { label: "Repos", value: data.publicRepos, icon: Code2 },
              { label: "Stars", value: data.totalStars, icon: Star },
              {
                label: "Dev Score",
                value: `${data.developerScore}`,
                icon: TrendingUp,
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={[
                  "bg-black p-3 text-center",
                  i < 2 && "border-r border-zinc-800",
                ].join(" ")}
              >
                <stat.icon className="mx-auto mb-1 h-3.5 w-3.5 text-white" />
                <div className="text-lg font-bold tabular-nums text-white">
                  {stat.value}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {data.topLanguages.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.topLanguages.slice(0, 5).map((lang) => (
                <span
                  key={lang.name}
                  className="inline-flex items-center gap-1.5 border border-zinc-800 bg-black px-2.5 py-1 text-xs text-zinc-300"
                >
                  <span
                    className="h-2 w-2 shrink-0"
                    style={{ backgroundColor: lang.color }}
                  />
                  {lang.name}
                </span>
              ))}
            </div>
          )}

          <a
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-colors hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            View GitHub Profile
          </a>
        </div>
      )}
    </div>
  );
}
