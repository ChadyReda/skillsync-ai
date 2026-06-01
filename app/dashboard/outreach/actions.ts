"use server";

import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { recruiterShortlists } from "@/src/db/schemas/recruiter-shorlists";
import { recruiterProfiles } from "@/src/db/schemas/recruiter";
import { roadmaps } from "@/src/db/schemas/roadmap";
import { roadmapNodes } from "@/src/db/schemas/roadmap-nodes";
import { eq } from "drizzle-orm";
import { generateOutreachEmail } from "@/lib/ai/email-generation";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export interface ShortlistedCandidate {
  candidateId: string;
  email: string;
  fullName: string | null;
  bio: string | null;
  skills: string[] | null;
  level: number | null;
  xp: number | null;
  resumeScore: number | null;
  resumeInsights: unknown;
  githubUsername: string | null;
  githubData: unknown;
  githubInsights: unknown;
  imageUrl: string | null;
}

export async function getShortlistedCandidates(): Promise<
  ShortlistedCandidate[]
> {
  const recruiter = await getCurrentDbUser();
  if (!recruiter || recruiter.role !== "recruiter") return [];

  return db
    .select({
      candidateId: users.id,
      email: users.email,
      fullName: candidateProfiles.fullName,
      bio: candidateProfiles.bio,
      skills: candidateProfiles.skills,
      level: candidateProfiles.level,
      xp: candidateProfiles.xp,
      resumeScore: candidateProfiles.resumeScore,
      resumeInsights: candidateProfiles.resumeInsights,
      githubUsername: candidateProfiles.githubUsername,
      githubData: candidateProfiles.githubData,
      githubInsights: candidateProfiles.githubInsights,
      imageUrl: users.imageUrl,
    })
    .from(recruiterShortlists)
    .innerJoin(users, eq(users.id, recruiterShortlists.candidateId))
    .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(recruiterShortlists.recruiterId, recruiter.id));
}

export async function generateEmail(
  candidateId: string,
  tone: "professional" | "casual" | "enthusiastic",
  jobTitle?: string
): Promise<{ subject: string; body: string } | { error: string }> {
  const recruiter = await getCurrentDbUser();
  if (!recruiter || recruiter.role !== "recruiter") {
    return { error: "Unauthorized" };
  }

  const rl = checkRateLimit({
    key: `${recruiter.id}:ai-outreach`,
    ...RATE_LIMITS.AI_OUTREACH,
  });
  if (!rl.ok) {
    return { error: `Too many email generations. Try again in ${rl.retryAfter}s.` };
  }

  const [recruiterProfile] = await db
    .select()
    .from(recruiterProfiles)
    .where(eq(recruiterProfiles.userId, recruiter.id))
    .limit(1);

  const [candidateData] = await db
    .select({
      userId: users.id,
      email: users.email,
      fullName: candidateProfiles.fullName,
      bio: candidateProfiles.bio,
      skills: candidateProfiles.skills,
      level: candidateProfiles.level,
      xp: candidateProfiles.xp,
      resumeScore: candidateProfiles.resumeScore,
      resumeInsights: candidateProfiles.resumeInsights,
      githubUsername: candidateProfiles.githubUsername,
      githubData: candidateProfiles.githubData,
      githubInsights: candidateProfiles.githubInsights,
    })
    .from(users)
    .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(users.id, candidateId))
    .limit(1);

  if (!candidateData) return { error: "Candidate not found" };

  const candidateRoadmaps = await db
    .select()
    .from(roadmaps)
    .where(eq(roadmaps.userId, candidateData.userId));

  const roadmapProgress = await Promise.all(
    candidateRoadmaps.map(async (roadmap) => {
      const nodes = await db
        .select()
        .from(roadmapNodes)
        .where(eq(roadmapNodes.roadmapId, roadmap.id));
      return {
        title: roadmap.title,
        completedNodes: nodes.filter((n) => n.completed).length,
        totalNodes: nodes.length,
      };
    })
  );

  const recruiterName =
    recruiterProfile?.companyName
      ? `${recruiter.email.split("@")[0]} from ${recruiterProfile.companyName}`
      : recruiter.email.split("@")[0];

  try {
    return await generateOutreachEmail({
      candidate: {
        name: candidateData.fullName,
        email: candidateData.email,
        bio: candidateData.bio,
        skills: candidateData.skills,
        level: candidateData.level,
        xp: candidateData.xp,
        resumeScore: candidateData.resumeScore,
        resumeInsights: candidateData.resumeInsights as never,
        githubUsername: candidateData.githubUsername,
        githubData: candidateData.githubData as never,
        githubInsights: candidateData.githubInsights as never,
        roadmaps: roadmapProgress,
      },
      recruiter: {
        name: recruiterName,
        companyName: recruiterProfile?.companyName ?? null,
        position: recruiterProfile?.position ?? null,
      },
      tone,
      jobTitle,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate email";
    return { error: message };
  }
}
