import path from 'node:path';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db, databaseFile, databaseTarget } from '@/lib/db';
import { memberships, profiles, users, workspaces } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { ensurePlans } from '@/lib/billing';
import { slugify, randomCode } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// Startup tasks — run ONCE when the Node server boots (see
// src/instrumentation.ts). They make a fresh deployment usable without
// shell access to the host:
//
//   1. apply pending Drizzle migrations       (AUTO_MIGRATE, default on)
//   2. make sure subscription plans exist
//   3. provision the first administrator + the platform workspace from
//      ADMIN_EMAIL / ADMIN_PASSWORD             (only when no admin exists)
//
// Everything is idempotent: restarting the server is always safe.
// On Vercel the same bootstrap runs at BUILD time (see vercel.json) instead
// of at boot: serverless instances have no startup hook and no disk.
// ─────────────────────────────────────────────────────────────

const log = (msg: string) => console.log(`[nuvra:startup] ${msg}`);

export async function migrateDatabase(): Promise<void> {
  if (process.env.AUTO_MIGRATE === 'false') {
    log('AUTO_MIGRATE=false — skipping migrations');
    return;
  }
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
  log(`database ready (${databaseFile()})`);
}

export interface BootstrapResult {
  status: 'skipped' | 'exists' | 'created' | 'promoted';
  email?: string;
}

/**
 * First-admin bootstrap. Never touches an existing ADMIN, never logs the
 * password, never downgrades anyone. Safe to leave the env vars in place.
 */
export async function ensureAdmin(): Promise<BootstrapResult> {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return { status: 'skipped' };

  const existingAdmin = await db.select({ id: users.id }).from(users).where(eq(users.role, 'ADMIN')).get();
  if (existingAdmin) return { status: 'exists' };

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  let admin = await db.select().from(users).where(eq(users.email, email)).get();
  let result: BootstrapResult['status'];

  if (admin) {
    await db
      .update(users)
      .set({ role: 'ADMIN', status: 'ACTIVE', emailVerifiedAt: admin.emailVerifiedAt ?? new Date(), updatedAt: new Date() })
      .where(eq(users.id, admin.id))
      .run();
    result = 'promoted';
  } else {
    const name = process.env.ADMIN_NAME?.trim() || 'Administrator';
    admin = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash: await hashPassword(password),
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      })
      .returning()
      .get();
    const base = slugify(email.split('@')[0] ?? 'admin').replace(/-/g, '').slice(0, 18) || 'admin';
    const taken = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.username, base)).get();
    await db
      .insert(profiles)
      .values({ userId: admin.id, username: taken ? `${base}${randomCode(3)}` : base, onboardingStep: 5 })
      .onConflictDoNothing()
      .run();
    result = 'created';
  }

  // Platform workspace — owner of Nuvra Academy sales (see resolveCheckoutItem)
  let platform = await db.select().from(workspaces).where(eq(workspaces.isPlatform, true)).get();
  if (!platform) {
    const slugTaken = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.slug, 'nuvra')).get();
    platform = await db
      .insert(workspaces)
      .values({
        name: 'Nuvra (Platform)',
        slug: slugTaken ? `nuvra-platform-${randomCode(4)}` : 'nuvra',
        ownerId: admin.id,
        plan: 'PRO',
        isPlatform: true,
      })
      .returning()
      .get();
  }
  await db
    .insert(memberships)
    .values({ userId: admin.id, workspaceId: platform.id, role: 'OWNER' })
    .onConflictDoNothing()
    .run();

  return { status: result, email };
}

/** Plans + first administrator. Idempotent, safe on every deploy. */
export async function bootstrapData(): Promise<void> {
  await ensurePlans();
  const admin = await ensureAdmin();
  if (admin.status === 'created') log(`administrator created: ${admin.email}`);
  else if (admin.status === 'promoted') log(`existing account promoted to administrator: ${admin.email}`);
  else if (admin.status === 'skipped') log('no ADMIN_EMAIL/ADMIN_PASSWORD — admin bootstrap skipped');
  else log('administrator already provisioned');
}

/**
 * Full database bootstrap — migrations + data. Used at build time on Vercel
 * (`npm run db:migrate`, see vercel.json) and at boot everywhere else.
 * Refuses to pretend it can persist a local file on Vercel.
 */
export async function bootstrapDatabase(): Promise<void> {
  const target = databaseTarget();
  log(`database target: ${target.local ? 'local file' : 'Turso / libSQL'} (${target.source})`);

  if (process.env.VERCEL && target.local) {
    throw new Error(
      'No hosted database configured. Vercel has no persistent disk, so a local SQLite file ' +
        'cannot be used: set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (see docs/DEPLOYMENT.md)',
    );
  }

  await migrateDatabase();
  await bootstrapData();
}

let ran = false;

export async function runStartupTasks(): Promise<void> {
  if (ran) return; // instrumentation may be re-evaluated in dev
  ran = true;

  if (process.env.VERCEL) {
    // Serverless: the bootstrap already ran at build time (vercel.json buildCommand).
    log('running on Vercel — database bootstrap was applied at build time');
    return;
  }

  await bootstrapDatabase(); // a failing migration must stop the boot — let it throw
}
