import type { Metadata } from "next";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src/index";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { recruiterProfiles } from "@/src/db/schemas/recruiter";
import { eq } from "drizzle-orm";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your AI career command center. Manage roadmaps, applications, and connect with recruiters.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getCurrentDbUser();
  if (!user) return null;

  let candidateProfile = null;
  let recruiterProfile = null;

  if (user.role === "candidate") {
    const [p] = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, user.id))
      .limit(1);
    candidateProfile = p;
  }

  if (user.role === "recruiter") {
    const [p] = await db
      .select()
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, user.id))
      .limit(1);
    recruiterProfile = p;
  }

  const displayName =
    candidateProfile?.fullName ||
    recruiterProfile?.companyName ||
    user.email.split("@")[0];

  const xp = candidateProfile?.xp ?? 0;
  const level = candidateProfile?.level ?? 1;
  const xpProgress = Math.min((xp % 100) / 100, 1);

  return (
    <DashboardView
      role={user.role}
      displayName={displayName}
      xp={xp}
      level={level}
      xpProgress={xpProgress}
      userId={user.id}
      recruiterPosition={recruiterProfile?.position}
    />
  );
}
