import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { mentorProfiles } from "@/src/db/schemas/mentor";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Linkedin,
  Star,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ mentorId: string }>;
}) {
  const { mentorId } = await params;

  const [profile] = await db
    .select({
      userId: users.id,
      email: users.email,
      imageUrl: users.imageUrl,
      role: users.role,
      expertise: mentorProfiles.expertise,
      yearsExperience: mentorProfiles.yearsExperience,
      linkedinUrl: mentorProfiles.linkedinUrl,
    })
    .from(users)
    .leftJoin(mentorProfiles, eq(mentorProfiles.userId, users.id))
    .where(eq(users.id, mentorId))
    .limit(1);

  if (!profile || profile.role !== "mentor") notFound();

  const displayName = profile.email.split("@")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Back */}
      <Link
        href="/dashboard/feed"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to feed
      </Link>

      {/* Profile header */}
      <div
        className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-transparent" />

        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
          <UserAvatar
            imageUrl={profile.imageUrl}
            name={displayName}
            className="h-20 w-20 rounded-xl text-2xl"
          />

          <div className="flex-1 space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                [ mentor / expert ]
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white">
                {displayName}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{profile.email}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.yearsExperience != null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  <Star className="h-3 w-3" />
                  {profile.yearsExperience} {profile.yearsExperience === 1 ? "yr" : "yrs"} experience
                </span>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
                >
                  <Linkedin className="h-3 w-3" />
                  LinkedIn
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expertise */}
      {profile.expertise && profile.expertise.length > 0 && (
        <div
          className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
        >
          <div className="border-b border-zinc-800/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-zinc-500" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Areas of expertise
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 p-6">
            {profile.expertise.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty expertise state */}
      {(!profile.expertise || profile.expertise.length === 0) && (
        <div className="rounded-2xl border border-dashed border-zinc-800/60 px-6 py-12 text-center">
          <BookOpen className="mx-auto mb-3 h-9 w-9 text-zinc-700" />
          <p className="font-medium text-zinc-500">No expertise listed yet</p>
        </div>
      )}
    </div>
  );
}
