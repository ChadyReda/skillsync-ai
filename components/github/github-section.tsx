import {
  Cube,
  Diamond,
  Triangle,
  Tetra,
  GridSquares,
  FilledSquare,
  Octa,
  HexPrism,
  ArrowOut,
} from "@/components/ui/polyhedron";
import type {
  GitHubData,
  GitHubInsights,
  ActivityLevel,
} from "@/lib/github/types";

interface Props {
  githubData: GitHubData;
  githubInsights: GitHubInsights | null;
  githubUsername: string;
  lastUpdated?: string | null;
}

const ACTIVITY_DOT: Record<ActivityLevel, string> = {
  very_high: "bg-emerald-400",
  high: "bg-emerald-400",
  moderate: "bg-amber-400",
  low: "bg-zinc-500",
};

function DevScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-black">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#27272a"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#fafafa"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
        />
      </svg>
      <span className="text-sm font-bold tabular-nums text-white">{score}</span>
    </div>
  );
}

export default function GitHubSection({
  githubData,
  githubInsights,
  githubUsername,
  lastUpdated,
}: Props) {
  const activityDot = ACTIVITY_DOT[githubData.contributionActivity.level];

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          <Cube className="h-3 w-3" />
          GitHub Analytics
        </p>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Updated {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-black px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <ArrowOut className="h-3 w-3" />
            @{githubUsername}
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-zinc-800 md:grid-cols-4">
        {[
          {
            label: "Repositories",
            value: githubData.publicRepos,
            icon: Triangle,
          },
          {
            label: "Total Stars",
            value: githubData.totalStars,
            icon: Diamond,
          },
          {
            label: "Followers",
            value: githubData.followers,
            icon: GridSquares,
          },
          {
            label: "Dev Score",
            value: `${githubData.developerScore}/100`,
            icon: Tetra,
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={[
              "bg-black p-4",
              i < 3 && "md:border-r border-zinc-800",
              i < 2 && "border-r border-zinc-800 md:border-r",
              i === 0 || i === 1 ? "border-b border-zinc-800 md:border-b-0" : "",
            ].join(" ")}
          >
            <div className="mb-2 flex items-center gap-2">
              <stat.icon className="h-3 w-3 text-white" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {stat.label}
              </span>
            </div>
            <div className="text-xl font-bold tabular-nums text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Languages */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <Triangle className="h-3 w-3" />
            Top Languages
          </p>
          {githubData.topLanguages.length > 0 ? (
            <div className="space-y-3">
              {githubData.topLanguages.map((lang) => (
                <div key={lang.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="text-sm text-zinc-300">{lang.name}</span>
                    </div>
                    <span className="font-mono text-[10px] tabular-nums uppercase tracking-wider text-zinc-500">
                      {lang.percentage}%
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden border border-zinc-800 bg-black">
                    <div
                      className="h-full"
                      style={{
                        width: `${lang.percentage}%`,
                        backgroundColor: lang.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No language data available.</p>
          )}
        </div>

        {/* Activity + Score */}
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              <Octa className="h-3 w-3" />
              Activity Level
            </p>
            <div className="mb-2 flex items-center gap-2">
              <div className={`h-1.5 w-1.5 animate-pulse ${activityDot}`} />
              <span className="text-sm font-semibold capitalize text-white">
                {githubData.contributionActivity.level.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              {githubData.contributionActivity.description}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            <DevScoreRing score={githubData.developerScore} />
            <div>
              <div className="mb-1 text-sm font-semibold text-white">
                Developer Score
              </div>
              <div className="text-xs leading-relaxed text-zinc-500">
                Based on repos, stars, followers &amp; activity
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Repos */}
      {githubData.topRepos.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <HexPrism className="h-3 w-3" />
            Featured Projects
          </p>
          <div className="grid overflow-hidden rounded-lg border border-zinc-800 sm:grid-cols-2">
            {githubData.topRepos.slice(0, 4).map((repo, i) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "group bg-black p-4 transition-colors hover:bg-zinc-950",
                  i % 2 === 0 && "sm:border-r border-zinc-800",
                  i < 2 && githubData.topRepos.length > 2
                    ? "border-b border-zinc-800"
                    : "",
                ].join(" ")}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="truncate text-sm font-medium text-white">
                    {repo.name}
                  </span>
                  <ArrowOut className="mt-0.5 h-3 w-3 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-300" />
                </div>
                {repo.description && (
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <Triangle className="h-3 w-3" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Diamond className="h-3 w-3" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <HexPrism className="h-3 w-3" />
                    {repo.forks}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* AI Engineering Insights */}
      {githubInsights && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <Diamond className="h-3 w-3" />
            AI Engineering Insights
          </p>

          {githubInsights.overallProfile && (
            <p className="border-b border-zinc-800 pb-4 text-sm leading-relaxed text-zinc-300">
              {githubInsights.overallProfile}
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {githubInsights.strengths.length > 0 && (
              <div>
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Engineering Strengths
                </p>
                <ul className="space-y-2">
                  {githubInsights.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-zinc-300"
                    >
                      <FilledSquare className="mt-1 h-2 w-2 shrink-0 text-white" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {githubInsights.expertise.length > 0 && (
              <div>
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Detected Expertise
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {githubInsights.expertise.map((e, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-zinc-800 bg-black px-2.5 py-1 text-xs text-zinc-300"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {githubInsights.careerPaths.length > 0 && (
              <div>
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Career Path Fit
                </p>
                <ul className="space-y-2">
                  {githubInsights.careerPaths.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-zinc-300"
                    >
                      <Tetra className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {githubInsights.collaborationIndicators.length > 0 && (
              <div>
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Collaboration
                </p>
                <ul className="space-y-2">
                  {githubInsights.collaborationIndicators.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-zinc-300"
                    >
                      <GridSquares className="mt-0.5 h-3 w-3 shrink-0 text-white" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
