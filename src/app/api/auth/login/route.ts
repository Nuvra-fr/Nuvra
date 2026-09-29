import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { verifyPassword, createSession, getIp } from '@/lib/auth';
import { jsonError, jsonOk, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request): Promise<Response> {
  const ip = await getIp();
  const rl = rateLimit(`login:${ip ?? 'unknown'}`, 15, 60);
  if (!rl.ok)
    return jsonError(
      'Trop de tentatives de connexion. Réessayez dans un instant.',
      429,
      { retryAfter: rl.retryAfterSec },
    );

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return jsonError('Saisissez un email et un mot de passe valides.');

  const email = parsed.data.email.toLowerCase().trim();
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  // Constant-shape failure: always verify against something
  const valid = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : await verifyPassword(
        parsed.data.password,
        '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva',
      );

  if (!user || !valid) {
    await audit('auth.login_failed', { target: email, ip });
    return jsonError('Email ou mot de passe incorrect.', 401);
  }
  if (user.status !== 'ACTIVE') {
    return jsonError('Ce compte est suspendu. Contactez le support.', 403);
  }

  const ua = req.headers.get('user-agent');
  await createSession(user.id, ip, ua);
  await audit('auth.login', { actorUserId: user.id, target: user.id, ip });

  return jsonOk({
    next: '/dashboard',
    user: { id: user.id, name: user.name, role: user.role },
  });
}
