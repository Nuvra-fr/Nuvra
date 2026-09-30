import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signed, short-lived URLs for private Academy media.
 *
 * Premium video files are never exposed as public URLs: the client asks the
 * API for an asset, the API checks the entitlement and returns a URL signed
 * with MEDIA_SIGNING_SECRET (falls back to the app secret) and an expiry.
 * Anything tampered with — asset id, expiry, user — fails the signature check.
 */
const DEFAULT_TTL_SEC = 300;

function secret(): string {
  return (
    process.env.MEDIA_SIGNING_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    'nuvra-dev-media-secret'
  );
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export interface MediaGrant {
  url: string;
  expiresAt: number;
  expiresIn: number;
}

export function issueMediaGrant(input: {
  assetId: string;
  userId: string;
  origin: string;
  ttlSeconds?: number;
}): MediaGrant {
  const expiresAt = Date.now() + (input.ttlSeconds ?? DEFAULT_TTL_SEC) * 1000;
  const payload = `${input.assetId}.${input.userId}.${expiresAt}`;
  const sig = sign(payload);
  const qs = new URLSearchParams({
    u: input.userId,
    exp: String(expiresAt),
    sig,
  });
  return {
    url: `${input.origin}/api/academy/media/${input.assetId}?${qs.toString()}`,
    expiresAt,
    expiresIn: Math.round((expiresAt - Date.now()) / 1000),
  };
}

export function verifyMediaGrant(input: {
  assetId: string;
  userId: string | null;
  expiresAt: string | null;
  sig: string | null;
}): { ok: true } | { ok: false; reason: string } {
  const { assetId, userId, expiresAt, sig } = input;
  if (!userId) return { ok: false, reason: 'missing-user' };
  if (!expiresAt || !sig) return { ok: false, reason: 'missing-signature' };
  const exp = Number(expiresAt);
  if (!Number.isFinite(exp)) return { ok: false, reason: 'bad-expiry' };
  if (exp < Date.now()) return { ok: false, reason: 'expired' };
  const expected = sign(`${assetId}.${userId}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: 'bad-signature' };
  }
  return { ok: true };
}
