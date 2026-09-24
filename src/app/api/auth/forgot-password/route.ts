import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/db/schema';
import { getIp, sha256 } from '@/lib/auth';
import { jsonError, jsonOk, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { appUrl } from '@/lib/utils';
import { audit } from '@/lib/audit';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request): Promise<Response> {
  const ip = await getIp();
  const rl = rateLimit(`forgot:${ip ?? 'unknown'}`, 5, 60);
  if (!rl.ok) return jsonError('Too many requests. Try again shortly.', 429, { retryAfter: rl.retryAfterSec });

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('Enter a valid email.');

  const email = parsed.data.email.toLowerCase().trim();
  const user = db.select().from(users).where(eq(users.email, email)).get();

  // Always answer success to avoid account enumeration
  if (user) {
    const raw = randomBytes(32).toString('hex');
    db.insert(passwordResetTokens)
      .values({
        userId: user.id,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + 3600_000),
      })
      .run();
    await sendEmail({
      to: email,
      subject: 'Reset your Nuvra password',
      body: `Someone requested a password reset for your Nuvra account.\n\nChoose a new password (valid 1 hour):\n${appUrl(`/reset-password?token=${raw}`)}\n\nIf this wasn't you, ignore this email.`,
      relatedTo: 'auth:reset',
    });
    audit('auth.forgot_requested', { actorUserId: user.id, target: user.id, ip });
  }

  return jsonOk({ message: 'If that account exists, a reset link has been sent.' });
}
