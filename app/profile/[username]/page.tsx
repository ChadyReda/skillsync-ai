import type { Metadata } from "next";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { roadmaps } from "@/src/db/schemas/roadmap";
import { roadmapNodes } from "@/src/db/schemas/roadmap-nodes";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Map,
  TrendingUp,
  Star,
  CheckCircle2,
  Circle,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import GitHubSection from "@/components/github/github-section";
import type { GitHubData, GitHubInsights } from "@/lib/github/types";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const [profile] = await db
    .select({ fullName: candidateProfiles.fullName, bio: candidateProfiles.bio, imageUrl: users.imageUrl })
    .from(candidateProfiles)
    .innerJoin(users, eq(users.id, candidateProfiles.userId))
    .where(eq(candidateProfiles.publicUsername, username))
    .limit(1);

  if (!profile) return { title: "Profile Not Found — SkillSync" };

  return {
    title: `${profile.fullName ?? username} — SkillSync`,
    description: profile.bio ?? `View ${profile.fullName ?? username}'s developer portfolio on SkillSync.`,
    openGraph: {
      title: `${profile.fullName ?? username} — SkillSync`,
      description: profile.bio ?? undefined,
      images: profile.imageUrl ? [{ url: profile.imageUrl }] : [],
    },
    twitter: {
      card: "summary",
      title: `${profile.fullName ?? username} — SkillSync`,
      description: profile.bio ?? undefined,
    },
  };
}

function HeroGridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(to right,rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,1) 1px,transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const [candidate] = await db
    .select({
      userId: users.id,
      email: users.email,
      imageUrl: users.imageUrl,
      fullName: candidateProfiles.fullName,
      bio: candidateProfiles.bio,
      resumeUrl: candidateProfiles.resumeUrl,
      resumeScore: candidateProfiles.resumeScore,
      resumeInsights: candidateProfiles.resumeInsights,
      resumeData: candidateProfiles.resumeData,
      level: candidateProfiles.level,
      xp: candidateProfiles.xp,
      githubUsername: candidateProfiles.githubUsername,
      githubData: candidateProfiles.githubData,
      githubInsights: candidateProfiles.githubInsights,
      githubLastUpdatedAt: candidateProfiles.githubLastUpdatedAt,
      isPublic: candidateProfiles.isPublic,
    })
    .from(users)
    .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(candidateProfiles.publicUsername, username))
    .limit(1);

  if (!candidate || !candidate.isPublic) notFound();

  const candidateRoadmaps = await db
    .select()
    .from(roadmaps)
    .where(eq(roadmaps.userId, candidate.userId))
    .orderBy(desc(roadmaps.createdAt));

  const roadmapProgress = await Promise.all(
    candidateRoadmaps.map(async (roadmap) => {
      const nodes = await db
        .select()
        .from(roadmapNodes)
        .where(eq(roadmapNodes.roadmapId, roadmap.id));
      return {
        roadmapId: roadmap.id,
        completed: nodes.filter((n) => n.completed).length,
        total: nodes.length,
      };
    }),
  );

  const resumeData = candidate.resumeData as { skills?: string[] } | null;
  const resumeInsights = candidate.resumeInsights as {
    strengths?: string[];
    improvements?: string[];
  } | null;

  const skills: string[] = (resumeData?.skills as string[] | undefined) ?? [];
  const strengths = Array.isArray(resumeInsights?.strengths) ? resumeInsights!.strengths as string[] : [];
  const improvements = Array.isArray(resumeInsights?.improvements) ? resumeInsights!.improvements as string[] : [];
  const githubData = candidate.githubData as GitHubData | null;
  const githubInsights = candidate.githubInsights as GitHubInsights | null;

  return (
    <div className="min-h-screen bg-black">
      {/* Public nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="SkillSync" width={24} height={24} className="object-contain" />
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white">SkillSync</span>
          </Link>
          <Link
            href="/sign-in"
            className="group inline-flex h-9 items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
          >
            Sign in
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        {/* Hero — identical structure to portfolio page */}
        <section
          className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950 p-6 md:p-8"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 32px rgba(0,0,0,0.4)" }}
        >
          <HeroGridBackground />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex items-start gap-4">
              <UserAvatar
                imageUrl={candidate.imageUrl}
                name={candidate.fullName ?? candidate.email}
                className="h-16 w-16"
                textClassName="text-lg"
              />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  candidate portfolio
                </p>
                <h1 className="mb-1 mt-1 text-2xl font-bold text-white md:text-3xl">
                  {candidate.fullName}
                </h1>
                <p className="mb-3 max-w-md text-sm leading-relaxed text-zinc-400">
                  {candidate.bio || "No bio yet."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white bg-white px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-black">
                    <TrendingUp className="h-3 w-3" />
                    L.{candidate.level ?? 1}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-black px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-zinc-300">
                    <Star className="h-3 w-3" />
                    {candidate.xp ?? 0} XP
                  </span>
                  {candidate.resumeScore !== null && candidate.resumeScore !== undefined && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-black px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-zinc-300">
                      <FileText className="h-3 w-3" />
                      Resume {candidate.resumeScore}/100
                    </span>
                  )}
                </div>
              </div>
            </div>
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 bg-black px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View CV
              </a>
            )}
          </div>
        </section>

        {/* Skills + Resume score */}
        {(skills.length > 0 || (candidate.resumeScore !== null && candidate.resumeScore !== undefined)) && (
          <div className="grid gap-4 md:grid-cols-2">
            {skills.length > 0 && (
              <section className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-6" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={i} className="rounded-md border border-zinc-800 bg-black px-2.5 py-1 text-xs text-zinc-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {candidate.resumeScore !== null && candidate.resumeScore !== undefined && (
              <section className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-6" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Resume Score</p>
                <div className="mb-3 flex items-end gap-3">
                  <span className="text-4xl font-bold tabular-nums text-white">{candidate.resumeScore}</span>
                  <span className="mb-1 font-mono text-sm uppercase tracking-wider text-zinc-500">/100</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-white" style={{ width: `${candidate.resumeScore}%` }} />
                </div>
              </section>
            )}
          </div>
        )}

        {/* Strengths + Growth areas */}
        {(strengths.length > 0 || improvements.length > 0) && (
          <section className="grid gap-4 md:grid-cols-2">
            {strengths.length > 0 && (
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-5" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
                <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Strengths
                </p>
                <div className="space-y-2">
                  {strengths.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {improvements.length > 0 && (
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-5" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
                <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Growth Areas
                </p>
                <div className="space-y-2">
                  {improvements.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
                      <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Roadmaps */}
        {candidateRoadmaps.length > 0 && (
          <section className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-6" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
            <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              <Map className="h-3 w-3" />
              Learning Roadmaps
            </p>
            <div className="space-y-3">
              {candidateRoadmaps.map((roadmap) => {
                const p = roadmapProgress.find((rp) => rp.roadmapId === roadmap.id);
                const pct = p && p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
                const isComplete = pct === 100 && (p?.total ?? 0) > 0;
                return (
                  <div key={roadmap.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-200">{roadmap.title}</span>
                      <span className={`font-mono text-[10px] tabular-nums uppercase tracking-wider ${isComplete ? "text-emerald-400" : "text-zinc-500"}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-400" : "bg-white"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* GitHub — full section, same as portfolio */}
        {candidate.githubUsername && githubData && (
          <section className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-6" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
            <GitHubSection
              githubData={githubData}
              githubInsights={githubInsights}
              githubUsername={candidate.githubUsername}
              lastUpdated={candidate.githubLastUpdatedAt?.toISOString() ?? null}
            />
          </section>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="mt-20 border-t border-zinc-800/60 py-10">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm text-zinc-500">
            Want to build your own developer portfolio?{" "}
            <Link href="/sign-up" className="text-white underline underline-offset-4 hover:no-underline">
              Join SkillSync →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
