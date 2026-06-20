"use server";

import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { jobApplications } from "@/src/db/schemas/job-applications";
import { jobs } from "@/src/db/schemas/jobs";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = ["applied", "reviewing", "interview", "offer", "rejected"] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function updateApplicationStatus(applicationId: string, status: Status) {
  const user = await getCurrentDbUser();
  if (!user || user.role !== "recruiter") throw new Error("Unauthorized");

  // Verify recruiter owns the job this application is for
  const [application] = await db
    .select({ jobId: jobApplications.jobId })
    .from(jobApplications)
    .where(eq(jobApplications.id, applicationId))
    .limit(1);

  if (!application) throw new Error("Application not found");

  const [job] = await db
    .select({ recruiterId: jobs.recruiterId })
    .from(jobs)
    .where(and(eq(jobs.id, application.jobId), eq(jobs.recruiterId, user.id)))
    .limit(1);

  if (!job) throw new Error("Unauthorized");

  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");

  await db
    .update(jobApplications)
    .set({ status })
    .where(eq(jobApplications.id, applicationId));

  revalidatePath("/dashboard/recruiter/applications");
}
