type Bucket = { count: number; resetAt: number };
type TokenBucket = { tokens: number; resetAt: number };

const store = new Map<string, Bucket>();
const tokenStore = new Map<string, TokenBucket>();

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
  AI_CHAT:          { limit: 60,  windowMs: 10 * 60 * 1000 }, // 60 / 10 min
  CV_ANALYZE:       { limit: 10,  windowMs: 60 * 60 * 1000 }, // 10 / hr
  GITHUB_REFRESH:   { limit: 15,  windowMs: 60 * 60 * 1000 }, // 15 / hr
  ROADMAP_GENERATE: { limit: 10,  windowMs: 60 * 60 * 1000 }, // 10 / hr
  TALENT_SEARCH:    { limit: 60,  windowMs: 10 * 60 * 1000 }, // 60 / 10 min
  AI_OUTREACH:      { limit: 30,  windowMs: 60 * 60 * 1000 }, // 30 / hr
} as const;

// ─── Token-based rate limit for AI chat ─────────────────────────────────────

export const AI_CHAT_TOKEN_LIMIT = 10_000;
export const AI_CHAT_TOKEN_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function checkAIChatTokens(userId: string): {
  ok: boolean;
  retryAfter: number;
  used: number;
  remaining: number;
} {
  const key = `${userId}:ai-chat-tokens`;
  const now = Date.now();
  const bucket = tokenStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    return { ok: true, retryAfter: 0, used: 0, remaining: AI_CHAT_TOKEN_LIMIT };
  }

  if (bucket.tokens >= AI_CHAT_TOKEN_LIMIT) {
    return {
      ok: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      used: bucket.tokens,
      remaining: 0,
    };
  }

  return {
    ok: true,
    retryAfter: 0,
    used: bucket.tokens,
    remaining: AI_CHAT_TOKEN_LIMIT - bucket.tokens,
  };
}

export function recordAIChatTokens(userId: string, tokens: number): void {
  const key = `${userId}:ai-chat-tokens`;
  const now = Date.now();
  const bucket = tokenStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    tokenStore.set(key, { tokens, resetAt: now + AI_CHAT_TOKEN_WINDOW_MS });
  } else {
    bucket.tokens += tokens;
  }
}
