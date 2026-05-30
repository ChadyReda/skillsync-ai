import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src";
import { jobs } from "@/src/db/schemas/jobs";
import { jobApplications } from "@/src/db/schemas/job-applications";
import { jobWatchlist } from "@/src/db/schemas/job-watchlist";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import ApplyButton from "./apply-button";
import { WatchlistButton } from "@/components/jobs/watchlist-button";

const typeLabel: Record<string, string> = {
  job: "Full-time",
  internship: "Internship",
};

type Props = { params: Promise<{ jobId: string }> };

export default async function JobPage({ params }: Props) {
  const { jobId } = await params;

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);
  if (!dbUser) redirect("/");

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!job) notFound();

  const [candidateProfile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser.id))
    .limit(1);

  const [[existingApplication], [watchlistEntry]] = await Promise.all([
    db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, job.id),
          eq(jobApplications.candidateId, dbUser.id),
        ),
      )
      .limit(1),
    db
      .select()
      .from(jobWatchlist)
      .where(
        and(
          eq(jobWatchlist.jobId, job.id),
          eq(jobWatchlist.candidateId, dbUser.id),
        ),
      )
      .limit(1),
  ]);

  async function apply() {
    "use server";
    const [alreadyApplied] = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, job.id),
          eq(jobApplications.candidateId, dbUser.id),
        ),
      )
      .limit(1);
    if (alreadyApplied) return;
    await db.insert(jobApplications).values({
      jobId: job.id,
      candidateId: dbUser.id,
      resumeUrl: candidateProfile?.resumeUrl ?? "",
      status: "pending",
    });
  }

  const label = typeLabel[job.type] ?? job.type;
  const isRecruiter = dbUser.role === "recruiter";
  const hasResume = !!candidateProfile?.resumeUrl;
  const resumeUrl = candidateProfile?.resumeUrl ?? "";
  const isWatchlisted = !!watchlistEntry;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-zinc-200"
      >
        <ArrowLeft className="h-3 w-3" />
        All jobs
      </Link>

      {/* Header card */}
      <div className="border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-zinc-800 bg-black">
            <Building2 className="h-6 w-6 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
              <span className="border border-zinc-700 bg-black px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                {label}
              </span>
              {!isRecruiter && (
                <WatchlistButton jobId={job.id} initialWatchlisted={isWatchlisted} />
              )}
            </div>

            <p className="mb-3 text-sm text-zinc-400">{job.companyName}</p>

            <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {job.location}
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
          </div>
        </div>
      </div>

      {/* Description + Requirements */}
      <div className="space-y-6 border border-zinc-800 bg-zinc-950 p-6">
        <div>
          <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <Briefcase className="h-3 w-3" />
            Description
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {job.description}
          </p>
        </div>

        {job.requirements && (
          <>
            <div className="border-t border-zinc-800" />
            <div>
              <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                <FileText className="h-3 w-3" />
                Requirements
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {job.requirements}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Apply section */}
      <div className="space-y-5 border border-zinc-800 bg-zinc-950 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Apply
        </p>

        {isRecruiter ? (
          <div className="flex items-center gap-3 border border-zinc-800 bg-black px-5 py-4">
            <AlertTriangle className="h-4 w-4 shrink-0 text-zinc-500" />
            <p className="text-sm text-zinc-400">
              Recruiters cannot apply to job listings.
            </p>
          </div>
        ) : !hasResume ? (
          <div className="flex items-start gap-3 border border-amber-500/40 bg-amber-500/5 px-5 py-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">
                No CV uploaded
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Upload your resume before applying.{" "}
                <Link
                  href="/dashboard/cv"
                  className="text-white underline underline-offset-2 hover:text-zinc-300"
                >
                  Go to CV page →
                </Link>
              </p>
            </div>
          </div>
        ) : existingApplication ? (
          <div className="flex items-center gap-3 border border-emerald-500/40 bg-emerald-500/5 px-5 py-4">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Already applied
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Your application is under review.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <FileText className="h-3 w-3" />
                  Your CV
                </p>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 border border-zinc-700 bg-black px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </div>
              <div className="h-[480px] overflow-hidden border border-zinc-800 bg-black">
                <iframe src={resumeUrl} className="h-full w-full" />
              </div>
            </div>

            <ApplyButton action={apply} />
          </div>
        )}
      </div>
    </div>
  );
}
