import { db } from '@/lib/db';
import { settings } from '@/db/schema';

/**
 * Admin-editable platform configuration.
 * NEVER hardcode business values in the frontend — everything reads from here.
 *
 * Values live in the database, so every read is asynchronous. A 5-second
 * in-memory cache keeps that invisible in practice, and concurrent readers
 * share a single in-flight query.
 */

export const CONFIG_DEFAULTS: Record<string, unknown> = {
  // Prices (cents)
  'academy.priceCents': 19700,
  'academy.name': 'Nuvra Academy',
  'pro.priceCents': 2900,
  'business.priceCents': 9900,
  // Commissions (basis points)
  'commission.freeBps': 1000, // 10 % — creators on FREE plan
  'commission.resellerBps': 9000, // 90 % — Academy resellers (Nuvra keeps 10 %)
  'commission.affiliateDefaultBps': 3000, // 30 % default for creator affiliate programs
  // Payouts
  'payouts.holdDays': 7,
  'payouts.minCents': 5000,
  // AI credits / month
  'ai.freeCredits': 20,
  'ai.proCredits': 200,
  'ai.businessCredits': 1000,
  // Feature flags
  'flags.ai': true,
  'flags.marketplace': true,
  'flags.affiliates': true,
  'flags.customDomains': false,
  'flags.templates': true,
  'flags.advancedAnalytics': true,
  'flags.beta': false,
  // Misc
  'academy.resellerEligibility': 'purchase', // purchase = any Academy purchase activates reseller
  'emails.from': 'Nuvra <no-reply@nuvra.app>',
};

let cache: Map<string, unknown> | null = null;
let cacheAt = 0;
let inflight: Promise<Map<string, unknown>> | null = null;
const CACHE_TTL_MS = 5_000;

async function loadCache(): Promise<Map<string, unknown>> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL_MS) return cache;
  if (inflight) return inflight; // concurrent readers share one query

  inflight = (async () => {
    const map = new Map<string, unknown>(Object.entries(CONFIG_DEFAULTS));
    try {
      const rows = await db.select().from(settings);
      for (const r of rows) {
        try {
          map.set(r.key, JSON.parse(r.value));
        } catch {
          map.set(r.key, r.value);
        }
      }
    } catch {
      // DB not ready — defaults only
    }
    cache = map;
    cacheAt = Date.now();
    return map;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export async function getConfig<T = unknown>(key: string): Promise<T> {
  const map = await loadCache();
  if (map.has(key)) return map.get(key) as T;
  return CONFIG_DEFAULTS[key] as T;
}

export async function getAllConfig(): Promise<Record<string, unknown>> {
  return Object.fromEntries(await loadCache());
}

export async function setConfig(key: string, value: unknown): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value: JSON.stringify(value), description: null })
    .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value) } })
    .run();
  invalidateConfigCache();
}

export function invalidateConfigCache(): void {
  cache = null;
  cacheAt = 0;
}

// ── Business-model shortcuts ──────────────────────────────

export function freeCommissionBps(): Promise<number> {
  return getConfig<number>('commission.freeBps');
}

export function resellerBps(): Promise<number> {
  return getConfig<number>('commission.resellerBps');
}

export function academyPriceCents(): Promise<number> {
  return getConfig<number>('academy.priceCents');
}

export function proPriceCents(): Promise<number> {
  return getConfig<number>('pro.priceCents');
}

export async function flagEnabled(key: string): Promise<boolean> {
  return (await getConfig<boolean>(`flags.${key}`)) === true;
}

export function aiCreditsForPlan(plan: string): Promise<number> {
  if (plan === 'PRO') return getConfig<number>('ai.proCredits');
  if (plan === 'BUSINESS' || plan === 'AGENCY') return getConfig<number>('ai.businessCredits');
  return getConfig<number>('ai.freeCredits');
}

export type FlagKey =
  | 'ai'
  | 'marketplace'
  | 'affiliates'
  | 'customDomains'
  | 'templates'
  | 'advancedAnalytics'
  | 'beta';
