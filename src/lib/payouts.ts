import { and, desc, eq, lt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ledgerEntries, payouts, type Payout } from '@/db/schema';
import type { LedgerAccount } from '@/lib/constants';
import { getBalance, recordPayout } from '@/lib/ledger';
import { getConfig } from '@/lib/config';
import { audit } from '@/lib/audit';
// ─────────────────────────────────────────────────────────────
// Payouts — money owed to a user becomes withdrawable after a hold
// period, then flows pending → processing → paid (admin) with a full
// ledger debit so balances stay reconstructable.
// ─────────────────────────────────────────────────────────────

const PAYABLE_ACCOUNTS: LedgerAccount[] = [
  'CREATOR_PAYABLE',
  'RESELLER_PAYABLE',
  'AFFILIATE_PAYABLE',
];

async function heldCutoff(): Promise<Date> {
  const holdDays = Number(await getConfig<number>('payouts.holdDays') ?? 7);
  return new Date(Date.now() - holdDays * 24 * 3600_000);
}

/** Funds whose ledger entries are older than the hold period, net of pending payouts. */
export async function availableBalance(userId: string, account: LedgerAccount, mode?: 'LIVE' | 'TEST'): Promise<number> {
  const cutoff = await heldCutoff();
  const conditions = [
    eq(ledgerEntries.userId, userId),
    eq(ledgerEntries.account, account),
    lt(ledgerEntries.createdAt, cutoff),
  ];
  if (mode) conditions.push(eq(ledgerEntries.mode, mode));
  const rows = await db
    .select({
      direction: ledgerEntries.direction,
      total: { n: ledgerEntries.amountCents },
    })
    .from(ledgerEntries)
    .where(and(...conditions))
    .all();
  // manual sum — kept in JS so the exact same code runs on a local file and on Turso
  let sum = 0;
  for (const r of rows) {
    const amount = Number((r.total as { n: number }).n);
    sum += r.direction === 'CREDIT' ? amount : -amount;
  }
  const pending = (await db
    .select({ amountCents: payouts.amountCents, status: payouts.status })
    .from(payouts)
    .where(eq(payouts.userId, userId))
    .all())
    .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((s, p) => s + p.amountCents, 0);
  return Math.max(0, sum - pending);
}

export async function grossBalance(userId: string, account: LedgerAccount, mode?: 'LIVE' | 'TEST'): Promise<number> {
  return await getBalance(userId, account, mode);
}

export async function minPayoutCents(): Promise<number> {
  return Number(await getConfig<number>('payouts.minCents') ?? 5000);
}

export async function requestPayout(userId: string, account: LedgerAccount, mode: 'LIVE' | 'TEST'): Promise<Payout> {
  if (!PAYABLE_ACCOUNTS.includes(account)) throw new Error('Invalid payout account');
  const available = await availableBalance(userId, account, mode);
  const min = await minPayoutCents();
  if (available < min) {
    throw new Error(
      `Available ${(available / 100).toFixed(2)} is below the minimum payout of ${(min / 100).toFixed(2)}`,
    );
  }
  const payout = await db
    .insert(payouts)
    .values({
      userId,
      amountCents: available,
      currency: 'usd',
      status: 'PENDING',
      method: 'manual',
      note: `${account} — ${mode}`,
      periodEnd: new Date(),
    })
    .returning()
    .get();
  await audit('payout.requested', { actorUserId: userId, target: payout.id, meta: { account, available, mode } });
  return payout;
}

/** Admin marks a payout as paid — debits the payable account atomically. */
export async function markPayoutPaid(payoutId: string): Promise<Payout> {
  const payout = await db.select().from(payouts).where(eq(payouts.id, payoutId)).get();
  if (!payout) throw new Error('Payout not found');
  if (payout.status === 'PAID') return payout;
  const mode = (payout.note?.includes('LIVE') ? 'LIVE' : 'TEST') as 'LIVE' | 'TEST';
  const account = (payout.note?.startsWith('RESELLER')
    ? 'RESELLER_PAYABLE'
    : payout.note?.startsWith('AFFILIATE')
      ? 'AFFILIATE_PAYABLE'
      : 'CREATOR_PAYABLE') as LedgerAccount;
  await recordPayout({
    payoutId: payout.id,
    userId: payout.userId,
    account,
    amountCents: payout.amountCents,
    mode,
    description: `Payout ${payout.id.slice(0, 8)}`,
  });
  await db.update(payouts)
    .set({ status: 'PAID', processedAt: new Date(), method: 'manual' })
    .where(eq(payouts.id, payoutId))
    .run();
  await audit('payout.paid', { target: payoutId, meta: { amountCents: payout.amountCents } });
  return (await db.select().from(payouts).where(eq(payouts.id, payoutId)).get())!;
}

export async function markPayoutFailed(payoutId: string, reason?: string): Promise<Payout> {
  await db.update(payouts)
    .set({ status: 'FAILED', processedAt: new Date(), note: reason ?? 'failed' })
    .where(eq(payouts.id, payoutId))
    .run();
  await audit('payout.failed', { target: payoutId, meta: { reason } });
  return (await db.select().from(payouts).where(eq(payouts.id, payoutId)).get())!;
}

export async function listPayouts(userId?: string, limit = 50): Promise<Payout[]> {
  return await db
    .select()
    .from(payouts)
    .where(userId ? eq(payouts.userId, userId) : undefined)
    .orderBy(desc(payouts.createdAt))
    .limit(limit)
    .all();
}
