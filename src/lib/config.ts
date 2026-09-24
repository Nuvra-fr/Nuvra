import { db } from '@/lib/db';
import { settings } from '@/db/schema';

/**
 * Admin-editable platform configuration.
 * NEVER hardcode business values in the frontend — everything reads from here.
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
const CACHE_TTL_MS = 5_000;

function loadCache(): Map<string, unknown> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL_MS) return cache;
  const map = new Map<string, unknown>(Object.entries(CONFIG_DEFAULTS));
  try {
    const rows = db.select().from(settings).all();
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
  cacheAt = now;
  return map;
}

export function getConfig<T = unknown>(key: string): T {
  const map = loadCache();
  if (map.has(key)) return map.get(key) as T;
  return CONFIG_DEFAULTS[key] as T;
}

export function getAllConfig(): Record<string, unknown> {
  return Object.fromEntries(loadCache());
}

export function setConfig(key: string, value: unknown): void {
  db.insert(settings)
    .values({ key, value: JSON.stringify(value), description: null })
    .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value) } })
    .run();
  cache = null;
  cacheAt = 0;
}

export function invalidateConfigCache(): void {
  cache = null;
  cacheAt = 0;
}

// ── Business-model shortcuts ──────────────────────────────

export function freeCommissionBps(): number {
  return getConfig<number>('commission.freeBps');
}

export function resellerBps(): number {
  return getConfig<number>('commission.resellerBps');
}

export function academyPriceCents(): number {
  return getConfig<number>('academy.priceCents');
}

export function proPriceCents(): number {
  return getConfig<number>('pro.priceCents');
}

export function flagEnabled(key: string): boolean {
  return getConfig<boolean>(`flags.${key}`) === true;
}

export function aiCreditsForPlan(plan: string): number {
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
