import Link from 'next/link';
import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { Store } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, marketplaceListings } from '@/db/schema';
import { flagEnabled } from '@/lib/config';
import { EmptyState, PageHeader, StatusBadge, Badge, InlineAlert } from '@/components/ui';
import { formatCents } from '@/lib/money';
import { timeAgo } from '@/lib/utils';
import SubmitListingButton from './SubmitListingButton';

export const metadata: Metadata = { title: 'Marketplace' };

export default async function MarketplaceDashboard() {
  const ctx = await requireUser();

  if (!await flagEnabled('marketplace')) {
    return (
      <div>
        <PageHeader title="Marketplace" />
        <InlineAlert tone="warning">
          Marketplace is disabled by an administrator (feature flag). Enable it in Admin → Settings.
        </InlineAlert>
      </div>
    );
  }

  const listings = await db
    .select()
    .from(marketplaceListings)
    .where(eq(marketplaceListings.workspaceId, ctx.workspace.id))
    .orderBy(desc(marketplaceListings.createdAt))
    .all();

  const publishedCourses = (await db
    .select()
    .from(courses)
    .where(eq(courses.workspaceId, ctx.workspace.id))
    .all())
    .filter((c) => c.status === 'PUBLISHED' && !c.isAcademy && !listings.some((l) => l.courseId === c.id));

  return (
    <div>
      <PageHeader
        title="Marketplace"
        description="List your published courses on Nuvra Marketplace — moderated before going live."
        actions={
          <div className="flex items-center gap-2">
            <a href="/marketplace" target="_blank" className="btn-secondary">
              <Store className="h-4 w-4" /> Browse
            </a>
            <SubmitListingButton courses={publishedCourses.map((c) => ({ id: c.id, title: c.title }))} />
          </div>
        }
      />

      {listings.length === 0 ? (
        <EmptyState
          icon={<Store className="h-8 w-8" />}
          title="No listings yet"
          description={
            publishedCourses.length > 0
              ? 'Submit one of your published courses for moderation.'
              : 'Publish a course first, then submit it to the marketplace.'
          }
          action={
            publishedCourses.length > 0 ? (
              <SubmitListingButton courses={publishedCourses.map((c) => ({ id: c.id, title: c.title }))} />
            ) : (
              <Link href="/dashboard/courses" className="btn-primary">Go to courses</Link>
            )
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Views</th>
                <th>Submitted</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td className="font-medium text-zinc-200">{l.title}</td>
                  <td className="text-zinc-500">{l.category ?? '—'}</td>
                  <td className="tabular-nums">{formatCents(l.priceCents)}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <StatusBadge status={l.status} />
                      {l.featured ? <Badge tone="amber">FEATURED</Badge> : null}
                    </div>
                  </td>
                  <td className="tabular-nums">{l.views}</td>
                  <td className="text-zinc-500">{timeAgo(l.createdAt)}</td>
                  <td>
                    <div className="flex justify-end">
                      {l.status === 'APPROVED' ? (
                        <Link href={`/marketplace/${l.id}`} className="btn-ghost !px-2 !py-1 !text-xs">
                          View
                        </Link>
                      ) : null}
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
