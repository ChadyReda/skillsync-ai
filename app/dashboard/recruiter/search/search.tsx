"use client";

import { useState } from "react";
import Link from "next/link";
import { searchCandidates, toggleShortlist } from "./actions";
import {
  Search,
  Loader2,
  User,
  TrendingUp,
  Star,
  FileText,
  Target,
  ArrowRight,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

interface Candidate {
  userId: string;
  imageUrl?: string | null;
  fullName: string | null;
  bio: string | null;
  matchScore: number;
  resumeScore: number | null;
  level: number | null;
  xp: number | null;
  skills?: string[];
  isShortlisted: boolean;
}

export default function RecruiterSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Candidate[]>([]);
  const [searched, setSearched] = useState(false);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setSearched(true);
      const data = await searchCandidates(query);
      setResults(data);
      setShortlisted(
        new Set(data.filter((c) => c.isShortlisted).map((c) => c.userId)),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (userId: string) => {
    await toggleShortlist(userId);
    setShortlisted((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const matchBadgeClass = (score: number) => {
    if (score >= 80) return "border-emerald-500/40 text-emerald-300";
    if (score >= 60) return "border-amber-500/40 text-amber-300";
    return "border-zinc-700/60 text-zinc-300";
  };

  return (
    <div className="space-y-8">
      <div className="pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          [ 08 ] discovery
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <Search className="h-5 w-5" />
          Find Talent
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          AI-powered natural language candidate discovery
        </p>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm transition-all duration-200 focus-within:border-zinc-700/80"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
      >
        <div className="flex items-center gap-2 border-b border-zinc-800/60 px-4 py-2.5">
          <Target className="h-3.5 w-3.5 text-white" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            Describe your ideal candidate
          </span>
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. A React developer with 3+ years experience, strong TypeScript skills, and a passion for UI/UX..."
          rows={4}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSearch();
          }}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-white placeholder-zinc-600 focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-zinc-800/60 px-4 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Ctrl+Enter to search
          </p>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-2 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            style={query.trim() && !loading ? { boxShadow: "0 0 14px rgba(255,255,255,0.1)" } : undefined}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {searched && !loading && (
        <div>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            {results.length} candidate{results.length !== 1 ? "s" : ""} · ranked by match
          </p>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800/60 py-16 text-center backdrop-blur-sm">
              <User className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
              <p className="font-medium text-zinc-400">No matches found</p>
              <p className="mt-1 text-sm text-zinc-600">
                Try a different description
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((candidate) => {
                const isShortlisted = shortlisted.has(candidate.userId);
                return (
                  <div
                    key={candidate.userId}
                    className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50 sm:flex-row sm:items-start"
                    style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
                  >
                    <UserAvatar
                      imageUrl={candidate.imageUrl}
                      name={candidate.fullName ?? "Candidate"}
                      className="h-12 w-12"
                      textClassName="text-sm"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="text-[15px] font-semibold text-white">
                          {candidate.fullName ?? "Unknown"}
                        </h2>
                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm",
                            matchBadgeClass(candidate.matchScore),
                          ].join(" ")}
                        >
                          <Target className="h-3 w-3" />
                          {candidate.matchScore}% match
                        </span>
                      </div>

                      {candidate.bio && (
                        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                          {candidate.bio}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {candidate.level !== null && (
                          <Pill icon={TrendingUp}>L.{candidate.level}</Pill>
                        )}
                        {candidate.xp !== null && (
                          <Pill icon={Star}>{candidate.xp} XP</Pill>
                        )}
                        {candidate.resumeScore !== null && (
                          <Pill icon={FileText}>
                            Resume {candidate.resumeScore}/100
                          </Pill>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleShortlist(candidate.userId)}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200",
                          isShortlisted
                            ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                            : "border-zinc-700/60 bg-zinc-900/60 text-zinc-300 backdrop-blur-sm hover:border-zinc-500/60 hover:text-white",
                        ].join(" ")}
                        style={isShortlisted ? { boxShadow: "0 0 14px rgba(139,92,246,0.2)" } : undefined}
                      >
                        {isShortlisted ? (
                          <BookmarkCheck className="h-3.5 w-3.5" />
                        ) : (
                          <BookmarkPlus className="h-3.5 w-3.5" />
                        )}
                        {isShortlisted ? "Saved" : "Save"}
                      </button>
                      <Link
                        href={`/dashboard/candidates/${candidate.userId}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
                      >
                        Profile
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pill({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}
