// ─────────────────────────────────────────────────────────────
// Nuvra financial ledger — append-only, reconstructable.
// Every atomic operation writes a group of entries under one uuid group.
// Balances are ALWAYS derived: SUM(credit) - SUM(debit) per account/user.
// No mutable balance field exists anywhere in the system.
// ─────────────────────────────────────────────────────────────

import { randomUUID } from 'node:crypto';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ledgerEntries, type LedgerEntry } from '@/db/schema';
import type { LedgerAccount, LedgerType } from '@/lib/constants';

export interface EntryInput {
  type: LedgerType;
  account: LedgerAccount;
  direction: 'CREDIT' | 'DEBIT';
  amountCents: number;
  currency?: string;
  userId?: string | null;
  workspaceId?: string | null;
  orderId?: string | null;
  payoutId?: string | null;
  refType?: string | null;
  refId?: string | null;
  description: string;
  mode?: 'LIVE' | 'TEST';
  meta?: Record<string, unknown>;
}

export function newGroup(): string {
  return randomUUID();
}

export async function writeEntries(group: string, entries: EntryInput[]): Promise<void> {
  const now = new Date();
  const rows = entries
    .filter((e) => e.amountCents > 0)
    .map((e) => ({
      group,
      type: e.type,
      account: e.account,
      direction: e.direction,
      amountCents: e.amountCents,
      currency: e.currency ?? 'usd',
      userId: e.userId ?? null,
      workspaceId: e.workspaceId ?? null,
      orderId: e.orderId ?? null,
      payoutId: e.payoutId ?? null,
      refType: e.refType ?? null,
      refId: e.refId ?? null,
      description: e.description,
      mode: e.mode ?? 'TEST',
      meta: JSON.stringify(e.meta ?? {}),
      createdAt: now,
    }));
  if (rows.length === 0) return;
  await db.insert(ledgerEntries).values(rows).run();
}

/** SALE — credit the seller (creator or reseller) and the platform revenue. */
export async function recordSale(params: {
  orderId: string;
  workspaceId: string;
  mode: 'LIVE' | 'TEST';
  currency?: string;
  sellerUserId: string;
  sellerAccount: 'CREATOR_PAYABLE' | 'RESELLER_PAYABLE';
  sellerCents: number;
  platformCents: number;
  description: string;
}): Promise<string> {
  const group = newGroup();
  const entries: EntryInput[] = [
    {
      type: 'SALE',
      account: params.sellerAccount,
      direction: 'CREDIT',
      amountCents: params.sellerCents,
      currency: params.currency,
      userId: params.sellerUserId,
      workspaceId: params.workspaceId,
      orderId: params.orderId,
      refType: 'ORDER',
      refId: params.orderId,
      description: params.description,
      mode: params.mode,
    },
    {
      type: 'PLATFORM_FEE',
      account: 'PLATFORM_REVENUE',
      direction: 'CREDIT',
      amountCents: params.platformCents,
      currency: params.currency,
      workspaceId: params.workspaceId,
      orderId: params.orderId,
      refType: 'ORDER',
      refId: params.orderId,
      description: `${params.description} — Nuvra share`,
      mode: params.mode,
    },
  ];
  await writeEntries(group, entries);
  return group;
}

/** REFUND / REVERSAL — debit seller and platform by the same split. */
export async function recordRefund(params: {
  orderId: string;
  workspaceId: string;
  mode: 'LIVE' | 'TEST';
  currency?: string;
  sellerUserId: string;
  sellerAccount: 'CREATOR_PAYABLE' | 'RESELLER_PAYABLE';
  refundCents: number;
  sellerReversalCents: number;
  platformReversalCents: number;
  description: string;
}): Promise<string> {
  const group = newGroup();
  await writeEntries(group, [
    {
      type: 'REVERSAL',
      account: params.sellerAccount,
      direction: 'DEBIT',
      amountCents: params.sellerReversalCents,
      currency: params.currency,
      userId: params.sellerUserId,
      workspaceId: params.workspaceId,
      orderId: params.orderId,
      refType: 'REFUND',
      refId: params.orderId,
      description: params.description,
      mode: params.mode,
    },
    {
      type: 'REVERSAL',
      account: 'PLATFORM_REVENUE',
      direction: 'DEBIT',
      amountCents: params.platformReversalCents,
      currency: params.currency,
      workspaceId: params.workspaceId,
      orderId: params.orderId,
      refType: 'REFUND',
      refId: params.orderId,
      description: `${params.description} — Nuvra share reversal`,
      mode: params.mode,
    },
  ]);
  return group;
}

/** COMMISSION — affiliate commission credited to the affiliate. */
export async function recordAffiliateCommission(params: {
  orderId: string;
  workspaceId: string;
  mode: 'LIVE' | 'TEST';
  affiliateUserId: string;
  commissionCents: number;
  description: string;
}): Promise<string> {
  const group = newGroup();
  await writeEntries(group, [
    {
      type: 'COMMISSION',
      account: 'AFFILIATE_PAYABLE',
      direction: 'CREDIT',
      amountCents: params.commissionCents,
      userId: params.affiliateUserId,
      workspaceId: params.workspaceId,
      orderId: params.orderId,
      refType: 'ORDER',
      refId: params.orderId,
      description: params.description,
      mode: params.mode,
    },
  ]);
  return group;
}

/** PAYOUT — debit the payable account, credit the clearing account. */
export async function recordPayout(params: {
  payoutId: string;
  userId: string;
  account: LedgerAccount;
  amountCents: number;
  mode: 'LIVE' | 'TEST';
  description: string;
}): Promise<string> {
  const group = newGroup();
  await writeEntries(group, [
    {
      type: 'PAYOUT',
      account: params.account,
      direction: 'DEBIT',
      amountCents: params.amountCents,
      userId: params.userId,
      payoutId: params.payoutId,
      refType: 'PAYOUT',
      refId: params.payoutId,
      description: params.description,
      mode: params.mode,
    },
    {
      type: 'PAYOUT',
      account: 'PAYOUT_CLEARING',
      direction: 'CREDIT',
      amountCents: params.amountCents,
      userId: params.userId,
      payoutId: params.payoutId,
      refType: 'PAYOUT',
      refId: params.payoutId,
      description: params.description,
      mode: params.mode,
    },
  ]);
  return group;
}

/** Sum of CREDIT minus DEBIT for a user on one account (optionally LIVE only). */
export async function getBalance(
  userId: string,
  account: LedgerAccount,
  mode?: 'LIVE' | 'TEST',
): Promise<number> {
  const conditions = [
    eq(ledgerEntries.userId, userId),
    eq(ledgerEntries.account, account),
  ];
  if (mode) conditions.push(eq(ledgerEntries.mode, mode));
  const rows = await db
    .select({
      direction: ledgerEntries.direction,
      total: sql<string>`coalesce(sum(${ledgerEntries.amountCents}), 0)`,
    })
    .from(ledgerEntries)
    .where(and(...conditions))
    .groupBy(ledgerEntries.direction)
    .all();
  let balance = 0;
  for (const r of rows) {
    const n = Number(r.total);
    balance += r.direction === 'CREDIT' ? n : -n;
  }
  return balance;
}

/** Platform revenue (net of reversals) across all workspaces. */
export async function getPlatformRevenue(mode?: 'LIVE' | 'TEST'): Promise<number> {
  const conditions = [eq(ledgerEntries.account, 'PLATFORM_REVENUE')];
  if (mode) conditions.push(eq(ledgerEntries.mode, mode));
  const rows = await db
    .select({
      direction: ledgerEntries.direction,
      total: sql<string>`coalesce(sum(${ledgerEntries.amountCents}), 0)`,
    })
    .from(ledgerEntries)
    .where(and(...conditions))
    .groupBy(ledgerEntries.direction)
    .all();
  let balance = 0;
  for (const r of rows) balance += r.direction === 'CREDIT' ? Number(r.total) : -Number(r.total);
  return balance;
}

/** Workspace creator earnings (CREATOR_PAYABLE, net). */
export async function getWorkspaceEarnings(workspaceId: string, mode?: 'LIVE' | 'TEST'): Promise<number> {
  const conditions = [
    eq(ledgerEntries.workspaceId, workspaceId),
    eq(ledgerEntries.account, 'CREATOR_PAYABLE'),
  ];
  if (mode) conditions.push(eq(ledgerEntries.mode, mode));
  const rows = await db
    .select({
      direction: ledgerEntries.direction,
      total: sql<string>`coalesce(sum(${ledgerEntries.amountCents}), 0)`,
    })
    .from(ledgerEntries)
    .where(and(...conditions))
    .groupBy(ledgerEntries.direction)
    .all();
  let balance = 0;
  for (const r of rows) balance += r.direction === 'CREDIT' ? Number(r.total) : -Number(r.total);
  return balance;
}

export async function listLedgerForWorkspace(workspaceId: string, limit = 100): Promise<LedgerEntry[]> {
  return await db
    .select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.workspaceId, workspaceId))
    .orderBy(desc(ledgerEntries.createdAt))
    .limit(limit)
    .all();
}

export async function listLedgerForUser(userId: string, limit = 100): Promise<LedgerEntry[]> {
  return await db
    .select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.userId, userId))
    .orderBy(desc(ledgerEntries.createdAt))
    .limit(limit)
    .all();
}

export async function ledgerForOrder(orderId: string): Promise<LedgerEntry[]> {
  return await db.select().from(ledgerEntries).where(eq(ledgerEntries.orderId, orderId)).all();
}

export async function entriesInGroup(group: string): Promise<LedgerEntry[]> {
  return await db.select().from(ledgerEntries).where(eq(ledgerEntries.group, group)).all();
}

/** Admin: sums by account for reconciliation. */
export async function ledgerSummary(mode?: 'LIVE' | 'TEST') {
  const conditions = mode ? [eq(ledgerEntries.mode, mode)] : [];
  const rows = await db
    .select({
      account: ledgerEntries.account,
      direction: ledgerEntries.direction,
      total: sql<string>`coalesce(sum(${ledgerEntries.amountCents}), 0)`,
    })
    .from(ledgerEntries)
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(ledgerEntries.account, ledgerEntries.direction)
    .all();
  const out: Record<string, number> = {};
  for (const r of rows) {
    const n = Number(r.total);
    out[r.account] = (out[r.account] ?? 0) + (r.direction === 'CREDIT' ? n : -n);
  }
  return out;
}
