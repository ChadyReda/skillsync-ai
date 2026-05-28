import { db } from "@/src/index";

import { candidateProfiles } from "@/src/db/schemas/candidate";

import { eq } from "drizzle-orm";

import { getLevel } from "./get-level";

export async function addXp(
  userId: string,

  amount: number,
) {
  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1);

  if (!profile) return;

  const newXp = (profile.xp || 0) + amount;

  const newLevel = getLevel(newXp);

  await db
    .update(candidateProfiles)
    .set({
      xp: newXp,

      level: newLevel,
    })
    .where(eq(candidateProfiles.userId, userId));
}
