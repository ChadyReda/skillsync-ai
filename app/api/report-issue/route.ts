import { createGithubIssue } from "@/lib/report/github";
import { validateReport } from "@/lib/report/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const validation = validateReport(json);
  if (!validation.ok) {
    return Response.json(
      { ok: false, error: validation.error },
      { status: 400 },
    );
  }

  const result = await createGithubIssue(validation.data);
  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error },
      { status: result.status >= 500 ? 502 : result.status },
    );
  }

  return Response.json({
    ok: true,
    issue: { number: result.number, url: result.url },
  });
}
