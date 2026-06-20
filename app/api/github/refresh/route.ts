import { type NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { eq } from "drizzle-orm";
import { fetchGitHubData } from "@/lib/github/fetch";
import { generateGitHubInsights } from "@/lib/github/insights";

export async function POST(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "candidate") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const username: string = (body.username ?? "").trim();

  if (!username) {
    return NextResponse.json(
      { error: "GitHub username is required" },
      { status: 400 },
    );
  }

  // get the user profile
  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, user.id))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  try {
    // fetch the github data
    const githubData = await fetchGitHubData(username);

    // analyze the github data
    const githubInsights = await generateGitHubInsights(
      githubData,
      profile.fullName,
    );

    // store and update the github insights
    await db
      .update(candidateProfiles)
      .set({
        githubUsername: username,
        githubData: githubData as never,
        githubInsights: githubInsights as never,
        githubLastUpdatedAt: new Date(),
      })
      .where(eq(candidateProfiles.userId, user.id));

    return NextResponse.json({ success: true, githubData, githubInsights }); // return the gh data with insights
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch GitHub data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
