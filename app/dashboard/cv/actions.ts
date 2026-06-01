"use server";

import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src/index";

import { users } from "@/src/db/schemas/users";

import { candidateProfiles } from "@/src/db/schemas/candidate";

import { eq } from "drizzle-orm";

import { extractResumeText } from "@/lib/resume/extract";
import { parseResume } from "@/lib/resume/parser";
import { analyzeResume } from "@/lib/resume/analyze";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function saveResume(fileUrl: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const rl = checkRateLimit({ key: `${clerkUser.id}:cv-analyze`, ...RATE_LIMITS.CV_ANALYZE });
  if (!rl.ok) {
    throw new Error(`Too many CV analyses. Try again in ${rl.retryAfter}s.`);
  }

  //
  // current user
  //

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    throw new Error("User not found");
  }

  //
  // fetch pdf
  //

  const response = await fetch(fileUrl);

  const arrayBuffer = await response.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  //
  // extract text
  //

  const resumeText = await extractResumeText(buffer);

  //
  // parse text
  //

  const parsedResume = await parseResume(resumeText);

  //
  // analyze resume
  //

  const resumeInsights = await analyzeResume(resumeText);

  //
  // save
  //

  await db
    .update(candidateProfiles)
    .set({
      resumeUrl: fileUrl,

      resumeText,

      resumeData: parsedResume,

      resumeScore: resumeInsights.score,

      resumeInsights: resumeInsights,

      resumeLastAnalyzedAt: new Date(),
    })
    .where(eq(candidateProfiles.userId, dbUser.id));

  return {
    success: true,

    resumeUrl: fileUrl,

    resumeScore: resumeInsights.score,

    resumeInsights: resumeInsights,

    resumeData: parsedResume,
  };
}
