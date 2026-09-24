import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword, sha256, tokensMatch } from '@/lib/auth';

describe('password hashing (bcrypt, salted — never stored in clear)', () => {
  it('verifies a correct password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('secret-password');
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
    expect(await verifyPassword('', hash)).toBe(false);
  });

  it('produces a different hash each time (salt) but both verify', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).not.toBe(b);
    expect(await verifyPassword('same', a)).toBe(true);
    expect(await verifyPassword('same', b)).toBe(true);
  });
});

describe('sha256', () => {
  it('is deterministic hex of expected length', () => {
    const h = sha256('nuvra');
    expect(h).toBe(sha256('nuvra'));
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('tokensMatch (timing-safe comparison)', () => {
  it('matches equal tokens and rejects different ones', () => {
    expect(tokensMatch('abc123', 'abc123')).toBe(true);
    expect(tokensMatch('abc123', 'abc124')).toBe(false);
    expect(tokensMatch('abc', 'abcdef')).toBe(false);
  });
});
