import { ai } from "@/lib/ai";

interface CandidateContext {
  name: string | null;
  email: string;
  bio: string | null;
  skills: string[] | null;
  level: number | null;
  xp: number | null;
  resumeScore: number | null;
  resumeInsights: {
    summary?: string;
    strengths?: string[];
    recommendedRoles?: string[];
  } | null;
  githubUsername: string | null;
  githubData: {
    totalStars: number;
    publicRepos: number;
    topLanguages: { name: string; percentage: number }[];
    developerScore: number;
  } | null;
  githubInsights: {
    strengths?: string[];
    careerPaths?: string[];
    expertise?: string[];
    overallProfile?: string;
  } | null;
  roadmaps: { title: string; completedNodes: number; totalNodes: number }[];
}

interface RecruiterContext {
  name: string;
  companyName: string | null;
  position: string | null;
}

export interface GenerateEmailOptions {
  candidate: CandidateContext;
  recruiter: RecruiterContext;
  tone: "professional" | "casual" | "enthusiastic";
  jobTitle?: string | null;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export async function generateOutreachEmail({
  candidate,
  recruiter,
  tone,
  jobTitle,
}: GenerateEmailOptions): Promise<GeneratedEmail> {
  const toneDescriptions = {
    professional:
      "formal, polished, and precise — like a senior in-house recruiter",
    casual:
      "warm, friendly, and conversational — approachable but still respectful",
    enthusiastic:
      "energetic, genuinely excited — enthusiastic about this specific candidate",
  };

  const langText = candidate.githubData?.topLanguages
    .slice(0, 3)
    .map((l) => l.name)
    .join(", ");

  const roadmapText = candidate.roadmaps
    .filter((r) => r.totalNodes > 0)
    .map(
      (r) =>
        `${r.title} (${Math.round((r.completedNodes / Math.max(r.totalNodes, 1)) * 100)}% complete)`
    )
    .join(", ");

  const skillsText = candidate.skills?.slice(0, 8).join(", ");

  const contextLines = [
    `Recruiter Name: ${recruiter.name}`,
    `Company: ${recruiter.companyName ?? "our company"}`,
    recruiter.position ? `Recruiter Role: ${recruiter.position}` : null,
    jobTitle ? `Position Being Offered: ${jobTitle}` : null,
    "",
    `Candidate Name: ${candidate.name ?? "Candidate"}`,
    `Candidate Email: ${candidate.email}`,
    candidate.bio ? `Bio: ${candidate.bio}` : null,
    skillsText ? `Skills: ${skillsText}` : null,
    langText ? `Primary Languages (GitHub): ${langText}` : null,
    candidate.resumeScore !== null
      ? `Resume Score: ${candidate.resumeScore}/100`
      : null,
    candidate.level ? `Platform Level: ${candidate.level} (${candidate.xp ?? 0} XP)` : null,
    candidate.resumeInsights?.summary
      ? `Resume Summary: ${candidate.resumeInsights.summary}`
      : null,
    candidate.resumeInsights?.strengths?.length
      ? `Key Strengths: ${candidate.resumeInsights.strengths.slice(0, 3).join("; ")}`
      : null,
    candidate.githubData
      ? `GitHub: ${candidate.githubData.publicRepos} repos, ${candidate.githubData.totalStars} stars, DevScore ${candidate.githubData.developerScore}/100`
      : null,
    candidate.githubInsights?.overallProfile
      ? `GitHub Profile: ${candidate.githubInsights.overallProfile}`
      : null,
    roadmapText ? `Learning Journey: ${roadmapText}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are a world-class tech recruiter known for writing outreach emails that candidates actually respond to.

Tone: ${toneDescriptions[tone]}

Context:
${contextLines}

Write a personalized outreach email following these rules:
- Feel genuinely personal, NOT template-based
- Reference specific things about this candidate (their actual skills, GitHub stats, learning journey)
- Keep it concise: 3-4 short paragraphs
- Include a soft, clear call to action (schedule a call, reply to chat, etc.)
- NEVER use: "I came across your profile", "exciting opportunity", "I'm reaching out because"
- DO reference: their specific languages, projects, or learning progress
- Sign off naturally as the recruiter

Return JSON:
{
  "subject": "A short, specific, intriguing subject line (not generic)",
  "body": "The full email body. Use \\n\\n between paragraphs."
}`;

  const response = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.85,
  });

  const content = response.choices[0]?.message?.content ?? "{}";

  let parsed: { subject?: string; body?: string } = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {};
  }

  return {
    subject:
      parsed.subject ??
      `Opportunity at ${recruiter.companyName ?? "our company"}`,
    body:
      parsed.body ??
      "We'd love to connect about an opportunity that matches your background.",
  };
}
