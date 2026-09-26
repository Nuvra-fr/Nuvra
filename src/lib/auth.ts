import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  memberships,
  profiles,
  sessions,
  users,
  workspaces,
  type User,
  type Profile,
  type Workspace,
  type Membership,
} from '@/db/schema';

const SESSION_COOKIE = 'nuvra_session';
const WS_COOKIE = 'nuvra_ws';
const SESSION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export async function createSession(userId: string, ip?: string | null, userAgent?: string | null) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await db.insert(sessions)
    .values({ userId, tokenHash: sha256(token), expiresAt, ip: ip ?? null, userAgent: userAgent ?? null })
    .run();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600,
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token))).run();
  jar.delete(SESSION_COOKIE);
  jar.delete(WS_COOKIE);
}

export interface AuthContext {
  user: User;
  profile: Profile | null;
  workspace: Workspace;
  membership: Membership;
}

async function loadContext(userId: string): Promise<AuthContext | null> {
  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user || user.status !== 'ACTIVE') return null;
  const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).get() ?? null;
  const rows = await db
    .select({ membership: memberships, workspace: workspaces })
    .from(memberships)
    .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
    .where(eq(memberships.userId, userId))
    .all();
  if (rows.length === 0) return null;
  const jar = await cookies();
  const preferred = jar.get(WS_COOKIE)?.value;
  const chosen = rows.find((r) => r.workspace.id === preferred) ?? rows.find((r) => r.membership.role === 'OWNER') ?? rows[0];
  return { user, profile, workspace: chosen!.workspace, membership: chosen!.membership };
}

export async function getSession(): Promise<AuthContext | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date())))
    .get();
  if (!row) return null;
  return loadContext(row.userId);
}

/** Page/action guard — redirects to /login when unauthenticated. */
export async function requireUser(): Promise<AuthContext> {
  const ctx = await getSession();
  if (!ctx) redirect('/login');
  return ctx;
}

/** JSON API guard — returns null when unauthenticated (respond 401 JSON). */
export async function requireUserJson(): Promise<AuthContext | null> {
  return getSession();
}

export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.user.role !== 'ADMIN') redirect('/dashboard');
  return ctx;
}

export async function getIp(): Promise<string | null> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null;
}

export async function switchWorkspace(workspaceId: string) {
  const ctx = await getSession();
  if (!ctx) return;
  const m = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, ctx.user.id), eq(memberships.workspaceId, workspaceId)))
    .get();
  if (!m) return;
  const jar = await cookies();
  jar.set(WS_COOKIE, workspaceId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 86400 * 365 });
}

/**
 * Multi-tenant resource guard — the IDOR defense.
 * Loads a row by id AND workspaceId in a single query; returns null when the
 * resource does not exist or belongs to another tenant.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- dynamic drizzle table
   parameter by design: the tenant guard runs the same query shape against
   many tables. Each call site passes a concrete table and receives a typed T. */
export async function ownedQuery<T extends { id: string }>(
  table: { id: any; workspaceId: any; [k: string]: any } & { _: any },
  id: string,
  workspaceId: string,
): Promise<T | null> {
  const rows = (await db
    .select()
    .from(table as any)
    .where(eq((table as any).id, id))
    .limit(1)
    .all() as T[]);
  const row = rows[0];
  if (!row) return null;
  if ((row as any).workspaceId !== workspaceId) return null;
  return row;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function tokensMatch(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
