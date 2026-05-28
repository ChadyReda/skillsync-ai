"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { generateEmail } from "./actions";
import type { ShortlistedCandidate } from "./actions";
import {
  Loader2,
  Copy,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  Mail,
  GitBranch,
  FileText,
  TrendingUp,
  Search,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type Tone = "professional" | "casual" | "enthusiastic";

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  {
    value: "professional",
    label: "Professional",
    description: "Formal and polished",
  },
  { value: "casual", label: "Casual", description: "Warm and conversational" },
  {
    value: "enthusiastic",
    label: "Enthusiastic",
    description: "Energetic and exciting",
  },
];

interface GeneratedEmail {
  subject: string;
  body: string;
}

interface Props {
  candidates: ShortlistedCandidate[];
}

export default function OutreachClient({ candidates }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    candidates[0]?.candidateId ?? null,
  );
  const [tone, setTone] = useState<Tone>("professional");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<GeneratedEmail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selected = candidates.find((c) => c.candidateId === selectedId);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setEmail(null);

    const result = await generateEmail(
      selectedId,
      tone,
      jobTitle || undefined,
    );

    if ("error" in result) {
      setError(result.error);
    } else {
      setEmail(result);
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!email) return;
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGmail = () => {
    if (!email || !selected) return;
    const to = encodeURIComponent(selected.email);
    const subject = encodeURIComponent(email.subject);
    const body = encodeURIComponent(email.body);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`,
      "_blank",
    );
  };

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800/60 py-20 text-center backdrop-blur-sm">
        <Mail className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
        <p className="font-medium text-zinc-400">No candidates shortlisted</p>
        <p className="mb-6 mt-1 text-sm text-zinc-600">
          Shortlist candidates before generating outreach emails
        </p>
        <Link
          href="/dashboard/recruiter/search"
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100"
          style={{ boxShadow: "0 0 16px rgba(255,255,255,0.1)" }}
        >
          <Search className="h-4 w-4" />
          Find Candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        {/* Candidate Selector */}
        <Panel title="Select Candidate">
          <div className="max-h-72 overflow-y-auto">
            {candidates.map((c) => {
              const active = selectedId === c.candidateId;
              return (
                <button
                  key={c.candidateId}
                  onClick={() => {
                    setSelectedId(c.candidateId);
                    setEmail(null);
                    setError(null);
                  }}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-300 hover:bg-white/[0.04]",
                  ].join(" ")}
                  style={active ? { boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset" } : undefined}
                >
                  <UserAvatar
                    imageUrl={c.imageUrl}
                    name={c.fullName ?? c.email}
                    className="h-9 w-9 shrink-0"
                    textClassName="text-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {c.fullName ?? "Unknown"}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      {c.resumeScore !== null && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-2.5 w-2.5" />
                          {c.resumeScore}/100
                        </span>
                      )}
                      {c.githubUsername && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-2.5 w-2.5" />
                          {c.githubUsername}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Email Tone">
          <div className="space-y-1">
            {TONE_OPTIONS.map((t) => {
              const active = tone === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={[
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-300 hover:bg-white/[0.04]",
                  ].join(" ")}
                  style={active ? { boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset" } : undefined}
                >
                  <div>
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-zinc-500">{t.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Job Reference (optional)">
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full rounded-b-2xl bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
          />
        </Panel>

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedId}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          style={!loading && selectedId ? { boxShadow: "0 0 20px rgba(255,255,255,0.12)" } : undefined}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Generating..." : email ? "Regenerate" : "Generate Email"}
        </button>
      </div>

      {/* Right Panel: Email Preview */}
      <div className="space-y-4">
        {selected && (
          <div
            className="flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 backdrop-blur-sm"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
          >
            <UserAvatar
              imageUrl={selected.imageUrl}
              name={selected.fullName ?? selected.email}
              className="h-10 w-10 shrink-0"
              textClassName="text-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">
                {selected.fullName ?? "Unknown Candidate"}
              </div>
              <div className="truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                {selected.email}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {selected.level !== null && (
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
                  <TrendingUp className="h-3 w-3" />L{selected.level}
                </span>
              )}
              {selected.githubUsername && (
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
                  <GitBranch className="h-3 w-3" />
                  GitHub
                </span>
              )}
              <Link
                href={`/dashboard/candidates/${selected.candidateId}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
              >
                Profile
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {loading && (
          <div
            className="animate-pulse space-y-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-6 backdrop-blur-sm"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                AI crafting personalized email...
              </span>
            </div>
            <div className="h-4 w-2/3 rounded-lg bg-zinc-900/60" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full rounded-full bg-zinc-900/60" />
              <div className="h-3 w-5/6 rounded-full bg-zinc-900/60" />
              <div className="h-3 w-4/5 rounded-full bg-zinc-900/60" />
              <div className="h-3 w-full rounded-full bg-zinc-900/60" />
              <div className="h-3 w-3/4 rounded-full bg-zinc-900/60" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/[0.06] p-5 text-sm text-rose-300 backdrop-blur-sm">
            {error}
          </div>
        )}

        {email && !loading && (
          <div
            className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
          >
            <div className="space-y-3 border-b border-zinc-800/60 p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                <span className="text-zinc-400">To:</span>
                <span>{selected?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  Subject:
                </span>
                <span className="text-sm font-semibold text-white">
                  {email.subject}
                </span>
              </div>
            </div>

            <div className="p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-300">
                {email.body}
              </pre>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800/60 p-4">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500/60 hover:text-white"
              >
                {copied ? (
                  <>
                    <CheckCheck className="h-4 w-4 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Email
                  </>
                )}
              </button>

              <button
                onClick={handleGmail}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100"
                style={{ boxShadow: "0 0 14px rgba(255,255,255,0.1)" }}
              >
                <ExternalLink className="h-4 w-4" />
                Open in Gmail
              </button>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="ml-auto inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500/60 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
            </div>
          </div>
        )}

        {!email && !loading && !error && (
          <div className="rounded-2xl border border-dashed border-zinc-800/60 p-12 text-center backdrop-blur-sm">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
              style={{ boxShadow: "0 0 20px rgba(139,92,246,0.08)" }}
            >
              <Mail className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="font-medium text-zinc-400">
              Your AI-crafted email will appear here
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Select a candidate and click Generate Email
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
    >
      <p className="border-b border-zinc-800/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </p>
      <div className="p-2">{children}</div>
    </div>
  );
}
