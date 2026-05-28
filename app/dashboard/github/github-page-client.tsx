"use client";

import { useState } from "react";
import type { GitHubData, GitHubInsights } from "@/lib/github/types";
import GitHubSection from "@/components/github/github-section";
import {
  Cube,
  ConcentricSquare,
  PolySpinner,
  ArrowOut,
} from "@/components/ui/polyhedron";

interface Props {
  initialUsername: string | null;
  initialData: GitHubData | null;
  initialInsights: GitHubInsights | null;
  initialUpdatedAt: string | null;
}

function ConnectSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg border border-zinc-800/60 bg-zinc-900/60" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-lg border border-zinc-800/60 bg-zinc-900/60" />
        <div className="space-y-4">
          <div className="h-24 rounded-lg border border-zinc-800/60 bg-zinc-900/60" />
          <div className="h-20 rounded-lg border border-zinc-800/60 bg-zinc-900/60" />
        </div>
      </div>
      <div className="h-40 rounded-lg border border-zinc-800/60 bg-zinc-900/60" />
      <div className="h-48 rounded-lg border border-zinc-800/60 bg-zinc-900/60" />
    </div>
  );
}

export default function GitHubPageClient({
  initialUsername,
  initialData,
  initialInsights,
  initialUpdatedAt,
}: Props) {
  const [inputValue, setInputValue] = useState(initialUsername ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<GitHubData | null>(initialData);
  const [insights, setInsights] = useState<GitHubInsights | null>(
    initialInsights,
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);

  const isConnected = !!data;

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
      setInsights(json.githubInsights as GitHubInsights);
      setUpdatedAt(new Date().toISOString());
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          [ 07 ] engineering profile
        </p>
        <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-bold text-white">
          <Cube className="h-5 w-5" />
          GitHub Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Connect your GitHub account to showcase your engineering profile
        </p>
      </div>

      <div
        className="space-y-4 rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-6 backdrop-blur-sm"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {isConnected ? "Connected GitHub Account" : "Connect your GitHub"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {isConnected
                ? "Refresh anytime to pull the latest stats and regenerate AI insights"
                : "Enter your GitHub username to generate analytics and AI insights"}
            </p>
          </div>
          {isConnected && (
            <a
              href={`https://github.com/${data!.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-600/60 hover:text-white"
            >
              <ArrowOut className="h-3 w-3" />@{data!.username}
            </a>
          )}
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
              className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/60 py-2.5 pl-[103px] pr-4 text-sm text-white placeholder:text-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={loading || !inputValue.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            style={!loading && inputValue.trim() ? { boxShadow: "0 0 16px rgba(255,255,255,0.1)" } : undefined}
          >
            {loading ? (
              <PolySpinner className="h-4 w-4" />
            ) : (
              <ConcentricSquare className="h-4 w-4" />
            )}
            {loading
              ? "Fetching..."
              : isConnected
                ? "Refresh"
                : "Connect"}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/[0.06] p-3 text-sm text-rose-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
            {error}
          </div>
        )}

        {success && !error && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.06] p-3 text-sm text-emerald-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px rgba(52,211,153,0.7)" }} />
            GitHub analytics updated and AI insights regenerated.
          </div>
        )}
      </div>

      {loading && <ConnectSkeleton />}

      {!loading && !data && (
        <div className="rounded-lg border border-dashed border-zinc-800/60 py-20 text-center backdrop-blur-sm">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
            style={{ boxShadow: "0 0 24px rgba(139,92,246,0.08)" }}
          >
            <Cube className="h-6 w-6 text-zinc-600" />
          </div>
          <p className="font-medium text-zinc-400">No GitHub data yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Enter your username above and click Connect
          </p>
        </div>
      )}

      {!loading && data && (
        <GitHubSection
          githubData={data}
          githubInsights={insights}
          githubUsername={data.username}
          lastUpdated={updatedAt}
        />
      )}
    </div>
  );
}
