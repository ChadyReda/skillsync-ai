"use server";

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/src/index";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { extractResumeText } from "@/lib/resume/extract";
import { parseResume } from "@/lib/resume/parser";
import { analyzeResume } from "@/lib/resume/analyze";

export async function saveResume(fileUrl: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);
  if (!dbUser) throw new Error("User not found");

  // get the file from uploadthing
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // extract the text
  const resumeText = await extractResumeText(buffer);
  // Ai call: parse the resume into structured data
  const parsedResume = await parseResume(resumeText);
  // Ai call: analyze the data into insights
  const resumeInsights = await analyzeResume(resumeText);

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

export async function togglePublicProfile(isPublic: boolean, username?: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);
  if (!dbUser) throw new Error("User not found");

  const [profile] = await db
    .select({ publicUsername: candidateProfiles.publicUsername })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser.id))
    .limit(1);

  const slug =
    username?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") ||
    profile?.publicUsername ||
    dbUser.email.split("@")[0].replace(/[^a-z0-9-]/g, "-") + "-" + Date.now().toString(36);

  await db
    .update(candidateProfiles)
    .set({ isPublic, publicUsername: isPublic ? slug : (profile?.publicUsername ?? slug) })
    .where(eq(candidateProfiles.userId, dbUser.id));

  return { slug };
}
