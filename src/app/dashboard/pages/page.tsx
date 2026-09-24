import Link from 'next/link';
import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { ExternalLink, FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { pages } from '@/db/schema';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import NewPageButton from './NewPageButton';

export const metadata: Metadata = { title: 'Pages' };

export default async function PagesPage() {
  const ctx = await requireUser();
  const rows = db
    .select()
    .from(pages)
    .where(eq(pages.workspaceId, ctx.workspace.id))
    .orderBy(desc(pages.updatedAt))
    .all();

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Landing pages, thank-you pages and your Nuvra Link — built with blocks."
        actions={<NewPageButton />}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No pages yet"
          description="Create your first landing page. You can start from a clean skeleton or a funnel."
          action={<NewPageButton />}
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Page</th>
                <th>Type</th>
                <th>Status</th>
                <th>Views</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/dashboard/pages/${p.id}`} className="font-medium text-zinc-200 hover:text-nuvra-300">
                      {p.title}
                    </Link>
                    <div className="text-xs text-zinc-600">/p/{ctx.workspace.slug}/{p.slug}</div>
                  </td>
                  <td className="text-zinc-500">{p.type}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="tabular-nums">{p.views}</td>
                  <td className="text-zinc-500">{timeAgo(p.updatedAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      {p.status === 'PUBLISHED' ? (
                        <Link
                          href={`/p/${ctx.workspace.slug}/${p.slug}`}
                          target="_blank"
                          className="btn-ghost !px-2 !py-1"
                          title="Open live page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                      <Link href={`/dashboard/pages/${p.id}`} className="btn-secondary !px-3 !py-1.5 !text-xs">
                        Edit
                      </Link>
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
