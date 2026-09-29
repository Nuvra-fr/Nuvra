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

export const metadata: Metadata = { title: 'Admin — Modération' };

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
      <PageHeader
        title="Modération marketplace"
        description="Validez ou refusez les annonces soumises."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Store className="h-8 w-8" />}
          title="Aucune annonce soumise"
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Créateur</th>
                <th>Prix</th>
                <th>Vues</th>
                <th>Statut</th>
                <th>Submitted</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ listing: l, ws }) => (
                <tr key={l.id}>
                  <td>
                    <div className="font-medium text-zinc-200">{l.title}</div>
                    <div className="text-xs text-zinc-600">
                      {l.category ?? 'sans catégorie'}
                    </div>
                  </td>
                  <td className="text-zinc-500">{ws?.name ?? '—'}</td>
                  <td className="tabular-nums">{formatCents(l.priceCents)}</td>
                  <td className="tabular-nums">{l.views}</td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="text-zinc-500">{timeAgo(l.createdAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <ModerateListingButton
                        id={l.id}
                        action="APPROVED"
                        label="Valider"
                      />
                      <ModerateListingButton
                        id={l.id}
                        action="REJECTED"
                        label="Refuser"
                      />
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
