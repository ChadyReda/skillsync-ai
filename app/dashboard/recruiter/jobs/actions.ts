// app/dashboard/recruiter/jobs/actions.ts

"use server";

import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src";

import { users } from "@/src/db/schemas/users";

import { jobs } from "@/src/db/schemas/jobs";

import { eq } from "drizzle-orm";

async function getRecruiter() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function createJob(formData: FormData) {
  const recruiter = await getRecruiter();

  const skillsRaw = formData.get("skills") as string;
  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const salaryMinRaw = formData.get("salaryMin") as string;
  const salaryMaxRaw = formData.get("salaryMax") as string;

  await db.insert(jobs).values({
    recruiterId: recruiter.id,
    title: formData.get("title") as string,
    type: formData.get("type") as string,
    workMode: (formData.get("workMode") as string) || "onsite",
    location: formData.get("location") as string,
    companyName: formData.get("companyName") as string,
    description: formData.get("description") as string,
    requirements: formData.get("requirements") as string,
    skills: skills.length > 0 ? skills : null,
    salaryMin: salaryMinRaw ? parseInt(salaryMinRaw) : null,
    salaryMax: salaryMaxRaw ? parseInt(salaryMaxRaw) : null,
    salaryCurrency: (formData.get("salaryCurrency") as string) || "USD",
  });
}

export async function deleteJob(jobId: string) {
  await db.delete(jobs).where(eq(jobs.id, jobId));
}
