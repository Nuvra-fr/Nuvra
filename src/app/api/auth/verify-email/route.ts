import { z } from 'zod';
import { and, eq, isNull, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, emailVerificationTokens } from '@/db/schema';
import { sha256, getIp } from '@/lib/auth';
import { jsonError, jsonOk, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';

const schema = z.object({ token: z.string().min(10) });

export async function POST(req: Request): Promise<Response> {
  const ip = await getIp();
  const rl = rateLimit(`verify:${ip ?? 'unknown'}`, 10, 60);
  if (!rl.ok) return jsonError('Too many attempts. Try again shortly.', 429);

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('Invalid token.');

  const row = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.tokenHash, sha256(parsed.data.token)),
        isNull(emailVerificationTokens.usedAt),
        gt(emailVerificationTokens.expiresAt, new Date()),
      ),
    )
    .get();
  if (!row) return jsonError('This verification link is invalid or has expired.', 400);

  await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, row.userId)).run();
  await db.update(emailVerificationTokens).set({ usedAt: new Date() }).where(eq(emailVerificationTokens.id, row.id)).run();
  await audit('auth.email_verified', { actorUserId: row.userId, target: row.userId, ip });

  return jsonOk({ message: 'Email verified.' });
}
