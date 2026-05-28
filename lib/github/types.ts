export interface GitHubRepo {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  url: string;
  updatedAt: string;
}

export interface GitHubLanguage {
  name: string;
  percentage: number;
  color: string;
}

export type ActivityLevel = "low" | "moderate" | "high" | "very_high";

export interface GitHubData {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  topLanguages: GitHubLanguage[];
  topRepos: GitHubRepo[];
  contributionActivity: {
    level: ActivityLevel;
    description: string;
  };
  developerScore: number;
  fetchedAt: string;
}

export interface GitHubInsights {
  strengths: string[];
  careerPaths: string[];
  expertise: string[];
  collaborationIndicators: string[];
  overallProfile: string;
  generatedAt: string;
}
