import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { jobs } from "@/src/db/schemas/jobs";
import { jobApplications } from "@/src/db/schemas/job-applications";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { eq } from "drizzle-orm";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  ClipboardList,
  ArrowRight,
  FileText,
  TrendingUp,
  Star,
} from "lucide-react";

const statusConfig: Record<
  string,
  { dot: string; label: string; border: string; bg: string; text: string }
> = {
  pending: {
    dot: "bg-amber-400",
    label: "Pending",
    border: "border-amber-500/30",
    bg: "bg-amber-500/[0.06]",
    text: "text-amber-300",
  },
  reviewed: {
    dot: "bg-zinc-400",
    label: "Reviewed",
    border: "border-zinc-700/50",
    bg: "bg-zinc-900/60",
    text: "text-zinc-300",
  },
  accepted: {
    dot: "bg-emerald-400",
    label: "Accepted",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/[0.06]",
    text: "text-emerald-300",
  },
  rejected: {
    dot: "bg-rose-400",
    label: "Rejected",
    border: "border-rose-500/30",
    bg: "bg-rose-500/[0.06]",
    text: "text-rose-300",
  },
};

export default async function ApplicationsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [recruiter] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!recruiter) return null;

  const applications = await db
    .select({
      applicationId: jobApplications.id,
      status: jobApplications.status,
      appliedAt: jobApplications.createdAt,
      jobTitle: jobs.title,
      candidateId: users.id,
      candidateName: candidateProfiles.fullName,
      level: candidateProfiles.level,
      xp: candidateProfiles.xp,
      resumeScore: candidateProfiles.resumeScore,
      resumeUrl: jobApplications.resumeUrl,
      imageUrl: users.imageUrl,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .innerJoin(users, eq(users.id, jobApplications.candidateId))
    .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(jobs.recruiterId, recruiter.id));

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          [ 11 ] pipeline
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <ClipboardList className="h-5 w-5" />
          Applications
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {applications.length} application{applications.length !== 1 ? "s" : ""} received
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/60 py-16 text-center backdrop-blur-sm">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="font-medium text-zinc-400">No applications yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Applications will appear here when candidates apply
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => {
            const cfg =
              statusConfig[application.status ?? "pending"] ??
              statusConfig["pending"];

            return (
              <div
                key={application.applicationId}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50 sm:flex-row sm:items-start"
                style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
              >
                <UserAvatar
                  imageUrl={application.imageUrl}
                  name={application.candidateName ?? "?"}
                  className="h-11 w-11"
                  textClassName="text-sm"
                />

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-white">
                      {application.candidateName ?? "Unknown Candidate"}
                    </h2>
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm",
                        cfg.border,
                        cfg.bg,
                        cfg.text,
                      ].join(" ")}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  <p className="mb-3 text-sm text-zinc-400">
                    Applied for:{" "}
                    <span className="font-medium text-zinc-200">
                      {application.jobTitle}
                    </span>
                  </p>

                  <div className="mb-2 flex flex-wrap gap-2">
                    <Pill icon={TrendingUp}>L.{application.level ?? 1}</Pill>
                    <Pill icon={Star}>{application.xp ?? 0} XP</Pill>
                    {application.resumeScore && (
                      <Pill icon={FileText}>
                        Resume {application.resumeScore}/100
                      </Pill>
                    )}
                  </div>

                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                    Applied{" "}
                    {application.appliedAt
                      ? new Date(application.appliedAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {application.resumeUrl && (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500/60 hover:text-white"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      CV
                    </a>
                  )}
                  <Link
                    href={`/dashboard/candidates/${application.candidateId}`}
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
