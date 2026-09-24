import Link from 'next/link';
import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { Package, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/db/schema';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { formatCents } from '@/lib/money';
import { timeAgo } from '@/lib/utils';
import ProductDialog from './ProductDialog';

export const metadata: Metadata = { title: 'Products' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const rows = db
    .select()
    .from(products)
    .where(eq(products.workspaceId, ctx.workspace.id))
    .orderBy(desc(products.updatedAt))
    .all();

  const editId = typeof sp.edit === 'string' ? sp.edit : null;
  const openNew = sp.new === '1';
  const editing = editId ? rows.find((r) => r.id === editId) ?? null : null;

  const salesPerProduct = new Map<string, { count: number; total: number }>();
  for (const p of rows) {
    const sales = db
      .select({ total: orders.totalCents })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orderItems.productId, p.id))
      .all();
    salesPerProduct.set(p.id, {
      count: sales.length,
      total: sales.reduce((s, x) => s + x.total, 0),
    });
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Digital products and services sold through your pages, funnels and store."
        actions={
          <Link href="/dashboard/products?new=1" className="btn-primary">
            <Plus className="h-4 w-4" /> New product
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No products yet"
          description="Create your first product to start selling. You can plug it into any funnel or page."
          action={
            <Link href="/dashboard/products?new=1" className="btn-primary">
              <Plus className="h-4 w-4" /> New product
            </Link>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Status</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const s = salesPerProduct.get(p.id);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/dashboard/products?edit=${p.id}`} className="font-medium text-zinc-200 hover:text-nuvra-300">
                        {p.name}
                      </Link>
                      <div className="text-xs text-zinc-600">/{p.slug}</div>
                    </td>
                    <td className="text-zinc-500">{p.type}</td>
                    <td className="tabular-nums">{formatCents(p.priceCents, p.currency)}</td>
                    <td className="tabular-nums text-zinc-500">
                      {s?.count ?? 0} · {formatCents(s?.total ?? 0)}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="text-zinc-500">{timeAgo(p.updatedAt)}</td>
                    <td>
                      <div className="flex justify-end">
                        <Link href={`/dashboard/products?edit=${p.id}`} className="btn-secondary !px-3 !py-1.5 !text-xs">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ProductDialog
        key={editing?.id ?? (openNew ? 'new' : 'closed')}
        open={openNew || !!editing}
        product={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                description: editing.description ?? '',
                type: editing.type,
                priceCents: editing.priceCents,
                status: editing.status,
                downloadUrl: editing.downloadUrl ?? '',
                coverUrl: editing.coverUrl ?? '',
              }
            : null
        }
      />
    </div>
  );
}
