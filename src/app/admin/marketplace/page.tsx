import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { marketplaceListings, workspaces } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import ModerateListingButton from './ModerateListingButton';
import { Store } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin — Moderation' };

export default async function AdminModerationPage() {
  await requireAdmin();
  const rows = await db
    .select({ listing: marketplaceListings, ws: workspaces })
    .from(marketplaceListings)
    .leftJoin(workspaces, eq(marketplaceListings.workspaceId, workspaces.id))
    .orderBy(desc(marketplaceListings.createdAt))
    .limit(200)
    .all();

  return (
    <div>
      <PageHeader title="Marketplace moderation" description="Approve or reject submitted listings." />

      {rows.length === 0 ? (
        <EmptyState icon={<Store className="h-8 w-8" />} title="No listings submitted yet" />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Creator</th>
                <th>Price</th>
                <th>Views</th>
                <th>Status</th>
                <th>Submitted</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ listing: l, ws }) => (
                <tr key={l.id}>
                  <td>
                    <div className="font-medium text-zinc-200">{l.title}</div>
                    <div className="text-xs text-zinc-600">{l.category ?? 'no category'}</div>
                  </td>
                  <td className="text-zinc-500">{ws?.name ?? '—'}</td>
                  <td className="tabular-nums">{formatCents(l.priceCents)}</td>
                  <td className="tabular-nums">{l.views}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td className="text-zinc-500">{timeAgo(l.createdAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <ModerateListingButton id={l.id} action="APPROVED" label="Approve" />
                      <ModerateListingButton id={l.id} action="REJECTED" label="Reject" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
