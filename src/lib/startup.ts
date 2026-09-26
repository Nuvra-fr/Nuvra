import path from 'node:path';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, databaseFile } from '@/lib/db';
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
// ─────────────────────────────────────────────────────────────

const log = (msg: string) => console.log(`[nuvra:startup] ${msg}`);

export function migrateDatabase(): void {
  if (process.env.AUTO_MIGRATE === 'false') {
    log('AUTO_MIGRATE=false — skipping migrations');
    return;
  }
  migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
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

  const existingAdmin = db.select({ id: users.id }).from(users).where(eq(users.role, 'ADMIN')).get();
  if (existingAdmin) return { status: 'exists' };

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  let admin = db.select().from(users).where(eq(users.email, email)).get();
  let result: BootstrapResult['status'];

  if (admin) {
    db.update(users)
      .set({ role: 'ADMIN', status: 'ACTIVE', emailVerifiedAt: admin.emailVerifiedAt ?? new Date(), updatedAt: new Date() })
      .where(eq(users.id, admin.id))
      .run();
    result = 'promoted';
  } else {
    const name = process.env.ADMIN_NAME?.trim() || 'Administrator';
    admin = db
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
    const taken = db.select({ id: profiles.id }).from(profiles).where(eq(profiles.username, base)).get();
    db.insert(profiles)
      .values({ userId: admin.id, username: taken ? `${base}${randomCode(3)}` : base, onboardingStep: 5 })
      .onConflictDoNothing()
      .run();
    result = 'created';
  }

  // Platform workspace — owner of Nuvra Academy sales (see resolveCheckoutItem)
  let platform = db.select().from(workspaces).where(eq(workspaces.isPlatform, true)).get();
  if (!platform) {
    const slugTaken = db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.slug, 'nuvra')).get();
    platform = db
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
  db.insert(memberships)
    .values({ userId: admin.id, workspaceId: platform.id, role: 'OWNER' })
    .onConflictDoNothing()
    .run();

  return { status: result, email };
}

let ran = false;

export async function runStartupTasks(): Promise<void> {
  if (ran) return; // instrumentation may be re-evaluated in dev
  ran = true;

  migrateDatabase(); // a failing migration must stop the boot — let it throw

  try {
    ensurePlans();
    const admin = await ensureAdmin();
    if (admin.status === 'created') log(`administrator created: ${admin.email}`);
    else if (admin.status === 'promoted') log(`existing account promoted to administrator: ${admin.email}`);
    else if (admin.status === 'skipped') log('no ADMIN_EMAIL/ADMIN_PASSWORD — admin bootstrap skipped');
  } catch (e) {
    console.error('[nuvra:startup] bootstrap failed (server continues):', e instanceof Error ? e.message : e);
  }
}
