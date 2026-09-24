// Simple in-memory fixed-window rate limiter (single instance).
// Good for dev/demo; for multi-instance production use a shared store
// (Redis/Upstash) — documented in docs/SECURITY.md.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, max: number, windowSec = 60): RateResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, remaining: max - 1, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > max) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: max - b.count, retryAfterSec: 0 };
}

/** Periodic cleanup to avoid unbounded growth. */
const timer = setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}, 60_000);
if (typeof timer.unref === 'function') timer.unref();
