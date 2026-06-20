"use server";

import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { jobs } from "@/src/db/schemas/jobs";
import { eq } from "drizzle-orm";
import { ai } from "@/lib/ai";

export type MatchResult = {
  score: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
};

export async function matchResumeToJob(jobId: string): Promise<MatchResult> {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");

  const [[profile], [job]] = await Promise.all([
    db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, user.id)).limit(1),
    db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1),
  ]);

  if (!profile?.resumeText) throw new Error("No resume found. Upload your resume first.");
  if (!job) throw new Error("Job not found.");

  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a career advisor. Analyse how well a candidate's resume matches a job posting.
Return ONLY valid JSON:
{
  "score": 0-100,
  "summary": "2-3 sentence honest assessment",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "suggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"]
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          resume: profile.resumeText,
          jobTitle: job.title,
          jobDescription: job.description,
          jobRequirements: job.requirements,
          requiredSkills: job.skills,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("AI analysis failed.");
  return JSON.parse(content) as MatchResult;
}
