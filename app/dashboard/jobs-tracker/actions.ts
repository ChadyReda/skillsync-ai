"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { jobs } from "@/src/db/schemas/jobs";
import { jobWatchlist } from "@/src/db/schemas/job-watchlist";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) throw new Error("User not found");
  return dbUser;
}

export async function addToWatchlist(jobId: string) {
  const user = await getDbUser();

  await db
    .insert(jobWatchlist)
    .values({ candidateId: user.id, jobId, status: "watchlisted" })
    .onConflictDoNothing();

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/jobs-tracker");
}

export async function removeFromWatchlist(jobId: string) {
  const user = await getDbUser();

  await db
    .delete(jobWatchlist)
    .where(
      and(eq(jobWatchlist.candidateId, user.id), eq(jobWatchlist.jobId, jobId)),
    );

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/jobs-tracker");
}

export async function updateWatchlistStatus(entryId: string, status: string) {
  const user = await getDbUser();

  await db
    .update(jobWatchlist)
    .set({ status })
    .where(
      and(eq(jobWatchlist.id, entryId), eq(jobWatchlist.candidateId, user.id)),
    );

  revalidatePath("/dashboard/jobs-tracker");
}

export async function getWatchlistedJobIds(): Promise<string[]> {
  const user = await getDbUser().catch(() => null);
  if (!user) return [];

  const rows = await db
    .select({ jobId: jobWatchlist.jobId })
    .from(jobWatchlist)
    .where(eq(jobWatchlist.candidateId, user.id));

  return rows.map((r) => r.jobId);
}

export async function getWatchlistEntries() {
  const user = await getDbUser();

  const entries = await db
    .select()
    .from(jobWatchlist)
    .where(eq(jobWatchlist.candidateId, user.id));

  if (entries.length === 0) return [];

  const jobIds = entries.map((e) => e.jobId);
  const jobRows = await db
    .select()
    .from(jobs)
    .where(inArray(jobs.id, jobIds));

  const jobMap = new Map(jobRows.map((j) => [j.id, j]));

  return entries
    .map((entry) => {
      const job = jobMap.get(entry.jobId);
      if (!job) return null;
      return { ...entry, job };
    })
    .filter(Boolean) as (typeof entries[number] & { job: typeof jobRows[number] })[];
}
