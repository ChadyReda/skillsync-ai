import type { Metadata } from "next";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { jobs } from "@/src/db/schemas/jobs";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  FileText,
  DollarSign,
  Monitor,
  LogIn,
  ArrowRight,
} from "lucide-react";

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

type Props = { params: Promise<{ jobId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { jobId } = await params;
  const [job] = await db.select({ title: jobs.title, companyName: jobs.companyName, description: jobs.description })
    .from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!job) return { title: "Job Not Found — SkillSync" };
  return {
    title: `${job.title} at ${job.companyName ?? "Company"} — SkillSync`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: `${job.title} at ${job.companyName ?? "Company"}`,
      description: job.description.slice(0, 160),
    },
  };
}

export default async function PublicJobDetailPage({ params }: Props) {
  const { jobId } = await params;

  const [job, dbUser] = await Promise.all([
    db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1).then((r) => r[0]),
    getCurrentDbUser(),
  ]);

  if (!job) notFound();

  const isSignedIn = !!dbUser;
  const isCandidate = dbUser?.role === "candidate";

  const label = typeLabel[job.type] ?? job.type;
  const badgeColor = typeColor[job.type] ?? "border-zinc-700/50 bg-zinc-900/60 text-zinc-400";
  const modeCls = workModeColors[job.workMode ?? "onsite"] ?? workModeColors.onsite;
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    hiringOrganization: { "@type": "Organization", name: job.companyName ?? "" },
    jobLocation: job.location ? { "@type": "Place", name: job.location } : undefined,
    employmentType: job.type === "job" ? "FULL_TIME" : "INTERN",
    datePosted: job.createdAt?.toISOString(),
    baseSalary: job.salaryMin
      ? {
          "@type": "MonetaryAmount",
          currency: job.salaryCurrency ?? "USD",
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salaryMin,
            maxValue: job.salaryMax ?? undefined,
            unitText: "YEAR",
          },
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/jobs" className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-all hover:border-zinc-700 hover:text-zinc-200">
            <ArrowLeft className="h-3 w-3" />
            All jobs
          </Link>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
            >
              Workspace →
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
              style={{ boxShadow: "0 0 14px rgba(255,255,255,0.08)" }}
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in to apply
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
        {/* Header card */}
        <div
          className="rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-6 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 32px rgba(0,0,0,0.4)" }}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-900/80">
              <Building2 className="h-6 w-6 text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{job.title}</h1>
                <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${badgeColor}`}>
                  {label}
                </span>
                {job.workMode && (
                  <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${modeCls}`}>
                    <Monitor className="mr-1 inline h-2.5 w-2.5" />
                    {workModeLabels[job.workMode] ?? job.workMode}
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm font-medium text-zinc-400">{job.companyName}</p>
              <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
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
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div
            className="rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-6 backdrop-blur-sm"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
          >
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-xs text-zinc-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description + Requirements */}
        <div
          className="rounded-2xl border border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
        >
          <div className="p-6">
            <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              <Briefcase className="h-3 w-3" />
              Description
            </p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{job.description}</p>
          </div>
          {job.requirements && (
            <>
              <div className="mx-6 border-t border-zinc-800/60" />
              <div className="p-6">
                <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  <FileText className="h-3 w-3" />
                  Requirements
                </p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{job.requirements}</p>
              </div>
            </>
          )}
        </div>

        {/* Apply CTA */}
        <div
          className="rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-6 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
        >
          {isCandidate ? (
            <>
              <p className="mb-1 text-base font-semibold text-white">Ready to apply?</p>
              <p className="mb-4 text-sm text-zinc-500">
                Apply using your AI-analysed resume and get an instant match score.
              </p>
              <Link
                href={`/dashboard/jobs/${job.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
                style={{ boxShadow: "0 0 16px rgba(255,255,255,0.1)" }}
              >
                Apply for this job
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : isSignedIn ? (
            <>
              <p className="mb-1 text-base font-semibold text-white">Looking to hire?</p>
              <p className="mb-4 text-sm text-zinc-500">
                Head to your recruiter dashboard to post and manage positions.
              </p>
              <Link
                href="/dashboard/recruiter/jobs"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-5 py-3 text-sm font-semibold text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
              >
                Go to job dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <p className="mb-1 text-base font-semibold text-white">Ready to apply?</p>
              <p className="mb-4 text-sm text-zinc-500">
                Create your free SkillSync account to apply with your AI-analysed resume.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
                style={{ boxShadow: "0 0 16px rgba(255,255,255,0.1)" }}
              >
                <LogIn className="h-4 w-4" />
                Create free account & apply
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
