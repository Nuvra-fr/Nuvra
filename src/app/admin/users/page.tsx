import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { memberships, users, workspaces } from '@/db/schema';
import { PageHeader, StatusBadge, Badge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import ToggleUserButton from './ToggleUserButton';

export const metadata: Metadata = { title: 'Admin — Users' };

export default async function AdminUsersPage() {
  await requireAdmin();
  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(200).all();

  return (
    <div>
      <PageHeader title="Users" description={`${rows.length} accounts.`} />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Email</th>
              <th>Workspaces</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {await Promise.all(rows.map(async (u) => {
              const mem = await db
                .select({ ws: workspaces })
                .from(memberships)
                .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
                .where(eq(memberships.userId, u.id))
                .all();
              return (
                <tr key={u.id}>
                  <td>
                    <div className="font-medium text-zinc-200">{u.name}</div>
                    <div className="text-xs text-zinc-600">{u.email}</div>
                  </td>
                  <td>
                    <Badge tone={u.role === 'ADMIN' ? 'purple' : 'default'}>{u.role}</Badge>
                  </td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td>
                    {u.emailVerifiedAt ? <Badge tone="green">verified</Badge> : <Badge tone="amber">pending</Badge>}
                  </td>
                  <td className="max-w-[220px] truncate text-zinc-500">
                    {mem.map((m) => `${m.ws.name} (${m.ws.plan})`).join(', ') || '—'}
                  </td>
                  <td className="text-zinc-500">{timeAgo(u.createdAt)}</td>
                  <td>
                    <div className="flex justify-end">
                      <ToggleUserButton userId={u.id} status={u.status} />
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
