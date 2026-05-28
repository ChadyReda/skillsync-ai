import { NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/report/rate-limit";
import { createGithubIssue } from "@/lib/report/github";
import { validateReport } from "@/lib/report/validation";

export const runtime = "nodejs";

function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(`report:${clientKey(req)}`);
  if (!limit.ok) {
    return Response.json(
      {
        ok: false,
        error: "Too many submissions. Please wait before trying again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  }

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
