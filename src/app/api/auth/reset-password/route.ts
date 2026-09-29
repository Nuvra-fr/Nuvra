import { z } from 'zod';
import { and, eq, isNull, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, passwordResetTokens, sessions } from '@/db/schema';
import { hashPassword, sha256, getIp } from '@/lib/auth';
import { jsonError, jsonOk, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request): Promise<Response> {
  const ip = await getIp();
  const rl = rateLimit(`reset:${ip ?? 'unknown'}`, 10, 60);
  if (!rl.ok)
    return jsonError('Trop de tentatives. Réessayez dans un instant.', 429);

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return jsonError(
      'Requête invalide. Le mot de passe doit contenir au moins 8 caractères.',
    );

  const row = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, sha256(parsed.data.token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .get();

  if (!row)
    return jsonError(
      'Ce lien de réinitialisation est invalide ou expiré.',
      400,
    );

  const passwordHash = await hashPassword(parsed.data.password);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, row.userId))
    .run();
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.id))
    .run();
  // Invalidate all sessions after a password reset
  await db.delete(sessions).where(eq(sessions.userId, row.userId)).run();

  await audit('auth.password_reset', {
    actorUserId: row.userId,
    target: row.userId,
    ip,
  });

  return jsonOk({
    message: 'Mot de passe mis à jour. Vous pouvez vous connecter.',
  });
}
