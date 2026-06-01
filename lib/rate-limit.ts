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

export const RATE_LIMITS = {
  AI_CHAT: { limit: 60, windowMs: 10 * 60 * 1000 },       // 60 per 10 min
  CV_ANALYZE: { limit: 10, windowMs: 60 * 60 * 1000 },    // 10 per hour
  GITHUB_REFRESH: { limit: 15, windowMs: 60 * 60 * 1000 },// 15 per hour
  ROADMAP_GENERATE: { limit: 10, windowMs: 60 * 60 * 1000 },// 10 per hour
  TALENT_SEARCH: { limit: 60, windowMs: 10 * 60 * 1000 }, // 60 per 10 min
  AI_OUTREACH: { limit: 30, windowMs: 60 * 60 * 1000 },   // 30 per hour
} as const;
