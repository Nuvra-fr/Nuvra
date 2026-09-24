'use server';

import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { emailVerificationTokens } from '@/db/schema';
import { requireUser, sha256 } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { appUrl } from '@/lib/utils';

export async function sendVerificationEmailAction(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    if (ctx.user.emailVerifiedAt) return { ok: true };
    const raw = randomBytes(32).toString('hex');
    db.insert(emailVerificationTokens)
      .values({
        userId: ctx.user.id,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + 24 * 3600_000),
      })
      .run();
    await sendEmail({
      to: ctx.user.email,
      subject: 'Verify your Nuvra email',
      body: `Confirm your email:\n${appUrl(`/verify-email?token=${raw}`)}`,
      relatedTo: 'auth:verify',
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
