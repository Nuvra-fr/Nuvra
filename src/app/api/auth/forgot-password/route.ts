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
  if (!rl.ok)
    return jsonError('Trop de demandes. Réessayez dans un instant.', 429, {
      retryAfter: rl.retryAfterSec,
    });

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('Saisissez un email valide.');

  const email = parsed.data.email.toLowerCase().trim();
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  // Always answer success to avoid account enumeration
  if (user) {
    const raw = randomBytes(32).toString('hex');
    await db
      .insert(passwordResetTokens)
      .values({
        userId: user.id,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + 3600_000),
      })
      .run();
    await sendEmail({
      to: email,
      subject: 'Réinitialisez votre mot de passe Nuvra',
      body: `Une réinitialisation de mot de passe a été demandée pour votre compte Nuvra.\n\nChoisissez un nouveau mot de passe (valable 1 heure) :\n${appUrl(`/reset-password?token=${raw}`)}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
      relatedTo: 'auth:reset',
    });
    await audit('auth.forgot_requested', {
      actorUserId: user.id,
      target: user.id,
      ip,
    });
  }

  return jsonOk({
    message: 'Si ce compte existe, un lien de réinitialisation a été envoyé.',
  });
}
