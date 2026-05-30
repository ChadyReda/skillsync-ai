import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWatchlistEntries } from "./actions";
import { TrackerClient } from "./tracker-client";

export default async function JobsTrackerPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/");
  if (user.role === "recruiter") redirect("/dashboard");

  const entries = await getWatchlistEntries();

  return <TrackerClient entries={entries} />;
}
