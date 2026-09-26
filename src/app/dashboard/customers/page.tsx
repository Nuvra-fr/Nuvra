import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { Users } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { contactActivities, contacts, orders } from '@/db/schema';
import { EmptyState, PageHeader, StatusBadge, Badge } from '@/components/ui';
import { timeAgo, safeJson } from '@/lib/utils';
import ContactDialog from './ContactDialog';
import ContactDrawer from './ContactDrawer';

export const metadata: Metadata = { title: 'Customers' };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;

  const rows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.workspaceId, ctx.workspace.id))
    .orderBy(desc(contacts.updatedAt))
    .all();

  const customers = rows.filter((c) => c.status !== 'LEAD');
  const selected = sp.contact ? rows.find((r) => r.id === sp.contact) ?? null : null;
  const activities = selected
    ? await db
        .select()
        .from(contactActivities)
        .where(eq(contactActivities.contactId, selected.id))
        .orderBy(desc(contactActivities.createdAt))
        .limit(30)
        .all()
    : [];
  const contactOrders = selected
    ? await db.select().from(orders).where(eq(orders.contactId, selected.id)).orderBy(desc(orders.createdAt)).all()
    : [];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Everyone who bought or engaged — with tags, activity and order history."
        actions={<ContactDialog />}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No customers yet"
          description="Customers appear automatically when orders are paid, or you can add them manually."
          action={<ContactDialog />}
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Source</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <a href={`/dashboard/customers?contact=${c.id}`} className="font-medium text-zinc-200 hover:text-nuvra-300">
                      {c.name ?? c.email}
                    </a>
                    <div className="text-xs text-zinc-600">{c.email}</div>
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {safeJson<string[]>(c.tags, []).map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="text-zinc-500">{c.source ?? '—'}</td>
                  <td className="text-zinc-500">{timeAgo(c.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <ContactDrawer
          contact={{
            id: selected.id,
            email: selected.email,
            name: selected.name ?? '',
            status: selected.status,
            tags: safeJson<string[]>(selected.tags, []),
            notes: selected.notes ?? '',
            phone: selected.phone ?? '',
          }}
          activities={activities.map((a) => ({ id: a.id, type: a.type, summary: a.summary, createdAt: a.createdAt.toISOString() }))}
          orders={contactOrders.map((o) => ({ id: o.id, number: o.number, totalCents: o.totalCents, status: o.status, mode: o.mode }))}
        />
      ) : null}
    </div>
  );
}
