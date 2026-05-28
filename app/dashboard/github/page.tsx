import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/src";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { eq } from "drizzle-orm";
import type { GitHubData, GitHubInsights } from "@/lib/github/types";
import GitHubPageClient from "./github-page-client";

export default async function GitHubPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "candidate") redirect("/dashboard");

  const [profile] = await db
    .select({
      githubUsername: candidateProfiles.githubUsername,
      githubData: candidateProfiles.githubData,
      githubInsights: candidateProfiles.githubInsights,
      githubLastUpdatedAt: candidateProfiles.githubLastUpdatedAt,
    })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, user.id))
    .limit(1);

  return (
    <GitHubPageClient
      initialUsername={profile?.githubUsername ?? null}
      initialData={(profile?.githubData as GitHubData) ?? null}
      initialInsights={(profile?.githubInsights as GitHubInsights) ?? null}
      initialUpdatedAt={
        profile?.githubLastUpdatedAt
          ? profile.githubLastUpdatedAt.toISOString()
          : null
      }
    />
  );
}
