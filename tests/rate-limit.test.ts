import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit (fixed window)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows up to max requests then blocks', () => {
    const key = 'test:' + Math.random();
    for (let i = 0; i < 5; i++) {
      const r = rateLimit(key, 5, 60);
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(4 - i);
    }
    const blocked = rateLimit(key, 5, 60);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('resets after the window', () => {
    const key = 'test:' + Math.random();
    expect(rateLimit(key, 1, 10).ok).toBe(true);
    expect(rateLimit(key, 1, 10).ok).toBe(false);
    vi.advanceTimersByTime(11_000);
    expect(rateLimit(key, 1, 10).ok).toBe(true);
  });

  it('keeps keys independent', () => {
    expect(rateLimit('k-a', 1, 60).ok).toBe(true);
    expect(rateLimit('k-b', 1, 60).ok).toBe(true);
    expect(rateLimit('k-a', 1, 60).ok).toBe(false);
    expect(rateLimit('k-b', 1, 60).ok).toBe(false);
  });
});
