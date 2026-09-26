import type { Metadata } from 'next';
import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { ExternalLink, Store } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, products } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { appBaseUrl } from '@/lib/utils';
import { PageHeader, StatusBadge, Badge, EmptyState, InlineAlert } from '@/components/ui';

export const metadata: Metadata = { title: 'Store' };

export default async function StorePage() {
  const ctx = await requireUser();
  const ws = ctx.workspace;

  const productRows = await db
    .select()
    .from(products)
    .where(eq(products.workspaceId, ws.id))
    .orderBy(desc(products.updatedAt))
    .all();
  const courseRows = await db
    .select()
    .from(courses)
    .where(eq(courses.workspaceId, ws.id))
    .orderBy(desc(courses.updatedAt))
    .all();

  const published = [
    ...productRows.filter((p) => p.status === 'PUBLISHED').map((p) => ({ kind: 'Product', title: p.name, price: p.priceCents, status: p.status })),
    ...courseRows.filter((c) => c.status === 'PUBLISHED').map((c) => ({ kind: 'Course', title: c.title, price: c.priceCents, status: c.status })),
  ];

  return (
    <div>
      <PageHeader
        title="Store"
        description="Your public storefront — everything published, in one place."
        actions={
          <a href={`/s/${ws.slug}`} target="_blank" className="btn-secondary">
            <ExternalLink className="h-4 w-4" /> Open storefront
          </a>
        }
      />

      <div className="mb-5">
        <InlineAlert tone="info">
          Storefront URL:{' '}
          <a href={`/s/${ws.slug}`} target="_blank" className="font-medium text-nuvra-300 underline">
            {appBaseUrl()}/s/{ws.slug}
          </a>{' '}
          — publish products and courses to fill it.
        </InlineAlert>
      </div>

      {published.length === 0 ? (
        <EmptyState
          icon={<Store className="h-8 w-8" />}
          title="Nothing published yet"
          description="Publish a product or a course and it appears automatically in your storefront."
          action={
            <div className="flex gap-2">
              <Link href="/dashboard/products?new=1" className="btn-primary">New product</Link>
              <Link href="/dashboard/courses?new=1" className="btn-secondary">New course</Link>
            </div>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Item</th>
                <th>Kind</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {published.map((item) => (
                <tr key={`${item.kind}-${item.title}`}>
                  <td className="font-medium text-zinc-200">{item.title}</td>
                  <td>
                    <Badge>{item.kind}</Badge>
                  </td>
                  <td className="tabular-nums">{formatCents(item.price)}</td>
                  <td>
                    <StatusBadge status={item.status} />
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
