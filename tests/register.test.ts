/**
 * Regression test for the registration flow.
 *
 * Bug: POST /api/auth/register created the user but never opened a session,
 * so the client was sent to /onboarding (auth-guarded) which bounced back to
 * /register — a loop, and a second attempt failed with "email already exists".
 *
 * Runs the real route handler against a TEMP database with migrations
 * applied; `next/headers` is mocked with an in-memory cookie jar so the
 * handler can run outside of a Next.js request scope.
 */
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';

// ── In-memory stand-ins for next/headers (cookies + request headers) ────────
const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.7' }),
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

let db: import('@/lib/db').DB;
let schema: typeof import('@/db/schema');
let auth: typeof import('@/lib/auth');
let registerPOST: (req: Request) => Promise<Response>;

beforeAll(async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nuvra-register-test-'));
  process.env.DATABASE_URL = path.join(dir, 'test.db');

  const dbMod = await import('@/lib/db');
  db = dbMod.db;
  const { migrate } = await import('drizzle-orm/libsql/migrator');
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });

  schema = await import('@/db/schema');
  auth = await import('@/lib/auth');
  registerPOST = (await import('@/app/api/auth/register/route')).POST;
});

function registerRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'vitest' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  it('creates the account AND signs the user in (session cookie + row)', async () => {
    jar.clear();
    const res = await registerPOST(
      registerRequest({ name: 'Nadia Nouvelle', email: 'Nadia@Example.com', password: 'longenough1!' }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean; next: string; workspaceId: string };
    expect(data.ok).toBe(true);
    expect(data.next).toBe('/onboarding');

    // User, profile, workspace and OWNER membership exist
    const user = await db.select().from(schema.users).where(eq(schema.users.email, 'nadia@example.com')).get();
    expect(user).toBeTruthy();
    const membership = await db
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.userId, user!.id))
      .get();
    expect(membership?.role).toBe('OWNER');
    expect(membership?.workspaceId).toBe(data.workspaceId);

    // A session cookie was issued and maps to a persisted session for this user
    const token = jar.get('nuvra_session');
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    const session = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.tokenHash, auth.sha256(token!)))
      .get();
    expect(session?.userId).toBe(user!.id);
    expect(session!.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // …so the auth-guarded /onboarding page can resolve the new user
    const ctx = await auth.getSession();
    expect(ctx?.user.id).toBe(user!.id);
    expect(ctx?.workspace.id).toBe(data.workspaceId);
    expect(ctx?.profile?.onboardingStep).toBe(0);
  });

  it('rejects a duplicate email with 409 and does not touch the existing session', async () => {
    const before = jar.get('nuvra_session');
    const res = await registerPOST(
      registerRequest({ name: 'Nadia Again', email: 'nadia@example.com', password: 'longenough1!' }),
    );
    expect(res.status).toBe(409);
    expect(jar.get('nuvra_session')).toBe(before);
  });

  it('validates input (short password) without creating anything', async () => {
    const res = await registerPOST(registerRequest({ name: 'X', email: 'not-an-email', password: 'short' }));
    expect(res.status).toBe(400);
    const count = (await db.select().from(schema.users).all()).length;
    expect(count).toBe(1);
  });
});
