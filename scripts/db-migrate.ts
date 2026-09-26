#!/usr/bin/env tsx
/**
 * Applies pending migrations and provisions the first administrator.
 * Used by `npm run db:migrate`, the Vercel build command and CI.
 * Idempotent — safe to run on every deploy.
 *
 * On failure the whole cause chain is printed: drizzle wraps driver errors
 * ("Failed query: …") and the interesting part — `fetch failed`, `401`, … — is
 * always further down.
 */
import { bootstrapDatabase } from '@/lib/startup';

function describeError(e: unknown): string {
  const parts: string[] = [];
  let current: unknown = e;
  for (let depth = 0; current && depth < 5; depth++) {
    const message = current instanceof Error ? current.message : String(current);
    const line = message.split('\n')[0]?.trim();
    if (line) parts.push(line);
    current = (current as { cause?: unknown }).cause;
  }
  return [...new Set(parts)].join(' — ') || String(e);
}

async function main(): Promise<void> {
  await bootstrapDatabase();
  console.log('[nuvra:db] migration complete');
}

main()
  .then(() => process.exit(0))
  .catch((e: unknown) => {
    console.error('[nuvra:db] migration failed:', describeError(e));
    process.exit(1);
  });
