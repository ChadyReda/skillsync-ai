"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { sendWelcomeEmail } from "@/lib/email/mail";

import { db } from "@/src/index";

import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { recruiterProfiles } from "@/src/db/schemas/recruiter";
import { getCurrentDbUser } from "@/lib/auth";

import { eq } from "drizzle-orm";

type Role = "candidate" | "recruiter";

interface OnboardingData {
  role: Role;
  fullName?: string;
  bio?: string;
  companyName?: string;
  position?: string;
  companyWebsite?: string;
  companyEmail?: string;
}

export async function completeOnboarding(data: OnboardingData) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  // User may not exist in DB yet (no webhook) — create them now
  let dbUser = await getCurrentDbUser();

  if (!dbUser) {
    const [created] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: clerkUser.imageUrl ?? null,
        role: data.role,
        onboardingCompleted: false,
      })
      .returning();
    dbUser = created;
  }

  // candidate
  if (data.role === "candidate") {
    await db.insert(candidateProfiles).values({
      userId: dbUser.id,
      fullName: data.fullName || "",
      bio: data.bio || "",
    });
  }

  // recruiter
  if (data.role === "recruiter") {
    await db.insert(recruiterProfiles).values({
      userId: dbUser.id,
      companyName: data.companyName || "",
      position: data.position || "",
      companyWebsite: data.companyWebsite || null,
      companyEmail: data.companyEmail || null,
    });
  }

  // Mark onboarding complete and confirm role
  await db
    .update(users)
    .set({
      role: data.role,
      onboardingCompleted: true,
    })
    .where(eq(users.id, dbUser.id));

  await sendWelcomeEmail(clerkUser.emailAddresses[0]?.emailAddress);

  redirect("/dashboard");
}
