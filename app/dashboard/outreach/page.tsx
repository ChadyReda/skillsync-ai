import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { getShortlistedCandidates } from "./actions";
import OutreachClient from "./outreach-client";

export default async function OutreachPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "recruiter") redirect("/dashboard");

  const candidates = await getShortlistedCandidates();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex items-start justify-between gap-4 pb-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            [ 12 ] outreach
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
            <Mail className="h-5 w-5" />
            AI Outreach
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Generate personalized outreach emails for shortlisted candidates
          </p>
        </div>

        <div
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400 backdrop-blur-sm"
          style={{ boxShadow: "0 0 10px rgba(16,185,129,0.15)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            style={{ boxShadow: "0 0 5px rgba(52,211,153,0.7)" }}
          />
          AI-Powered
        </div>
      </div>

      <div
        className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 px-5 py-4 backdrop-blur-sm"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
      >
        <div className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white" style={{ boxShadow: "0 0 5px rgba(255,255,255,0.5)" }} />
            Select a candidate
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            Choose tone
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px rgba(52,211,153,0.7)" }} />
            Send or copy
          </div>
        </div>
      </div>

      <OutreachClient candidates={candidates} />
    </div>
  );
}
