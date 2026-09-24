import type { Metadata } from 'next';

import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, workspaces } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { PageHeader, StatusBadge, Stat, Badge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import AdminRefundButton from './AdminRefundButton';

export const metadata: Metadata = { title: 'Admin — Orders' };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  let rows = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(300).all();
  const statusFilter = sp.status?.toUpperCase();
  if (statusFilter) rows = rows.filter((o) => o.status === statusFilter);

  const withSeller = rows.map((o) => {
    const ws = db.select().from(workspaces).where(eq(workspaces.id, o.workspaceId)).get();
    return { order: o, seller: ws };
  });

  const totals = {
    paid: rows.filter((r) => r.status === 'PAID').length,
    refunded: rows.filter((r) => r.status === 'REFUNDED').length,
    pending: rows.filter((r) => r.status === 'PENDING').length,
  };

  return (
    <div>
      <PageHeader title="Orders" description="All orders across the platform, with test/live labeling." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Paid" value={String(totals.paid)} />
        <Stat label="Refunded" value={String(totals.refunded)} />
        <Stat label="Pending" value={String(totals.pending)} />
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Order</th>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Kind</th>
              <th>Total</th>
              <th>Nuvra fee</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {withSeller.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-zinc-600">No orders.</td></tr>
            ) : (
              withSeller.map(({ order: o, seller }) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs text-zinc-300">{o.number}</td>
                  <td className="text-zinc-500">{seller?.name ?? '—'}</td>
                  <td className="text-zinc-400">{o.buyerEmail}</td>
                  <td><Badge>{o.kind === 'ACADEMY_SALE' ? 'Academy' : 'Creator'}</Badge></td>
                  <td className="tabular-nums">{formatCents(o.totalCents)}</td>
                  <td className="tabular-nums text-zinc-500">{formatCents(o.platformFeeCents)}</td>
                  <td><StatusBadge status={o.mode} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-zinc-500">{formatDateTime(o.createdAt)}</td>
                  <td>
                    <div className="flex justify-end">
                      {o.status === 'PAID' ? <AdminRefundButton orderId={o.id} /> : null}
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
