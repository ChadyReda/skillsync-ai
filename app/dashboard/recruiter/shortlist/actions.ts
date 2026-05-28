"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/index";
import { recruiterShortlists } from "@/src/db/schemas/recruiter-shorlists";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";

export const removeFromShortlist = async (candidateId: string) => {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(recruiterShortlists)
    .where(eq(recruiterShortlists.candidateId, candidateId));

  revalidatePath("/dashboard/recruiter/shortlist");
};

export const addToShortlist = async (candidateId: string) => {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .insert(recruiterShortlists)
    .values({ recruiterId: user.id, candidateId })
    .onConflictDoNothing();

  revalidatePath("/dashboard/recruiter/shortlist");
};
