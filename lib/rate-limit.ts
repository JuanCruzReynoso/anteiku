/**
 * Sliding window rate limiter backed by Upstash Redis.
 * Falls back to a no-op (always allow) when Upstash env vars are not configured
 * (e.g. local development without Redis).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // No Upstash config — rate limiting disabled (dev mode)
    return null;
  }

  limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
  });

  return limiter;
}

/**
 * Check and record a request for the given key.
 * Returns whether the request is allowed and how many remain.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const l = getLimiter();

  // Dev fallback — always allow
  if (!l) {
    return { allowed: true, remaining: limit };
  }

  const windowSeconds = Math.ceil(windowMs / 1000);

  // Create a per-key limiter with the specified window
  const keyLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    analytics: false,
  });

  const { success, remaining } = await keyLimiter.limit(key);

  return { allowed: success, remaining: Math.max(0, remaining) };
}
