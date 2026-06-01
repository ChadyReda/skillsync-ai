// app/dashboard/recruiter/search/actions.ts

"use server";

import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src";

import { users } from "@/src/db/schemas/users";

import { candidateProfiles } from "@/src/db/schemas/candidate";

import { recruiterShortlists } from "@/src/db/schemas/recruiter-shorlists";

import { eq, and } from "drizzle-orm";

import { parseRecruiterSearch } from "@/lib/recruiter/recruiter-search";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

function scoreCandidate(candidate: any, filters: any) {
  let score = 0;

  const text = JSON.stringify({
    resumeData: candidate.resumeData,
    insights: candidate.resumeInsights,
    bio: candidate.bio,
  }).toLowerCase();

  for (const skill of filters.skills || []) {
    if (text.includes(skill.toLowerCase())) {
      score += 20;
    }
  }

  for (const keyword of filters.keywords || []) {
    if (text.includes(keyword.toLowerCase())) {
      score += 10;
    }
  }

  score += candidate.resumeScore || 0;

  score += (candidate.level || 1) * 5;

  return score;
}

export type CandidateResult = {
  userId: string;
  imageUrl: string | null;
  fullName: string | null;
  bio: string | null;
  resumeScore: number | null;
  level: number | null;
  xp: number | null;
  resumeData: unknown;
  resumeInsights: unknown;
  matchScore: number;
  isShortlisted: boolean;
};

export async function searchCandidates(query: string): Promise<CandidateResult[] | { error: string }> {
  const clerkUser = await currentUser();

  if (clerkUser) {
    const rl = checkRateLimit({
      key: `${clerkUser.id}:talent-search`,
      ...RATE_LIMITS.TALENT_SEARCH,
    });
    if (!rl.ok) {
      return { error: `Too many searches. Try again in ${rl.retryAfter}s.` };
    }
  }

  const filters = await parseRecruiterSearch(query);

  const candidates = await db
    .select({
      userId: users.id,
      imageUrl: users.imageUrl,
      fullName: candidateProfiles.fullName,
      bio: candidateProfiles.bio,
      resumeScore: candidateProfiles.resumeScore,
      level: candidateProfiles.level,
      xp: candidateProfiles.xp,
      resumeData: candidateProfiles.resumeData,
      resumeInsights: candidateProfiles.resumeInsights,
    })
    .from(users)
    .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(users.role, "candidate"));

  // Fetch the recruiter's existing shortlist to mark already-saved candidates
  let savedIds = new Set<string>();
  if (clerkUser) {
    const [recruiter] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);

    if (recruiter) {
      const saved = await db
        .select({ candidateId: recruiterShortlists.candidateId })
        .from(recruiterShortlists)
        .where(eq(recruiterShortlists.recruiterId, recruiter.id));
      savedIds = new Set(saved.map((s) => s.candidateId));
    }
  }

  const scored = candidates.map((candidate) => ({
    ...candidate,
    matchScore: scoreCandidate(candidate, filters),
    isShortlisted: savedIds.has(candidate.userId),
  }));

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}

export async function toggleShortlist(candidateId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const [recruiter] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  const [existing] = await db
    .select()
    .from(recruiterShortlists)
    .where(
      and(
        eq(recruiterShortlists.recruiterId, recruiter.id),

        eq(recruiterShortlists.candidateId, candidateId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .delete(recruiterShortlists)
      .where(eq(recruiterShortlists.id, existing.id));

    return;
  }

  await db.insert(recruiterShortlists).values({
    recruiterId: recruiter.id,

    candidateId,
  });
}
