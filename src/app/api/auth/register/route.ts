import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, profiles, workspaces, memberships, domainEvents, emailVerificationTokens } from '@/db/schema';
import { hashPassword, getIp, sha256, createSession } from '@/lib/auth';
import { jsonError, jsonOk, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { appUrl, slugify, randomCode } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

function uniqueSlug(base: string): string {
  const root = slugify(base) || 'workspace';
  let slug = root;
  for (let i = 0; i < 50; i++) {
    const existing = db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.slug, slug)).get();
    if (!existing) return slug;
    slug = `${root}-${randomCode(4)}`;
  }
  return `${root}-${Date.now()}`;
}

function uniqueUsername(base: string): string {
  const root = slugify(base).replace(/-/g, '').slice(0, 18) || 'creator';
  let username = root;
  for (let i = 0; i < 50; i++) {
    const existing = db.select({ id: profiles.id }).from(profiles).where(eq(profiles.username, username)).get();
    if (!existing) return username;
    username = `${root}${randomCode(3)}`;
  }
  return `${root}${Date.now()}`;
}

export async function POST(req: Request): Promise<Response> {
  const ip = await getIp();
  const rl = rateLimit(`register:${ip ?? 'unknown'}`, 10, 60);
  if (!rl.ok) return jsonError('Too many attempts. Try again shortly.', 429, { retryAfter: rl.retryAfterSec });

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Please provide a valid name, email and a password of at least 8 characters.');
  }
  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).get();
  if (existing) return jsonError('An account with this email already exists.', 409);

  const passwordHash = await hashPassword(password);
  const username = uniqueUsername(name);
  const wsSlug = uniqueSlug(`${name}'s space`);

  const user = db
    .insert(users)
    .values({ name: name.trim(), email: normalizedEmail, passwordHash, role: 'USER', status: 'ACTIVE' })
    .returning({ id: users.id })
    .get();

  db.insert(profiles).values({ userId: user.id, username, onboardingStep: 0 }).run();
  const workspace = db
    .insert(workspaces)
    .values({ name: `${name.split(' ')[0]}'s space`, slug: wsSlug, ownerId: user.id, plan: 'FREE' })
    .returning({ id: workspaces.id, slug: workspaces.slug })
    .get();
  db.insert(memberships).values({ userId: user.id, workspaceId: workspace.id, role: 'OWNER' }).run();

  // Email verification (outbox when no provider configured)
  const verifyRaw = randomBytes(32).toString('hex');
  db.insert(emailVerificationTokens)
    .values({
      userId: user.id,
      tokenHash: sha256(verifyRaw),
      expiresAt: new Date(Date.now() + 24 * 3600_000),
    })
    .run();

  await sendEmail({
    to: normalizedEmail,
    subject: 'Welcome to Nuvra — verify your email',
    body: `Hi ${name},\n\nConfirm your email to finish setting up your Nuvra account:\n${appUrl(`/verify-email?token=${verifyRaw}`)}\n\n— The Nuvra team`,
    workspaceId: workspace.id,
    relatedTo: 'auth:verify',
  });

  db.insert(domainEvents)
    .values({
      name: 'user.created',
      workspaceId: workspace.id,
      userId: user.id,
      payload: JSON.stringify({ email: normalizedEmail, name, username }),
    })
    .run();

  audit('auth.register', { actorUserId: user.id, target: user.id, ip });

  // Sign the new user in right away so /onboarding (auth-guarded) can load.
  // Without a session the client is bounced /onboarding → /register in a loop.
  await createSession(user.id, ip, req.headers.get('user-agent'));

  return jsonOk({ next: '/onboarding', workspaceId: workspace.id });
}
