type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

export function checkRateLimit(config: RateLimitConfig): {
  ok: boolean;
  retryAfter: number;
  remaining: number;
} {
  const now = Date.now();
  const bucket = store.get(config.key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(config.key, { count: 1, resetAt: now + config.windowMs });
    return { ok: true, retryAfter: 0, remaining: config.limit - 1 };
  }

  if (bucket.count >= config.limit) {
    return {
      ok: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0, remaining: config.limit - bucket.count };
}

export function enforceRateLimit(config: RateLimitConfig): void {
  const result = checkRateLimit(config);
  if (!result.ok) {
    throw new Error(
      `Rate limit exceeded. Please wait ${result.retryAfter} seconds before trying again.`
    );
  }
}

export const RATE_LIMITS = {
  AI_CHAT: { limit: 25, windowMs: 10 * 60 * 1000 },
  CV_ANALYZE: { limit: 3, windowMs: 60 * 60 * 1000 },
  GITHUB_REFRESH: { limit: 5, windowMs: 60 * 60 * 1000 },
  ROADMAP_GENERATE: { limit: 5, windowMs: 60 * 60 * 1000 },
  TALENT_SEARCH: { limit: 20, windowMs: 10 * 60 * 1000 },
  AI_OUTREACH: { limit: 15, windowMs: 60 * 60 * 1000 },
} as const;
