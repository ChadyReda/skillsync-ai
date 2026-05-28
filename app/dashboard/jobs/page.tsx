import { db } from "@/src";
import { jobs } from "@/src/db/schemas/jobs";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { getCurrentDbUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { JobsClient } from "./jobs-client";

type Job = typeof jobs.$inferSelect;

// ─── Skill variant expansion ──────────────────────────────────────────────────
// Generates alternative spellings/abbreviations for a skill so that
// e.g. "Node.js" also matches "nodejs" and "node", and "TypeScript" also
// matches the common abbreviation "ts".
const SKILL_ALIASES: Record<string, string[]> = {
  typescript: ["ts"],
  javascript: ["js"],
  python: ["py"],
  kubernetes: ["k8s"],
  postgresql: ["postgres", "pg", "psql"],
  mongodb: ["mongo"],
  "next.js": ["nextjs", "next"],
  "react.js": ["react"],
  "vue.js": ["vue"],
  "node.js": ["nodejs", "node"],
  "express.js": ["express"],
  tailwindcss: ["tailwind"],
  graphql: ["gql"],
};

function getVariants(skill: string): string[] {
  const base = skill.toLowerCase().trim();
  const set = new Set<string>([base]);

  // Strip punctuation/spacing variant: "node.js" → "nodejs"
  set.add(base.replace(/[.\-_\s]/g, ""));

  // Strip ".js" suffix: "react.js" → "react"
  if (base.endsWith(".js")) set.add(base.slice(0, -3));

  // Known aliases
  const aliases = SKILL_ALIASES[base];
  if (aliases) aliases.forEach((a) => set.add(a));

  return Array.from(set);
}

// ─── Word-boundary-aware match ────────────────────────────────────────────────
// Uses negative lookahead/lookbehind to avoid "Java" matching "JavaScript"
// or "C" matching "React".
function skillFoundIn(skill: string, text: string): boolean {
  const lowerText = text.toLowerCase();
  return getVariants(skill).some((variant) => {
    const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Word boundary: not preceded or followed by a letter/digit
    const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    return re.test(lowerText);
  });
}

// ─── Scoring ──────────────────────────────────────────────────────────────────
// Up to 90 points from skill matching + up to 10 points recency bonus.
//
// Skill matching is weighted by field importance:
//   Title       × 4  — a skill in the title signals it is core to the role
//   Requirements × 3  — explicit requirements carry more signal than prose
//   Description  × 1  — description is noisier; weighted lowest
//
// Each skill contributes its weighted field hits divided by the max possible
// weighted hits across all skills. This means the score reflects the
// *proportion* of your skills that are relevant, not the raw count, so a
// candidate with 5 skills and 3 matches scores the same as one with 10 skills
// and 6 matches (both 60 %).
//
// Recency bonus decays exponentially: full 10 pts on day 0, ~5 pts at 30 days,
// ~1 pt at 90 days. This gently surfaces fresher postings among equally scored
// jobs without distorting the skill signal.
function scoreJob(job: Job, skills: string[]): number {
  if (skills.length === 0) return 0;

  const fields = [
    { text: job.title,            weight: 4 },
    { text: job.requirements ?? "", weight: 3 },
    { text: job.description,       weight: 1 },
  ];

  let totalHits    = 0;
  let totalPossible = 0;

  for (const skill of skills) {
    for (const { text, weight } of fields) {
      totalPossible += weight;
      if (text && skillFoundIn(skill, text)) totalHits += weight;
    }
  }

  const skillScore = totalPossible > 0 ? (totalHits / totalPossible) * 90 : 0;

  // Exponential recency decay — half-life ≈ 30 days
  const daysSincePosted = job.createdAt
    ? (Date.now() - new Date(job.createdAt).getTime()) / 86_400_000
    : 365;
  const recencyBonus = 10 * Math.exp(-daysSincePosted / 43); // 43 ≈ 30/ln2

  return Math.min(100, Math.round(skillScore + recencyBonus));
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function JobsPage() {
  const user = await getCurrentDbUser();
  const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));

  let skills: string[] = [];

  if (user) {
    const [profile] = await db
      .select({
        skills: candidateProfiles.skills,
        resumeData: candidateProfiles.resumeData,
      })
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, user.id))
      .limit(1);

    if (profile) {
      const direct = profile.skills ?? [];
      const fromResume =
        (profile.resumeData as { skills?: string[] } | null)?.skills ?? [];
      skills = direct.length > 0 ? direct : fromResume;
    }
  }

  const scoredJobs = allJobs.map((job) => ({
    ...job,
    matchScore: scoreJob(job, skills),
  }));

  const topMatches = [...scoredJobs]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  return (
    <JobsClient
      allJobs={scoredJobs}
      topMatches={topMatches}
      hasProfile={skills.length > 0}
    />
  );
}
