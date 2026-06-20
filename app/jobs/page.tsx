import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/src";
import { jobs } from "@/src/db/schemas/jobs";
import { desc } from "drizzle-orm";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Monitor,
  ArrowRight,
  Building2,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Job Board — SkillSync",
  description:
    "Browse AI-matched job opportunities and internships. Find your next role with SkillSync.",
  openGraph: {
    title: "Job Board — SkillSync",
    description: "Browse AI-matched job opportunities and internships.",
  },
};

const typeLabel: Record<string, string> = { job: "Full-time", internship: "Internship" };
const typeColor: Record<string, string> = {
  job: "border-sky-500/20 bg-sky-500/8 text-sky-400",
  internship: "border-violet-500/20 bg-violet-500/8 text-violet-400",
};
const workModeColors: Record<string, string> = {
  remote: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
  hybrid: "border-amber-500/20 bg-amber-500/8 text-amber-400",
  onsite: "border-zinc-700/50 bg-zinc-900/60 text-zinc-400",
};
const workModeLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `${currency ?? "USD"} ${Math.round(n / 1000)}k` : `${currency ?? "USD"} ${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export default async function PublicJobsPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  const allJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      type: jobs.type,
      workMode: jobs.workMode,
      location: jobs.location,
      companyName: jobs.companyName,
      description: jobs.description,
      skills: jobs.skills,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      salaryCurrency: jobs.salaryCurrency,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .orderBy(desc(jobs.createdAt));

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/60">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-[0.18em] text-white">SKILLSYNC</span>
          </Link>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
            >
              Workspace →
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
            >
              Sign in to apply →
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-12">
        {/* Hero */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            {allJobs.length} open position{allJobs.length !== 1 ? "s" : ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Find your next role
          </h1>
          <p className="mt-2 text-base text-zinc-400">
            AI-matched opportunities from companies hiring now.
          </p>
        </div>

        {/* Job list */}
        {allJobs.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-800/60 py-24 text-center">
            <Briefcase className="mb-4 h-10 w-10 text-zinc-700" />
            <p className="font-medium text-zinc-400">No positions posted yet</p>
            <p className="mt-1 text-sm text-zinc-600">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allJobs.map((job) => {
              const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
              const modeCls = workModeColors[job.workMode ?? "onsite"] ?? workModeColors.onsite;
              const typeCls = typeColor[job.type] ?? "border-zinc-700/50 bg-zinc-900/60 text-zinc-400";

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/50 sm:flex-row sm:items-start"
                  style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.3)" }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/80">
                    <Building2 className="h-5 w-5 text-zinc-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <h2 className="text-[15px] font-semibold text-white">{job.title}</h2>
                      <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${typeCls}`}>
                        {typeLabel[job.type] ?? job.type}
                      </span>
                      {job.workMode && (
                        <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${modeCls}`}>
                          {workModeLabels[job.workMode] ?? job.workMode}
                        </span>
                      )}
                    </div>

                    <p className="mb-2 text-sm font-medium text-zinc-400">{job.companyName}</p>

                    <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      {salary && (
                        <span className="flex items-center gap-1.5 text-emerald-400/70">
                          <DollarSign className="h-3 w-3" />
                          {salary}
                        </span>
                      )}
                      {job.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {new Date(job.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map((s) => (
                          <span key={s} className="rounded-md border border-zinc-800/60 bg-zinc-900/60 px-2 py-0.5 font-mono text-[9px] text-zinc-500">
                            {s}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="rounded-md border border-zinc-800/60 px-2 py-0.5 font-mono text-[9px] text-zinc-600">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all group-hover:border-white/20 group-hover:bg-white group-hover:text-black">
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
