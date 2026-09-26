import Link from 'next/link';
import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { GitBranch } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { funnelSteps, funnels, pages } from '@/db/schema';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import NewFunnelButton from './NewFunnelButton';

export const metadata: Metadata = { title: 'Funnels' };

export default async function FunnelsPage() {
  const ctx = await requireUser();
  const rows = await db
    .select()
    .from(funnels)
    .where(eq(funnels.workspaceId, ctx.workspace.id))
    .orderBy(desc(funnels.updatedAt))
    .all();

  const withCounts = await Promise.all(rows.map(async (f) => {
    const steps = await db
      .select({ step: funnelSteps, page: pages })
      .from(funnelSteps)
      .innerJoin(pages, eq(funnelSteps.pageId, pages.id))
      .where(eq(funnelSteps.funnelId, f.id))
      .all();
    const views = steps.reduce((s, st) => s + st.page.views, 0);
    return { ...f, stepCount: steps.length, views };
  }));

  return (
    <div>
      <PageHeader
        title="Funnels"
        description="Landing → lead → sales → checkout → upsell → thank you, with conversion between steps."
        actions={<NewFunnelButton />}
      />

      {withCounts.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="h-8 w-8" />}
          title="No funnels yet"
          description="Create a funnel with a ready-made structure (landing, sales, checkout, thank you)."
          action={<NewFunnelButton />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withCounts.map((f) => (
            <Link
              key={f.id}
              href={`/dashboard/funnels/${f.id}`}
              className="card p-5 transition hover:border-nuvra-500/40"
            >
              <div className="flex items-start justify-between">
                <GitBranch className="h-5 w-5 text-nuvra-400" />
                <StatusBadge status={f.status} />
              </div>
              <div className="mt-3 text-sm font-semibold text-zinc-200">{f.name}</div>
              <div className="mt-1 text-xs text-zinc-600">
                {f.stepCount} steps · {f.views} views · updated {timeAgo(f.updatedAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
