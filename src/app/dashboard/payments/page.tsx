import type { Metadata } from 'next';
import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { Wallet } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ledgerEntries, orders, payouts } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { availableBalance, grossBalance, minPayoutCents } from '@/lib/payouts';
import { paymentsMode } from '@/lib/stripe';
import { getConfig } from '@/lib/config';
import { PageHeader, StatusBadge, Badge, InlineAlert, Tabs } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import type { LedgerAccount } from '@/lib/constants';
import RefundButton from './RefundButton';
import PayoutButton from './PayoutButton';

export const metadata: Metadata = { title: 'Payments' };

const ACCOUNT_LABELS: Record<string, string> = {
  CREATOR_PAYABLE: 'Creator earnings',
  RESELLER_PAYABLE: 'Reseller earnings',
  AFFILIATE_PAYABLE: 'Affiliate earnings',
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; tab?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === 'ledger' ? 'ledger' : sp.tab === 'payouts' ? 'payouts' : 'orders';
  const mode = paymentsMode();
  const testMode = mode === 'test';

  const workspaceOrders = db
    .select()
    .from(orders)
    .where(eq(orders.workspaceId, ctx.workspace.id))
    .orderBy(desc(orders.createdAt))
    .limit(100)
    .all();

  const myPayouts = db
    .select()
    .from(payouts)
    .where(eq(payouts.userId, ctx.user.id))
    .orderBy(desc(payouts.createdAt))
    .limit(20)
    .all();

  const accounts: LedgerAccount[] = ['CREATOR_PAYABLE', 'RESELLER_PAYABLE', 'AFFILIATE_PAYABLE'];
  const balances = accounts
    .map((a) => ({
      account: a,
      gross: grossBalance(ctx.user.id, a),
      available: availableBalance(ctx.user.id, a),
    }))
    .filter((b) => b.gross !== 0 || b.available !== 0);

  const ledger = db
    .select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.workspaceId, ctx.workspace.id))
    .orderBy(desc(ledgerEntries.createdAt))
    .limit(100)
    .all();

  const selectedOrder = sp.order ? workspaceOrders.find((o) => o.id === sp.order) ?? null : null;
  const holdDays = Number(getConfig<number>('payouts.holdDays') ?? 7);

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Orders, the financial ledger, balances and payouts — all reconstructable from entries."
        actions={
          <Badge tone={testMode ? 'purple' : 'green'}>
            {testMode ? 'TEST MODE — configure Stripe for live payments' : 'STRIPE LIVE'}
          </Badge>
        }
      />

      <Tabs
        active={`/dashboard/payments?tab=${tab}`}
        items={[
          { href: '/dashboard/payments', label: 'Orders' },
          { href: '/dashboard/payments?tab=ledger', label: 'Financial ledger' },
          { href: '/dashboard/payments?tab=payouts', label: 'Balances & payouts' },
        ]}
      />

      {selectedOrder ? (
        <div className="card mb-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-200">{selectedOrder.number}</h2>
                <StatusBadge status={selectedOrder.status} />
                <StatusBadge status={selectedOrder.mode} />
              </div>
              <p className="mt-1 text-xs text-zinc-600">
                {selectedOrder.buyerEmail} · {formatDateTime(selectedOrder.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-semibold text-zinc-100">{formatCents(selectedOrder.totalCents)}</div>
                <div className="text-xs text-zinc-600">
                  Nuvra fee {formatCents(selectedOrder.platformFeeCents)} · seller{' '}
                  {formatCents(selectedOrder.totalCents - selectedOrder.platformFeeCents)}
                </div>
              </div>
              {selectedOrder.status === 'PAID' ? (
                <RefundButton orderId={selectedOrder.id} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'orders' && (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Kind</th>
                <th>Total</th>
                <th>Nuvra fee</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {workspaceOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-zinc-600">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                workspaceOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/dashboard/payments?order=${o.id}`} className="font-medium text-zinc-200 hover:text-nuvra-300">
                        {o.number}
                      </Link>
                    </td>
                    <td className="text-zinc-400">{o.buyerEmail}</td>
                    <td className="text-zinc-500">{o.kind === 'ACADEMY_SALE' ? 'Academy' : 'Creator'}</td>
                    <td className="tabular-nums">{formatCents(o.totalCents)}</td>
                    <td className="tabular-nums text-zinc-500">{formatCents(o.platformFeeCents)}</td>
                    <td>
                      <StatusBadge status={o.mode} />
                    </td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="text-zinc-500">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="space-y-4">
          <InlineAlert tone="info">
            Append-only ledger. Every balance on this platform is derived by summing these entries —
            there is no mutable balance anywhere.
          </InlineAlert>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Account</th>
                  <th>Direction</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-zinc-600">
                      No ledger entries yet.
                    </td>
                  </tr>
                ) : (
                  ledger.map((e) => (
                    <tr key={e.id}>
                      <td className="text-zinc-500">{formatDateTime(e.createdAt)}</td>
                      <td>
                        <Badge tone={e.type === 'REFUND' || e.type === 'REVERSAL' ? 'red' : e.type === 'PLATFORM_FEE' ? 'blue' : 'default'}>
                          {e.type}
                        </Badge>
                      </td>
                      <td className="text-zinc-400">{e.account}</td>
                      <td className={e.direction === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}>
                        {e.direction}
                      </td>
                      <td className="tabular-nums">{formatCents(e.amountCents)}</td>
                      <td className="text-zinc-500">{e.description}</td>
                      <td>
                        <StatusBadge status={e.mode} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {balances.length === 0 ? (
              <div className="card p-5 text-sm text-zinc-600 sm:col-span-2 lg:col-span-3">
                No earnings yet. Balances appear here as soon as sales are paid and the{' '}
                {holdDays}-day hold period passes.
              </div>
            ) : (
              balances.map((b) => (
                <div key={b.account} className="card p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <Wallet className="h-3.5 w-3.5" /> {ACCOUNT_LABELS[b.account] ?? b.account}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-100">{formatCents(b.gross)}</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Available after {holdDays}-day hold: <span className="text-emerald-300">{formatCents(b.available)}</span>
                  </div>
                  <div className="mt-3">
                    <PayoutButton account={b.account} available={b.available} min={minPayoutCents()} mode={testMode ? 'TEST' : 'LIVE'} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Payout</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Processed</th>
                </tr>
              </thead>
              <tbody>
                {myPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-zinc-600">
                      No payout requests yet.
                    </td>
                  </tr>
                ) : (
                  myPayouts.map((p) => (
                    <tr key={p.id}>
                      <td className="font-mono text-xs text-zinc-500">{p.id.slice(0, 8)}</td>
                      <td className="tabular-nums">{formatCents(p.amountCents)}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="text-zinc-500">{formatDateTime(p.createdAt)}</td>
                      <td className="text-zinc-500">{formatDateTime(p.processedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
