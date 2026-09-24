import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLogs, users } from '@/db/schema';
import { PageHeader, Badge } from '@/components/ui';
import { formatDateTime, safeJson } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin — Audit logs' };

export default async function AdminAuditPage() {
  await requireAdmin();
  const rows = db
    .select({ log: auditLogs, actor: users })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorUserId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(300)
    .all();

  return (
    <div>
      <PageHeader title="Audit logs" description="Who did what, when — including auth and financial operations." />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Target</th>
              <th>Meta</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-zinc-600">No audit entries yet.</td></tr>
            ) : (
              rows.map(({ log, actor }) => (
                <tr key={log.id}>
                  <td className="text-zinc-500">{formatDateTime(log.createdAt)}</td>
                  <td>
                    <Badge tone={log.action.includes('refund') ? 'red' : log.action.startsWith('auth') ? 'blue' : 'default'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="text-zinc-400">{actor?.email ?? 'system'}</td>
                  <td className="max-w-[200px] truncate text-zinc-500">{log.target ?? '—'}</td>
                  <td className="max-w-[280px] truncate font-mono text-[11px] text-zinc-600">
                    {JSON.stringify(safeJson(log.meta, {})).slice(0, 120)}
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
