"use client";

import { useState } from "react";
import Link from "next/link";
import { removeFromShortlist } from "./actions";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Trash2,
  ArrowRight,
  FileText,
  TrendingUp,
  Star,
  Loader2,
} from "lucide-react";

interface Candidate {
  candidateId: string;
  fullName: string | null;
  bio: string | null;
  resumeScore: number | null;
  level: number | null;
  xp: number | null;
  skills: string[] | null;
  imageUrl: string | null;
}

export default function ShortlistClient({
  initialCandidates,
}: {
  initialCandidates: Candidate[];
}) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (candidateId: string) => {
    setRemovingId(candidateId);
    setCandidates((prev) => prev.filter((c) => c.candidateId !== candidateId));
    try {
      await removeFromShortlist(candidateId);
    } catch {
      setCandidates(initialCandidates);
    } finally {
      setRemovingId(null);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800/60 py-16 text-center backdrop-blur-sm">
        <Star className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
        <p className="font-medium text-zinc-400">No candidates shortlisted</p>
        <p className="mt-1 text-sm text-zinc-600">
          Save candidates from the search page
        </p>
        <Link
          href="/dashboard/recruiter/search"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500/60 hover:text-white"
        >
          Search Candidates
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.map((candidate) => (
        <div
          key={candidate.candidateId}
          className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50 sm:flex-row sm:items-start"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
        >
          <UserAvatar
            imageUrl={candidate.imageUrl}
            name={candidate.fullName ?? "?"}
            className="h-12 w-12"
            textClassName="text-sm"
          />

          <div className="min-w-0 flex-1">
            <h2 className="mb-1 text-[15px] font-semibold text-white">
              {candidate.fullName ?? "Unknown Candidate"}
            </h2>
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
                <Pill icon={FileText}>Resume {candidate.resumeScore}/100</Pill>
              )}
            </div>

            {candidate.skills && candidate.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {candidate.skills.slice(0, 5).map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-0.5 text-xs text-zinc-400 backdrop-blur-sm"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 5 && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                    +{candidate.skills.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => handleRemove(candidate.candidateId)}
              disabled={removingId === candidate.candidateId}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/[0.06] px-3 py-2 text-sm font-medium text-rose-300 backdrop-blur-sm transition-all hover:border-rose-400/60 hover:bg-rose-500/10 disabled:opacity-50"
              style={{ boxShadow: "0 0 12px rgba(248,113,113,0.08)" }}
            >
              {removingId === candidate.candidateId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove
            </button>
            <Link
              href={`/dashboard/candidates/${candidate.candidateId}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
            >
              Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ))}
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
