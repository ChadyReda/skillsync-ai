"use client";

import { useState, useTransition } from "react";
import { matchResumeToJob, type MatchResult } from "./match-action";
import {
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export function MatchButton({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = () => {
    setError(null);
    setResult(null);
    setOpen(true);
    startTransition(async () => {
      try {
        const res = await matchResumeToJob(jobId);
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed.");
      }
    });
  };

  const scoreColor =
    !result ? ""
    : result.score >= 70 ? "text-emerald-400"
    : result.score >= 40 ? "text-amber-400"
    : "text-rose-400";

  const scoreBg =
    !result ? ""
    : result.score >= 70 ? "border-emerald-500/30 bg-emerald-500/[0.06]"
    : result.score >= 40 ? "border-amber-500/30 bg-amber-500/[0.06]"
    : "border-rose-500/30 bg-rose-500/[0.06]";

  return (
    <>
      <button
        onClick={run}
        className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/[0.06] px-4 py-2.5 text-sm font-medium text-violet-300 backdrop-blur-sm transition-all hover:border-violet-400/50 hover:bg-violet-500/10"
        style={{ boxShadow: "0 0 12px rgba(139,92,246,0.1)" }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Match my resume
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-800/60 bg-zinc-950 backdrop-blur-sm"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.05) inset, 0 24px 64px rgba(0,0,0,0.6)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-300">
                  Resume Match Analysis
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-1.5 text-zinc-500 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {pending && (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                  <div>
                    <p className="font-medium text-white">Analysing your resume</p>
                    <p className="mt-1 text-sm text-zinc-500">Comparing skills and experience against this job…</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] px-4 py-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <p className="text-sm text-rose-300">{error}</p>
                </div>
              )}

              {result && (
                <div className="space-y-5">
                  {/* Score */}
                  <div className={`flex items-center gap-4 rounded-xl border p-4 ${scoreBg}`}>
                    <div className={`text-4xl font-bold tabular-nums ${scoreColor}`}>
                      {result.score}
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Match score</p>
                      <p className="mt-0.5 text-sm text-zinc-300">{result.summary}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.matchedSkills.length > 0 && (
                      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
                        <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          Matched
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedSkills.map((s) => (
                            <span key={s} className="rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.missingSkills.length > 0 && (
                      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
                        <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                          <XCircle className="h-3 w-3 text-rose-400" />
                          Missing
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingSkills.map((s) => (
                            <span key={s} className="rounded-md border border-rose-500/20 bg-rose-500/8 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
                      <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                        How to improve
                      </p>
                      <ul className="space-y-2">
                        {result.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
