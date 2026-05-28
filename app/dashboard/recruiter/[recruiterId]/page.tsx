import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { recruiterProfiles } from "@/src/db/schemas/recruiter";
import { jobs } from "@/src/db/schemas/jobs";
import { getCurrentDbUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  Globe,
  MapPin,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

function timeAgo(date: Date | null): string {
  if (!date) return "";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default async function RecruiterProfilePage({
  params,
}: {
  params: Promise<{ recruiterId: string }>;
}) {
  const { recruiterId } = await params;
  const currentUser = await getCurrentDbUser();

  const [profile] = await db
    .select({
      userId: users.id,
      email: users.email,
      imageUrl: users.imageUrl,
      role: users.role,
      companyName: recruiterProfiles.companyName,
      position: recruiterProfiles.position,
      companyWebsite: recruiterProfiles.companyWebsite,
    })
    .from(users)
    .leftJoin(recruiterProfiles, eq(recruiterProfiles.userId, users.id))
    .where(eq(users.id, recruiterId))
    .limit(1);

  if (!profile || profile.role !== "recruiter") notFound();

  const postedJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.recruiterId, recruiterId))
    .orderBy(desc(jobs.createdAt));

  const isCandidate = currentUser?.role === "candidate";
  const displayName = profile.companyName || profile.email;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Back */}
      <Link
        href="/dashboard/feed"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to feed
      </Link>

      {/* Profile header */}
      <div
        className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500/40 via-violet-500/40 to-transparent" />

        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
          <UserAvatar
            imageUrl={profile.imageUrl}
            name={displayName ?? ""}
            className="h-20 w-20 rounded-xl text-2xl"
          />

          <div className="flex-1 space-y-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                [ recruiter / organization ]
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white">
                {displayName}
              </h1>
              {profile.position && (
                <p className="mt-1 text-sm text-zinc-400">{profile.position}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.companyName && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  <Building2 className="h-3 w-3" />
                  {profile.companyName}
                </span>
              )}
              {profile.companyWebsite && (
                <a
                  href={profile.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
                >
                  <Globe className="h-3 w-3" />
                  Website
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                <Briefcase className="h-3 w-3" />
                {postedJobs.length} {postedJobs.length === 1 ? "job" : "jobs"} posted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
              [ open positions ]
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">
              Jobs by {profile.companyName || "this recruiter"}
            </h2>
          </div>
        </div>

        {postedJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800/60 px-6 py-14 text-center">
            <Briefcase className="mx-auto mb-3 h-9 w-9 text-zinc-700" />
            <p className="font-medium text-zinc-500">No open positions</p>
            <p className="mt-1 text-sm text-zinc-700">
              This organization hasn&apos;t posted any jobs yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {postedJobs.map((job) => (
              <div
                key={job.id}
                className="group overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50"
                style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
              >
                <div className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white">
                          {job.title}
                        </h3>
                        <span className="rounded-full border border-zinc-700/50 bg-zinc-900/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                          {job.type}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-2.5 w-2.5" />
                          {timeAgo(job.createdAt)}
                        </span>
                      </div>

                      {job.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                          {job.description}
                        </p>
                      )}
                    </div>

                    {isCandidate && (
                      <div className="shrink-0">
                        <Link
                          href={`/dashboard/jobs`}
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/20 bg-white px-4 font-mono text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100"
                        >
                          View & Apply
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
