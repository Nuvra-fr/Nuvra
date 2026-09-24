import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { payouts, users } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { PageHeader, StatusBadge, Stat } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import PayoutActionButton from './PayoutActionButton';

export const metadata: Metadata = { title: 'Admin — Payouts' };

export default async function AdminPayoutsPage() {
  await requireAdmin();
  const rows = db.select({ payout: payouts, user: users }).from(payouts).innerJoin(users, eq(payouts.userId, users.id)).orderBy(desc(payouts.createdAt)).limit(200).all();

  const pendingAmount = rows
    .filter((r) => r.payout.status === 'PENDING')
    .reduce((s, r) => s + r.payout.amountCents, 0);

  return (
    <div>
      <PageHeader title="Payouts" description="Approve payouts — each approval debits the payable ledger account." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Pending requests" value={String(rows.filter((r) => r.payout.status === 'PENDING').length)} />
        <Stat label="Pending amount" value={formatCents(pendingAmount)} />
        <Stat label="Paid (all time)" value={formatCents(rows.filter((r) => r.payout.status === 'PAID').reduce((s, r) => s + r.payout.amountCents, 0))} />
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Account hint</th>
              <th>Status</th>
              <th>Requested</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-zinc-600">No payout requests.</td></tr>
            ) : (
              rows.map(({ payout: p, user: u }) => (
                <tr key={p.id}>
                  <td>
                    <div className="text-zinc-200">{u.name}</div>
                    <div className="text-xs text-zinc-600">{u.email}</div>
                  </td>
                  <td className="tabular-nums">{formatCents(p.amountCents)}</td>
                  <td className="font-mono text-[11px] text-zinc-500">{p.note ?? '—'}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="text-zinc-500">{formatDateTime(p.createdAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      {p.status === 'PENDING' || p.status === 'PROCESSING' ? (
                        <>
                          <PayoutActionButton payoutId={p.id} action="paid" />
                          <PayoutActionButton payoutId={p.id} action="failed" />
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
