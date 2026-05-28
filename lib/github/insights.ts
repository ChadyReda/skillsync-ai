import { ai } from "@/lib/ai";
import type { GitHubData, GitHubInsights } from "./types";

export async function generateGitHubInsights(
  githubData: GitHubData,
  candidateName?: string | null
): Promise<GitHubInsights> {
  const langSummary = githubData.topLanguages
    .map((l) => `${l.name} (${l.percentage}%)`)
    .join(", ");

  const repoSummary = githubData.topRepos
    .slice(0, 4)
    .map(
      (r) =>
        `${r.name}: ${r.description ?? "No description"} (⭐ ${r.stars}, ${r.language ?? "Unknown"})`
    )
    .join("\n");

  const prompt = `You are an expert engineering recruiter and senior tech career coach.
Analyze this GitHub profile and generate sharp, specific engineering insights. Avoid generic statements.

Developer: ${candidateName ?? githubData.username}
GitHub: @${githubData.username}
Public Repos: ${githubData.publicRepos}
Total Stars: ${githubData.totalStars}
Followers: ${githubData.followers}
Activity: ${githubData.contributionActivity.level.replace("_", " ")}
Dev Score: ${githubData.developerScore}/100
Top Languages: ${langSummary || "Not determined"}

Top Projects:
${repoSummary || "No public projects"}

Return a JSON object with these exact keys:
{
  "strengths": ["3-5 specific engineering strengths grounded in their profile data"],
  "careerPaths": ["3-4 career paths or roles that match their technical stack"],
  "expertise": ["3-5 specific technical expertise areas"],
  "collaborationIndicators": ["2-3 observations about their open-source or collaboration style"],
  "overallProfile": "2-3 sentence professional developer profile summary"
}

Rules:
- Reference actual languages, projects, and stats
- Be specific, not generic ("Strong TypeScript ecosystem expertise" > "Good coding skills")
- Sound like a senior recruiter writing internal notes, not marketing copy`;

  const response = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content ?? "{}";

  let parsed: Partial<GitHubInsights> = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {};
  }

  return {
    strengths: parsed.strengths ?? [],
    careerPaths: parsed.careerPaths ?? [],
    expertise: parsed.expertise ?? [],
    collaborationIndicators: parsed.collaborationIndicators ?? [],
    overallProfile: parsed.overallProfile ?? "",
    generatedAt: new Date().toISOString(),
  };
}
