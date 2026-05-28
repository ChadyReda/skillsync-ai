import type { GitHubData, GitHubRepo, GitHubLanguage, ActivityLevel } from "./types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Rust: "#dea584",
  Go: "#00ADD8",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  R: "#198CE7",
  Vue: "#41b883",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Perl: "#0298c3",
};

export async function fetchGitHubData(username: string): Promise<GitHubData> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers,
    next: { revalidate: 3600 },
  });

  if (!userRes.ok) {
    if (userRes.status === 404) throw new Error("GitHub user not found");
    if (userRes.status === 403) throw new Error("GitHub API rate limit reached. Try adding a GITHUB_TOKEN.");
    throw new Error(`GitHub API error: ${userRes.status}`);
  }

  const user = await userRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    { headers, next: { revalidate: 3600 } }
  );

  const repos: any[] = reposRes.ok ? await reposRes.json() : [];
  const ownRepos = repos.filter((r) => !r.fork);

  const topRepos: GitHubRepo[] = ownRepos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      description: r.description ?? null,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language ?? null,
      url: r.html_url,
      updatedAt: r.updated_at,
    }));

  const langCount: Record<string, number> = {};
  for (const repo of ownRepos) {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] ?? 0) + 1;
    }
  }

  const totalLangCount = Object.values(langCount).reduce((a, b) => a + b, 0);
  const topLanguages: GitHubLanguage[] = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / Math.max(totalLangCount, 1)) * 100),
      color: LANGUAGE_COLORS[name] ?? "#8b5cf6",
    }));

  const totalStars = ownRepos.reduce((acc, r) => acc + r.stargazers_count, 0);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentRepos = repos.filter((r) => {
    const updated = new Date(r.pushed_at ?? r.updated_at);
    return updated > threeMonthsAgo;
  });

  const activityRatio = recentRepos.length / Math.max(repos.length, 1);
  const activityLevel: ActivityLevel =
    activityRatio > 0.6
      ? "very_high"
      : activityRatio > 0.3
        ? "high"
        : activityRatio > 0.1
          ? "moderate"
          : "low";

  const activityDescriptions: Record<ActivityLevel, string> = {
    very_high: "Highly active — frequent commits and project updates",
    high: "Active — regular engagement with multiple repositories",
    moderate: "Moderate activity — consistent but measured contributions",
    low: "Low activity — limited recent public activity",
  };

  const developerScore = Math.min(
    100,
    Math.round(
      (Math.min(user.public_repos, 50) / 50) * 30 +
        (Math.min(totalStars, 200) / 200) * 30 +
        (Math.min(user.followers, 100) / 100) * 20 +
        activityRatio * 20
    )
  );

  return {
    username: user.login,
    name: user.name ?? null,
    bio: user.bio ?? null,
    avatarUrl: user.avatar_url,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    totalStars,
    topLanguages,
    topRepos,
    contributionActivity: {
      level: activityLevel,
      description: activityDescriptions[activityLevel],
    },
    developerScore,
    fetchedAt: new Date().toISOString(),
  };
}
