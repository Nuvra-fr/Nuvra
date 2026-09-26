#!/usr/bin/env tsx
/**
 * Applies pending migrations and provisions the first administrator.
 * Used by `npm run db:migrate`, the Vercel build command and CI.
 * Idempotent — safe to run on every deploy.
 */
import { bootstrapDatabase } from '@/lib/startup';

async function main(): Promise<void> {
  await bootstrapDatabase();
  console.log('[nuvra:db] migration complete');
}

main()
  .then(() => process.exit(0))
  .catch((e: unknown) => {
    console.error('[nuvra:db] migration failed:', e instanceof Error ? e.message : e);
    process.exit(1);
  });
