// app/dashboard/jobs/actions.ts

"use server";

import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src";

import { users } from "@/src/db/schemas/users";

import { jobApplications } from "@/src/db/schemas/job-applications";

import { eq, and } from "drizzle-orm";

export async function applyToJob(jobId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    throw new Error("User not found");
  }

  const [existing] = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.jobId, jobId),

        eq(jobApplications.candidateId, dbUser.id),
      ),
    )
    .limit(1);

  if (existing) {
    return;
  }

  await db.insert(jobApplications).values({
    jobId,

    candidateId: dbUser.id,
  });
}
