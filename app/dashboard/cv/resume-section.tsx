"use client";

import { useState, useTransition } from "react";
import ResumeUpload from "@/components/resume-upload";
import { saveResume, togglePublicProfile } from "./actions";
import {
  FileText,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  ExternalLink,
  Loader2,
  RotateCcw,
  Globe,
  Link2,
  Lock,
} from "lucide-react";

interface ResumeInsights {
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  recommendedRoles?: string[];
  score?: number;
}

interface ResumeData {
  skills?: string[];
  [key: string]: unknown;
}

interface Props {
  initialResumeUrl: string;
  initialResumeScore: number;
  initialResumeInsights: ResumeInsights | null;
  initialResumeData: ResumeData | null;
  isPublic: boolean;
  publicUsername: string | null;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const strokeColor = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";
  const glowColor =
    score >= 80 ? "rgba(52,211,153,0.4)" : score >= 60 ? "rgba(251,191,36,0.4)" : "rgba(248,113,113,0.35)";

  return (
    <div
      className="relative flex h-24 w-24 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
      style={{ boxShadow: `0 0 24px ${glowColor}` }}
    >
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={radius} stroke="#27272a" strokeWidth="5" fill="none" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={strokeColor}
          strokeWidth="5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${glowColor})` }}
        />
      </svg>
      <div className="text-center">
        <div className="text-2xl font-bold leading-none text-white tabular-nums">{score}</div>
        <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">/ 100</div>
      </div>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-5 rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-6 backdrop-blur-sm">
        <div className="h-24 w-24 rounded-lg bg-zinc-900/60" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 rounded-lg bg-zinc-900/60" />
          <div className="h-2 w-full rounded-full bg-zinc-900/60" />
          <div className="h-2 w-4/5 rounded-full bg-zinc-900/60" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-5 backdrop-blur-sm">
            <div className="h-3 w-1/3 rounded-full bg-zinc-900/60" />
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-zinc-900/60" />
              <div className="h-2 w-5/6 rounded-full bg-zinc-900/60" />
              <div className="h-2 w-4/6 rounded-full bg-zinc-900/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicProfileCard({
  isPublic,
  publicUsername,
}: {
  isPublic: boolean;
  publicUsername: string | null;
}) {
  const [enabled, setEnabled] = useState(isPublic);
  const [slug, setSlug] = useState(publicUsername ?? "");
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const profileUrl = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${slug}` : "";

  const handleToggle = () => {
    startTransition(async () => {
      const result = await togglePublicProfile(!enabled, slug || undefined);
      setEnabled(!enabled);
      if (result.slug) setSlug(result.slug);
    });
  };

  const handleCopy = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-5 backdrop-blur-sm"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Globe className="h-4 w-4 text-emerald-400" />
          ) : (
            <Lock className="h-4 w-4 text-zinc-500" />
          )}
          <div>
            <p className="text-sm font-medium text-white">Public Profile</p>
            <p className="text-xs text-zinc-500">
              {enabled ? "Your profile is visible to anyone with the link" : "Only visible to you"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={pending}
          className={[
            "relative h-5 w-9 rounded-full border transition-all",
            enabled ? "border-white/30 bg-white" : "border-zinc-700 bg-zinc-900",
            pending ? "opacity-50" : "",
          ].join(" ")}
        >
          {pending ? (
            <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-zinc-500" />
          ) : (
            <span
              className={[
                "absolute top-0.5 h-4 w-4 rounded-full transition-transform",
                enabled ? "translate-x-4 bg-black" : "translate-x-0.5 bg-zinc-600",
              ].join(" ")}
            />
          )}
        </button>
      </div>

      {enabled && slug && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 overflow-hidden rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
            <p className="truncate font-mono text-[11px] text-zinc-400">/profile/{slug}</p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
          >
            <Link2 className="h-3 w-3" />
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={`/profile/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
        </div>
      )}
    </div>
  );
}

export default function ResumeSection({
  initialResumeUrl,
  initialResumeScore,
  initialResumeInsights,
  initialResumeData,
  isPublic,
  publicUsername,
}: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(initialResumeUrl);
  const [score, setScore] = useState(initialResumeScore);
  const [insights, setInsights] = useState<ResumeInsights | null>(initialResumeInsights);
  const [resumeData, setResumeData] = useState<ResumeData | null>(initialResumeData);

  const handleUploadComplete = async (url: string) => {
    setAnalyzing(true);
    try {
      const result = await saveResume(url);
      setResumeUrl(url);
      setScore(result.resumeScore ?? 0);
      setInsights(result.resumeInsights as ResumeInsights);
      setResumeData(result.resumeData as ResumeData);
    } finally {
      setAnalyzing(false);
    }
  };

  const hasData = score > 0 || insights;
  const skills = resumeData?.skills ?? [];
  const scoreLabel = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score > 0 ? "Needs work" : "";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          [ 02 ] career artifact
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <FileText className="h-5 w-5" />
          Resume
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Upload your CV and get AI-powered analysis</p>
      </div>

      {/* Upload zone */}
      <ResumeUpload onUploadStart={() => setAnalyzing(true)} onComplete={handleUploadComplete} />

      {/* Public profile card */}
      <PublicProfileCard isPublic={isPublic} publicUsername={publicUsername} />

      {/* Analyzing state */}
      {analyzing && (
        <div
          className="flex items-center gap-4 rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-5 backdrop-blur-sm"
          style={{ boxShadow: "0 0 30px rgba(139,92,246,0.08)" }}
        >
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-white" />
          <div>
            <p className="text-sm font-medium text-white">Analyzing your resume...</p>
            <p className="mt-0.5 text-xs text-zinc-500">AI is extracting skills, scoring your CV, and generating insights</p>
          </div>
        </div>
      )}

      {analyzing && <AnalysisSkeleton />}

      {/* Results */}
      {!analyzing && hasData && (
        <div className="space-y-4">
          {/* Score + summary */}
          <div
            className="rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-6 backdrop-blur-sm"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
          >
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={score} />
                {scoreLabel && (
                  <span className="rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
                    {scoreLabel}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">AI Summary</p>
                {insights?.summary ? (
                  <p className="text-sm leading-relaxed text-zinc-300">{insights.summary}</p>
                ) : (
                  <p className="text-sm text-zinc-500">No summary available.</p>
                )}
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-600/60 hover:text-white"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View uploaded CV
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div
              className="rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-5 backdrop-blur-sm"
              style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
            >
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Detected Skills</p>
              <div className="flex flex-wrap gap-2">
                {(skills as string[]).map((skill, i) => (
                  <span key={i} className="rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 backdrop-blur-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {(insights?.strengths?.length ?? 0) > 0 && (
              <div
                className="rounded-lg border border-emerald-500/15 bg-zinc-950/60 p-5 backdrop-blur-sm"
                style={{ boxShadow: "0 0 20px rgba(16,185,129,0.06)" }}
              >
                <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px rgba(52,211,153,0.7)" }} />
                  Strengths
                </p>
                <ul className="space-y-2">
                  {insights!.strengths!.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(insights?.improvements?.length ?? 0) > 0 && (
              <div
                className="rounded-lg border border-amber-500/15 bg-zinc-950/60 p-5 backdrop-blur-sm"
                style={{ boxShadow: "0 0 20px rgba(245,158,11,0.06)" }}
              >
                <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" style={{ boxShadow: "0 0 5px rgba(251,191,36,0.7)" }} />
                  Improvements
                </p>
                <ul className="space-y-2">
                  {insights!.improvements!.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(insights?.recommendedRoles?.length ?? 0) > 0 && (
            <div
              className="rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-5 backdrop-blur-sm"
              style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
            >
              <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                <Briefcase className="h-3 w-3" />
                Recommended Roles
              </p>
              <div className="flex flex-wrap gap-2">
                {insights!.recommendedRoles!.map((role, i) => (
                  <span
                    key={i}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                    style={{ boxShadow: "0 0 10px rgba(255,255,255,0.06)" }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!analyzing && !hasData && (
        <div className="rounded-lg border border-dashed border-zinc-800/60 py-12 text-center backdrop-blur-sm">
          <FileText className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="font-medium text-zinc-400">No resume analyzed yet</p>
          <p className="mt-1 text-sm text-zinc-600">Upload your PDF above to get AI-powered insights</p>
        </div>
      )}
    </div>
  );
}
