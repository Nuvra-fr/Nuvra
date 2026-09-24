// ─────────────────────────────────────────────────────────────
// Nuvra money engine — pure functions, no I/O.
// All amounts are integer cents. All splits are basis points (bps).
// 10 % = 1000 bps. This module is unit-tested in tests/money.test.ts
// ─────────────────────────────────────────────────────────────

export type PlanCode = 'FREE' | 'PRO' | 'BUSINESS' | 'AGENCY';

export interface SplitInput {
  /** Gross amount charged to the buyer, in cents */
  grossCents: number;
}

export interface PlatformSplit {
  /** Amount owed to the reseller / creator (90 % in Academy) */
  sellerCents: number;
  /** Amount owed to Nuvra (10 % in Academy) */
  platformCents: number;
}

export function assertCents(value: number, label = 'amount'): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer number of cents (got ${value})`);
  }
}

/** Distribute `grossCents` using basis points for the recipient. Remainder cent goes to recipient. */
export function splitByBps(grossCents: number, recipientBps: number): PlatformSplit {
  assertCents(grossCents, 'grossCents');
  if (!Number.isInteger(recipientBps) || recipientBps < 0 || recipientBps > 10000) {
    throw new Error(`recipientBps must be an integer between 0 and 10000 (got ${recipientBps})`);
  }
  const sellerCents = Math.floor((grossCents * recipientBps) / 10000);
  const platformCents = grossCents - sellerCents;
  return { sellerCents, platformCents };
}

/**
 * SYSTÈME A — Nuvra Academy reseller split.
 * Default: reseller 9000 bps (90 %), Nuvra 1000 bps (10 %).
 * Both values are admin-configurable.
 */
export function academySplit(grossCents: number, resellerBps = 9000): PlatformSplit {
  return splitByBps(grossCents, resellerBps);
}

/**
 * SYSTÈME B — Creator selling their own course/product.
 * FREE plan: Nuvra takes a platform commission (default 1000 bps = 10 %).
 * PRO (and above): platform commission is 0 bps. Payment-processor fees are
 * separate and always displayed independently — never mixed with commission.
 */
export function creatorSplit(
  grossCents: number,
  plan: PlanCode,
  freeCommissionBps = 1000,
): PlatformSplit {
  assertCents(grossCents, 'grossCents');
  const commissionBps = plan === 'FREE' ? freeCommissionBps : 0;
  if (commissionBps === 0) return { sellerCents: grossCents, platformCents: 0 };
  // commissionBps is the PLATFORM's cut — compute it directly, seller gets the rest.
  const platformCents = Math.floor((grossCents * commissionBps) / 10000);
  return { sellerCents: grossCents - platformCents, platformCents };
}

/** Apply a percent-off coupon. Returns discounted gross (never negative). */
export function applyCoupon(grossCents: number, percentOff: number): number {
  assertCents(grossCents, 'grossCents');
  if (percentOff <= 0) return grossCents;
  if (percentOff >= 100) return 0;
  return Math.floor((grossCents * (100 - percentOff)) / 100);
}

/**
 * Payment-processor fee estimate (e.g. Stripe 2.9 % + 30¢) — display only.
 * Nuvra never hides this: it is always shown as a separate line.
 */
export function estimateProcessorFee(grossCents: number, bps = 290, fixedCents = 30): number {
  assertCents(grossCents, 'grossCents');
  if (grossCents === 0) return 0;
  return Math.floor((grossCents * bps) / 10000) + fixedCents;
}

/** Refund reversal math: entries written for a refund of `refundCents` on an original sale. */
export function refundSplit(
  originalGrossCents: number,
  refundCents: number,
  recipientBps: number,
): PlatformSplit {
  assertCents(refundCents, 'refundCents');
  if (refundCents > originalGrossCents) {
    throw new Error('refundCents cannot exceed originalGrossCents');
  }
  const seller = Math.floor((refundCents * recipientBps) / 10000);
  return { sellerCents: seller, platformCents: refundCents - seller };
}

/** Commission Nuvra would earn on `grossCents` for a FREE creator. */
export function platformFeeFor(grossCents: number, plan: PlanCode, freeCommissionBps = 1000): number {
  return creatorSplit(grossCents, plan, freeCommissionBps).platformCents;
}

/** Format integer cents as a display string, e.g. 129900 → "$1,299.00" */
export function formatCents(cents: number, currency = 'usd'): string {
  const symbols: Record<string, string> = { usd: '$', eur: '€', gbp: '£' };
  const symbol = symbols[currency.toLowerCase()] ?? '';
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const major = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const minor = (abs % 100).toString().padStart(2, '0');
  return `${sign}${symbol}${major}.${minor}`;
}
