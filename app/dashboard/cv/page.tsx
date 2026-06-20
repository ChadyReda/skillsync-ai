import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src/index";

import { users } from "@/src/db/schemas/users";

import { candidateProfiles } from "@/src/db/schemas/candidate";

import { eq } from "drizzle-orm";

import ResumeSection from "./resume-section";

export default async function Page() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    return null;
  }

  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser.id))
    .limit(1);

  return (
    <ResumeSection
      initialResumeUrl={profile?.resumeUrl ?? ""}
      initialResumeScore={profile?.resumeScore ?? 0}
      initialResumeInsights={(profile?.resumeInsights as any) ?? null}
      initialResumeData={(profile?.resumeData as any) ?? null}
      isPublic={profile?.isPublic ?? false}
      publicUsername={profile?.publicUsername ?? null}
    />
  );
}
