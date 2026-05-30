"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Building2,
  Search,
  Sparkles,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Triangle,
} from "lucide-react";
import { WatchlistButton } from "@/components/jobs/watchlist-button";

const PAGE_SIZE = 10;

type Job = {
  id: string;
  title: string;
  type: string;
  location: string | null;
  companyName: string | null;
  description: string;
  requirements: string | null;
  createdAt: Date | null;
  matchScore: number;
};

interface Props {
  allJobs: Job[];
  topMatches: Job[];
  hasProfile: boolean;
  watchlistedIds: string[];
}

const typeLabel: Record<string, string> = {
  job: "Full-time",
  internship: "Internship",
};

const typeColor: Record<string, string> = {
  job: "border-sky-500/20 bg-sky-500/8 text-sky-400",
  internship: "border-violet-500/20 bg-violet-500/8 text-violet-400",
};

function MatchBadge({ score }: { score: number }) {
  if (score === 0) return null;

  const { ring, fill, text } =
    score >= 70
      ? { ring: "border-emerald-500/30 bg-emerald-500/10", fill: "bg-emerald-400", text: "text-emerald-400" }
      : score >= 40
        ? { ring: "border-amber-500/30 bg-amber-500/10", fill: "bg-amber-400", text: "text-amber-400" }
        : { ring: "border-zinc-700/50 bg-zinc-900/60", fill: "bg-zinc-600", text: "text-zinc-500" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${ring} ${text}`}>
      <Triangle className="h-2 w-2 fill-current" />
      <span className="tabular-nums">{score}</span>
      <span className="opacity-50">/ 100</span>
      <span className="relative h-1 w-10 overflow-hidden rounded-full bg-white/5">
        <span className={`absolute inset-y-0 left-0 rounded-full ${fill}`} style={{ width: `${score}%` }} />
      </span>
    </span>
  );
}

function JobCard({ job, isWatchlisted }: { job: Job; isWatchlisted: boolean }) {
  const label = typeLabel[job.type] ?? job.type;
  const badgeColor = typeColor[job.type] ?? "border-zinc-700/50 bg-zinc-900/60 text-zinc-400";

  return (
    <div
      className="group flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/50 sm:flex-row sm:items-start"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.3)" }}
    >
      {/* Company icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/80">
        <Building2 className="h-5 w-5 text-zinc-500" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <h2 className="text-[15px] font-semibold text-white">{job.title}</h2>
          <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${badgeColor}`}>
            {label}
          </span>
          <MatchBadge score={job.matchScore} />
        </div>

        <p className="mb-3 text-sm font-medium text-zinc-400">{job.companyName}</p>

        <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
          </span>
        </div>

        {job.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
            {job.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <WatchlistButton jobId={job.id} initialWatchlisted={isWatchlisted} />
        <Link
          href={`/dashboard/jobs/${job.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
        >
          View
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/60 text-zinc-400 transition-all hover:border-zinc-600/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center font-mono text-[11px] text-zinc-600">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={[
              "flex h-8 w-8 items-center justify-center rounded-xl font-mono text-[11px] transition-all",
              p === page
                ? "bg-white text-black font-semibold"
                : "border border-zinc-800/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600/60 hover:text-white",
            ].join(" ")}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/60 text-zinc-400 transition-all hover:border-zinc-600/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function JobsClient({ allJobs, topMatches, hasProfile, watchlistedIds }: Props) {
  const watchlistedSet = new Set(watchlistedIds);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);

  const baseList = showAll ? allJobs : topMatches;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.companyName ?? "").toLowerCase().includes(q) ||
        (j.location ?? "").toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q),
    );
  }, [baseList, query]);

  const totalPages = showAll ? Math.ceil(filtered.length / PAGE_SIZE) : 1;
  const visibleJobs = showAll
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filtered;

  const handleToggle = (all: boolean) => {
    setShowAll(all);
    setPage(1);
  };

  const handleQuery = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const start = showAll ? (page - 1) * PAGE_SIZE + 1 : 1;
  const end = showAll ? Math.min(page * PAGE_SIZE, filtered.length) : filtered.length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          opportunities
        </p>
        <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-bold text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/60">
            <Briefcase className="h-4 w-4 text-zinc-400" />
          </div>
          Job Opportunities
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          {showAll
            ? `${allJobs.length} position${allJobs.length !== 1 ? "s" : ""} available`
            : `${topMatches.length} top match${topMatches.length !== 1 ? "es" : ""} for your profile`}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Search by title, company, location…"
            className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none focus:ring-2 focus:ring-white/5"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-1 backdrop-blur-sm">
          <button
            onClick={() => handleToggle(false)}
            className={[
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all",
              !showAll ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            <Sparkles className="h-3 w-3" />
            Top Matches
          </button>
          <button
            onClick={() => handleToggle(true)}
            className={[
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all",
              showAll ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            <LayoutList className="h-3 w-3" />
            All Jobs
          </button>
        </div>
      </div>

      {/* No profile notice */}
      {!hasProfile && !showAll && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3.5 text-sm text-amber-300/80">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
          Upload your resume to get personalized job matches based on your skills.
        </div>
      )}

      {/* Job list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-800/60 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-900/60">
            <Search className="h-6 w-6 text-zinc-600" />
          </div>
          <p className="font-medium text-zinc-300">
            {query ? "No jobs match your search" : "No jobs posted yet"}
          </p>
          <p className="mt-1.5 text-sm text-zinc-600">
            {query ? "Try a different keyword or clear the search" : "Check back soon for new opportunities"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} isWatchlisted={watchlistedSet.has(job.id)} />
          ))}
        </div>
      )}

      {/* Pagination + footer */}
      {filtered.length > 0 && (
        <div className="space-y-4 pt-2">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-zinc-700">
            {showAll
              ? `${start}–${end} of ${filtered.length} jobs`
              : `${filtered.length} match${filtered.length !== 1 ? "es" : ""}`}
            {query && ` · "${query}"`}
          </p>
        </div>
      )}
    </div>
  );
}
