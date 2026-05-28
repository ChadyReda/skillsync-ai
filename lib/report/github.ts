import type { ReportPayload } from "./validation";

const GITHUB_API = "https://api.github.com";

export type GithubIssueResult =
  | { ok: true; url: string; number: number }
  | { ok: false; status: number; error: string };

function escapeMd(value: string): string {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildIssueBody(payload: ReportPayload): string {
  const lines: string[] = [];

  lines.push("## Reporter");
  lines.push(`Email: ${escapeMd(payload.email)}`);
  lines.push("");
  lines.push("## Description");
  lines.push(escapeMd(payload.description));
  lines.push("");

  if (payload.steps) {
    lines.push("## Reproduction Steps");
    lines.push(escapeMd(payload.steps));
    lines.push("");
  }

  if (payload.environment) {
    lines.push("## Environment");
    lines.push(escapeMd(payload.environment));
    lines.push("");
  }

  if (payload.url || payload.userAgent || payload.timestamp) {
    lines.push("## Metadata");
    if (payload.url) lines.push(`- **Page:** ${escapeMd(payload.url)}`);
    if (payload.userAgent) lines.push(`- **User Agent:** ${escapeMd(payload.userAgent)}`);
    if (payload.timestamp) lines.push(`- **Reported:** ${escapeMd(payload.timestamp)}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("Submitted from SkillSync Beta Feedback System");

  return lines.join("\n");
}

export async function createGithubIssue(
  payload: ReportPayload,
): Promise<GithubIssueResult> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return {
      ok: false,
      status: 500,
      error: "GitHub integration is not configured.",
    };
  }

  const body = buildIssueBody(payload);
  const title = `[Bug Report] ${payload.title}`;

  let response: Response;
  try {
    response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "SkillSync-Beta-Feedback",
      },
      body: JSON.stringify({
        title,
        body,
        labels: ["bug", "beta-feedback"],
      }),
    });
  } catch {
    return { ok: false, status: 502, error: "Failed to reach GitHub." };
  }

  if (!response.ok) {
    const status = response.status;
    let message = "GitHub rejected the request.";
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      /* ignore parse error */
    }
    return { ok: false, status, error: message };
  }

  const data = (await response.json()) as {
    html_url: string;
    number: number;
  };

  return { ok: true, url: data.html_url, number: data.number };
}
