import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { paymentsMode } from '@/lib/stripe';
import { emailProvider } from '@/lib/email';
import { aiProviderConfigured } from '@/lib/ai';

export const dynamic = 'force-dynamic';

const startedAt = Date.now();

/**
 * Liveness/readiness probe for load balancers, uptime monitors and Docker
 * HEALTHCHECK. Public, unauthenticated and free of sensitive data: it only
 * reports which integrations are configured, never their values.
 *
 *   200 { ok: true,  db: "ok", ... }
 *   503 { ok: false, db: "error", ... }  when the database cannot be queried
 */
export async function GET(): Promise<Response> {
  let dbStatus: 'ok' | 'error' = 'ok';
  try {
    db.run(sql`select 1`);
  } catch {
    dbStatus = 'error';
  }

  const body = {
    ok: dbStatus === 'ok',
    service: 'nuvra',
    version: process.env.npm_package_version ?? process.env.NEXT_PUBLIC_APP_VERSION ?? null,
    env: process.env.NODE_ENV ?? 'development',
    uptimeSec: Math.round((Date.now() - startedAt) / 1000),
    db: dbStatus,
    integrations: {
      payments: paymentsMode(), // 'stripe' | 'test'
      email: emailProvider(), // 'RESEND' | 'OUTBOX'
      ai: aiProviderConfigured(),
      cronProtected: Boolean(process.env.CRON_SECRET),
    },
    time: new Date().toISOString(),
  };

  return Response.json(body, {
    status: body.ok ? 200 : 503,
    headers: { 'cache-control': 'no-store' },
  });
}
