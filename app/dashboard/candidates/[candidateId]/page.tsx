import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { posts } from "@/src/db/schemas/posts";
import { roadmaps } from "@/src/db/schemas/roadmap";
import { roadmapNodes } from "@/src/db/schemas/roadmap-nodes";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import MessageButton from "@/components/message-button";
import {
  FileText,
  Map,
  Zap,
  TrendingUp,
  Star,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getCurrentDbUser } from "@/lib/auth";
import GitHubSection from "@/components/github/github-section";
import type { GitHubData, GitHubInsights } from "@/lib/github/types";
import ExportPdfButton from "@/components/profile/export-pdf-button";

type PageProps = {
  params: Promise<{ candidateId: string }>;
};

interface ResumeData {
  skills?: string[];
}

interface ResumeInsights {
  strengths?: string[];
  improvements?: string[];
}

// Component: BackButton
function BackButton() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-zinc-200"
    >
      <ArrowLeft className="h-3 w-3" />
      Dashboard
    </Link>
  );
}

// Component: HeroGridBackground
function HeroGridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

// Component: CandidateInfo
function CandidateInfo({
  fullName,
  bio,
  level,
  xp,
  resumeScore,
}: {
  fullName: string | null;
  bio: string | null;
  level: number | null;
  xp: number | null;
  resumeScore: number | null;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        candidate portfolio
      </p>
      <h1 className="mb-1 mt-1 text-2xl font-bold text-white md:text-3xl">
        {fullName}
      </h1>
      <p className="mb-3 max-w-md text-sm leading-relaxed text-zinc-400">
        {bio || "No bio yet."}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white bg-white px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-black">
          <TrendingUp className="h-3 w-3" />
          L.{level ?? 1}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-black px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-zinc-300">
          <Star className="h-3 w-3" />
          {xp ?? 0} XP
        </span>
        {resumeScore !== null && resumeScore !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-black px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-zinc-300">
            <FileText className="h-3 w-3" />
            Resume {resumeScore}/100
          </span>
        )}
      </div>
    </div>
  );
}

// Component: HeroActions
function HeroActions({
  resumeUrl,
  userId,
  currentUserId,
  pdfData,
}: {
  resumeUrl: string | null;
  userId: string;
  currentUserId?: string;
  pdfData: any;
}) {
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      {resumeUrl && (
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-black px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View CV
        </a>
      )}
      {userId !== currentUserId && <MessageButton userId={userId} />}
      <ExportPdfButton data={pdfData} />
    </div>
  );
}

// Component: HeroSection
function HeroSection({
  candidate,
  currentUserId,
  pdfData,
}: {
  candidate: any;
  currentUserId?: string;
  pdfData: any;
}) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-6 md:p-8">
      <HeroGridBackground />
      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="flex items-start gap-4">
          <UserAvatar
            imageUrl={candidate.imageUrl}
            name={candidate.fullName ?? candidate.email}
            className="h-16 w-16"
            textClassName="text-lg"
          />
          <CandidateInfo
            fullName={candidate.fullName}
            bio={candidate.bio}
            level={candidate.level}
            xp={candidate.xp}
            resumeScore={candidate.resumeScore}
          />
        </div>
        <HeroActions
          resumeUrl={candidate.resumeUrl}
          userId={candidate.userId}
          currentUserId={currentUserId}
          pdfData={pdfData}
        />
      </div>
    </section>
  );
}

// Component: SkillsSection
function SkillsSection({ skills }: { skills: string[] }) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        Skills
      </p>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span
              key={i}
              className="rounded-md border border-zinc-800 bg-black px-2.5 py-1 text-xs text-zinc-300"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No skills detected.</p>
      )}
    </section>
  );
}

// Component: ResumeScoreSection
function ResumeScoreSection({ resumeScore }: { resumeScore: number | null }) {
  if (resumeScore === null || resumeScore === undefined) return null;

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        Resume Score
      </p>
      <div className="mb-3 flex items-end gap-3">
        <span className="text-4xl font-bold tabular-nums text-white">
          {resumeScore}
        </span>
        <span className="mb-1 font-mono text-sm uppercase tracking-wider text-zinc-500">
          /100
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-white" style={{ width: `${resumeScore}%` }} />
      </div>
    </section>
  );
}

// Component: ResumeInsightsSection
function ResumeInsightsSection({
  strengths,
  improvements,
}: {
  strengths: string[];
  improvements: string[];
}) {
  if (strengths.length === 0 && improvements.length === 0) return null;

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Strengths
        </p>
        <div className="space-y-2">
          {strengths.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Growth Areas
        </p>
        <div className="space-y-2">
          {improvements.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300"
            >
              <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Component: RoadmapItem
function RoadmapItem({
  title,
  completed,
  total,
}: {
  title: string;
  completed: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percent === 100 && total > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-200">{title}</span>
        <span
          className={[
            "font-mono text-[10px] tabular-nums uppercase tracking-wider",
            isComplete ? "text-emerald-400" : "text-zinc-500",
          ].join(" ")}
        >
          {percent}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={[
            "h-full rounded-full transition-all",
            isComplete ? "bg-emerald-400" : "bg-white",
          ].join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// Component: RoadmapsSection
function RoadmapsSection({
  roadmaps,
  roadmapProgress,
}: {
  roadmaps: any[];
  roadmapProgress: any[];
}) {
  if (roadmaps.length === 0) return null;

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        <Map className="h-3 w-3" />
        Learning Roadmaps
      </p>
      <div className="space-y-3">
        {roadmaps.map((roadmap) => {
          const progress = roadmapProgress.find(
            (p) => p.roadmapId === roadmap.id,
          );
          return (
            <RoadmapItem
              key={roadmap.id}
              title={roadmap.title}
              completed={progress?.completed ?? 0}
              total={progress?.total ?? 0}
            />
          );
        })}
      </div>
    </section>
  );
}

// Component: PostItem
function PostItem({
  post,
  index,
  total,
}: {
  post: any;
  index: number;
  total: number;
}) {
  return (
    <div
      className={[
        "bg-black p-4",
        index < total - 1 ? "border-b border-zinc-800" : "",
      ].join(" ")}
    >
      <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
        {post.content}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
      </p>
    </div>
  );
}

// Component: PostsSection
function PostsSection({ posts }: { posts: any[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        <Zap className="h-3 w-3" />
        Recent Syncs
      </p>
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        {posts.slice(0, 3).map((post, i) => (
          <PostItem
            key={post.id}
            post={post}
            index={i}
            total={Math.min(posts.length, 3)}
          />
        ))}
      </div>
    </section>
  );
}

// Component: GitHubSectionWrapper
function GitHubSectionWrapper({
  githubUsername,
  githubData,
  githubInsights,
  lastUpdated,
}: {
  githubUsername: string | null;
  githubData: GitHubData | null;
  githubInsights: GitHubInsights | null;
  lastUpdated: string | null;
}) {
  if (!githubUsername || !githubData) return null;

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <GitHubSection
        githubData={githubData}
        githubInsights={githubInsights}
        githubUsername={githubUsername}
        lastUpdated={lastUpdated}
      />
    </section>
  );
}

// Main Page Component
export default async function CandidateProfilePage({ params }: PageProps) {
  const { candidateId } = await params;
  const clerkUser = await currentUser();
  const dbUser = await getCurrentDbUser();

  if (!clerkUser) return null;

  const [candidate] = await db
    .select({
      userId: users.id,
      email: users.email,
      imageUrl: users.imageUrl,
      createdAt: users.createdAt,
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
    })
    .from(users)
    .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(users.id, candidateId))
    .limit(1);

  if (!candidate) notFound();

  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, candidate.userId))
    .orderBy(desc(posts.createdAt));

  const candidateRoadmaps: (typeof roadmaps.$inferSelect)[] = await db
    .select()
    .from(roadmaps)
    .where(eq(roadmaps.userId, candidate.userId))
    .orderBy(desc(roadmaps.createdAt));

  type RoadmapWithProgress = {
    roadmapId: string;
    completed: number;
    total: number;
  };

  const roadmapProgress: RoadmapWithProgress[] = await Promise.all(
    candidateRoadmaps.map(async (roadmap) => {
      const nodes = await db
        .select()
        .from(roadmapNodes)
        .where(eq(roadmapNodes.roadmapId, roadmap.id));
      const completed = nodes.filter((n) => n.completed).length;
      return { roadmapId: roadmap.id, completed, total: nodes.length };
    }),
  );

  const resumeData = candidate.resumeData as ResumeData | null;
  const resumeInsights = candidate.resumeInsights as ResumeInsights | null;

  const skills: string[] = (resumeData?.skills as string[] | undefined) ?? [];
  const strengths: string[] = Array.isArray(resumeInsights?.strengths)
    ? resumeInsights.strengths.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  const improvements: string[] = Array.isArray(resumeInsights?.improvements)
    ? resumeInsights.improvements.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  const githubData = candidate.githubData as GitHubData | null;
  const githubInsights = candidate.githubInsights as GitHubInsights | null;

  const pdfData = {
    fullName: candidate.fullName,
    email: candidate.email,
    bio: candidate.bio,
    level: candidate.level,
    xp: candidate.xp,
    resumeScore: candidate.resumeScore,
    skills,
    strengths,
    improvements,
    roadmaps: candidateRoadmaps.map((rm) => {
      const p = roadmapProgress.find((rp) => rp.roadmapId === rm.id);
      return {
        title: rm.title,
        completed: p?.completed ?? 0,
        total: p?.total ?? 0,
      };
    }),
    github: githubData
      ? {
          username: githubData.username,
          publicRepos: githubData.publicRepos,
          totalStars: githubData.totalStars,
          followers: githubData.followers,
          developerScore: githubData.developerScore,
          topLanguages: githubData.topLanguages,
          activityLevel: githubData.contributionActivity.level,
        }
      : null,
    githubInsights: githubInsights
      ? {
          overallProfile: githubInsights.overallProfile,
          strengths: githubInsights.strengths,
          expertise: githubInsights.expertise,
          careerPaths: githubInsights.careerPaths,
        }
      : null,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <BackButton />

      <HeroSection
        candidate={candidate}
        currentUserId={dbUser?.id}
        pdfData={pdfData}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SkillsSection skills={skills} />
        <ResumeScoreSection resumeScore={candidate.resumeScore} />
      </div>

      <ResumeInsightsSection
        strengths={strengths}
        improvements={improvements}
      />

      <RoadmapsSection
        roadmaps={candidateRoadmaps}
        roadmapProgress={roadmapProgress}
      />

      <PostsSection posts={userPosts} />

      <GitHubSectionWrapper
        githubUsername={candidate.githubUsername}
        githubData={githubData}
        githubInsights={githubInsights}
        lastUpdated={candidate.githubLastUpdatedAt?.toISOString() ?? null}
      />
    </div>
  );
}
