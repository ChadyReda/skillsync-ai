import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { jobs } from "@/src/db/schemas/jobs";
import { eq, desc } from "drizzle-orm";
import JobsClient from "./jobs-client";

export default async function Page() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) return null;

  const recruiterJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.recruiterId, dbUser.id))
    .orderBy(desc(jobs.createdAt));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <JobsClient initialJobs={recruiterJobs} />
    </main>
  );
}
