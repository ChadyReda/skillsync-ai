import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bug } from "lucide-react";
import { ReportForm } from "@/components/report/report-form";

export const metadata: Metadata = {
  title: "Report an Issue — SkillSync",
  description:
    "Found a bug or rough edge? Help us shape SkillSync by submitting a report.",
};

export default function ReportIssuePage() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.1), transparent 70%)",
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to SkillSync
        </Link>
        <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 backdrop-blur-sm">
          <Bug className="h-3 w-3" />
          Beta Feedback
        </span>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-4">
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            [ feedback / bug-report ]
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Report an issue
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
            SkillSync is in beta. If something looks off, breaks, or just feels
            wrong — tell us. Your report opens a GitHub issue we triage
            directly.
          </p>
        </div>

        <ReportForm />

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-700">
          We only contact you for follow-up on this report.
        </p>
      </section>
    </main>
  );
}
