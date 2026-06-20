// app/dashboard/recruiter/search/actions.ts

"use server";

import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src";

import { users } from "@/src/db/schemas/users";

import { candidateProfiles } from "@/src/db/schemas/candidate";

import { recruiterShortlists } from "@/src/db/schemas/recruiter-shorlists";

import { eq, and } from "drizzle-orm";

import { parseRecruiterSearch } from "@/lib/recruiter/recruiter-search";

function scoreCandidate(candidate: any, filters: any) {
  let score = 0;

  // Structured skill matching: check the parsed skills array first
  const structuredSkills: string[] = Array.isArray(
    (candidate.resumeData as any)?.skills,
  )
    ? ((candidate.resumeData as any).skills as string[])
    : [];

  const structuredSkillsLower = structuredSkills.map((s) => s.toLowerCase());

  // Fall back to raw text search
  const rawText = JSON.stringify({
    resumeData: candidate.resumeData,
    insights: candidate.resumeInsights,
    bio: candidate.bio,
  }).toLowerCase();

  for (const skill of filters.skills || []) {
    const skillLower = skill.toLowerCase();
    if (structuredSkillsLower.includes(skillLower)) {
      score += 25; // stronger signal when structured
    } else if (rawText.includes(skillLower)) {
      score += 10;
    }
  }

  for (const keyword of filters.keywords || []) {
    if (rawText.includes(keyword.toLowerCase())) {
      score += 8;
    }
  }

  // Resume quality signal (already 0-100)
  score += Math.round((candidate.resumeScore || 0) * 0.3);

  // XP/level signal
  score += (candidate.level || 1) * 3;

  return Math.min(score, 100);
}

export async function searchCandidates(query: string) {
  const clerkUser = await currentUser();

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
