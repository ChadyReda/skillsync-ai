import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { recruiterShortlists } from "@/src/db/schemas/recruiter-shorlists";
import { eq } from "drizzle-orm";
import { Star } from "lucide-react";
import ShortlistClient from "./shortlist-client";

export default async function ShortlistPage() {
  const recruiter = await getCurrentDbUser();
  if (!recruiter) return null;

  const shortlisted = await db
    .select({
      candidateId: users.id,
      fullName: candidateProfiles.fullName,
      bio: candidateProfiles.bio,
      resumeScore: candidateProfiles.resumeScore,
      level: candidateProfiles.level,
      xp: candidateProfiles.xp,
      skills: candidateProfiles.skills,
      imageUrl: users.imageUrl,
    })
    .from(recruiterShortlists)
    .innerJoin(users, eq(users.id, recruiterShortlists.candidateId))
    .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(recruiterShortlists.recruiterId, recruiter.id));

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="border-b border-zinc-800 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          [ 09 ] saved
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <Star className="h-5 w-5" />
          Shortlist
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {shortlisted.length} candidate{shortlisted.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      <ShortlistClient initialCandidates={shortlisted} />
    </div>
  );
}
