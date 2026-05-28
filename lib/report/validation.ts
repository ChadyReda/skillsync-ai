export const LIMITS = {
  email: 200,
  title: 140,
  description: 5000,
  steps: 3000,
  environment: 1000,
  url: 500,
  userAgent: 500,
} as const;

export type ReportPayload = {
  email: string;
  title: string;
  description: string;
  steps?: string;
  environment?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
};

export type ValidationResult =
  | { ok: true; data: ReportPayload }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isInvisible(code: number): boolean {
  // C0 controls except \t (9), \n (10), \r (13)
  if (code < 0x20 && code !== 9 && code !== 10 && code !== 13) return true;
  // DEL + C1 controls
  if (code >= 0x7f && code <= 0x9f) return true;
  // Zero-width and bidi formatting chars
  if (code >= 0x200b && code <= 0x200f) return true;
  if (code >= 0x202a && code <= 0x202e) return true;
  if (code >= 0x2066 && code <= 0x2069) return true;
  if (code === 0xfeff) return true;
  return false;
}

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0)!;
    if (!isInvisible(code)) out += ch;
  }
  return out.trim().slice(0, max);
}

export function validateReport(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = input as Record<string, unknown>;

  const email = clean(raw.email, LIMITS.email);
  const title = clean(raw.title, LIMITS.title);
  const description = clean(raw.description, LIMITS.description);
  const steps = clean(raw.steps, LIMITS.steps);
  const environment = clean(raw.environment, LIMITS.environment);
  const url = clean(raw.url, LIMITS.url);
  const userAgent = clean(raw.userAgent, LIMITS.userAgent);
  const timestamp = clean(raw.timestamp, 64);

  if (!email) return { ok: false, error: "Email is required." };
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email." };
  }
  if (!title || title.length < 4) {
    return { ok: false, error: "Title must be at least 4 characters." };
  }
  if (!description || description.length < 10) {
    return { ok: false, error: "Description must be at least 10 characters." };
  }

  return {
    ok: true,
    data: {
      email,
      title,
      description,
      steps: steps || undefined,
      environment: environment || undefined,
      url: url || undefined,
      userAgent: userAgent || undefined,
      timestamp: timestamp || undefined,
    },
  };
}
