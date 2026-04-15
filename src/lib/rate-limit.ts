// ============================================================
// FIX #4: src/lib/rate-limit.ts — Redis-based Rate Limiter
// ============================================================
// PROBLEM: In-memory Map resets on every Vercel serverless cold start.
//          Each request can get a fresh instance → NO rate limiting in production.
// FIX:     Use Upstash Redis (serverless-compatible, free tier = 10K req/day).
//          Falls back to in-memory for local dev (where it actually works).
//
// INSTALL: npm install @upstash/ratelimit @upstash/redis
//
// ADD TO .env:
//   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
//   UPSTASH_REDIS_REST_TOKEN=AXxx...
//
// GET THESE FROM: https://console.upstash.com → Create Database → REST API tab
//
// FILE:    src/lib/rate-limit.ts (replace entire file)
// ============================================================

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Production: Upstash Redis ────────────────────────────────
const isProduction =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

let redisLimiters: Map<string, Ratelimit> | null = null;

function getRedisLimiter(maxRequests: number, windowMs: number): Ratelimit {
  if (!redisLimiters) redisLimiters = new Map();

  const cacheKey = `${maxRequests}:${windowMs}`;
  if (redisLimiters.has(cacheKey)) return redisLimiters.get(cacheKey)!;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
    analytics: false,
    prefix: "rl",
  });

  redisLimiters.set(cacheKey, limiter);
  return limiter;
}

// ── Development fallback: in-memory (works fine locally) ─────
const memHits = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memHits.get(key);

  if (!entry || now > entry.resetAt) {
    memHits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// ── Unified API ──────────────────────────────────────────────
export async function rateLimitAsync(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (isProduction) {
    const limiter = getRedisLimiter(maxRequests, windowMs);
    const result = await limiter.limit(key);
    return { allowed: result.success, remaining: result.remaining };
  }
  return memoryRateLimit(key, maxRequests, windowMs);
}

// Synchronous wrapper for backward compatibility (dev only)
// In production routes, migrate to rateLimitAsync
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  if (isProduction) {
    // In production, this sync version can't call Redis.
    // Log a warning so developer knows to migrate.
    console.warn(
      `[rate-limit] Sync rateLimit() called in production for key "${key}". ` +
      `Migrate to rateLimitAsync() for proper Redis-backed limiting.`
    );
    return { allowed: true, remaining: maxRequests };
  }
  return memoryRateLimit(key, maxRequests, windowMs);
}
