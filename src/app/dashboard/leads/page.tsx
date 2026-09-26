import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { UserRound } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { EmptyState, PageHeader, Badge } from '@/components/ui';
import { timeAgo, safeJson } from '@/lib/utils';
import ContactDialog from '../customers/ContactDialog';

export const metadata: Metadata = { title: 'Leads' };

export default async function LeadsPage() {
  const ctx = await requireUser();
  const rows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.workspaceId, ctx.workspace.id))
    .orderBy(desc(contacts.createdAt))
    .all();
  const leads = rows.filter((c) => c.status === 'LEAD');

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Captured from your funnel forms. Move them to customers as they buy."
        actions={<ContactDialog />}
      />

      {leads.length === 0 ? (
        <EmptyState
          icon={<UserRound className="h-8 w-8" />}
          title="No leads yet"
          description="Add a Form block to a published page — every submission lands here and triggers your automations."
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Tags</th>
                <th>Source</th>
                <th>Captured</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((c) => (
                <tr key={c.id}>
                  <td>
                    <a href={`/dashboard/customers?contact=${c.id}`} className="font-medium text-zinc-200 hover:text-nuvra-300">
                      {c.name ?? c.email}
                    </a>
                    <div className="text-xs text-zinc-600">{c.email}</div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {safeJson<string[]>(c.tags, []).map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="text-zinc-500">{c.source ?? '—'}</td>
                  <td className="text-zinc-500">{timeAgo(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
