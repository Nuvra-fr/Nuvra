import Link from 'next/link';
import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { Zap } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { automations } from '@/db/schema';
import { EmptyState, PageHeader, Badge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import NewAutomationButton from './NewAutomationButton';

export const metadata: Metadata = { title: 'Automations' };

export default async function AutomationsPage() {
  const ctx = await requireUser();
  const rows = await db
    .select()
    .from(automations)
    .where(eq(automations.workspaceId, ctx.workspace.id))
    .orderBy(desc(automations.updatedAt))
    .all();

  return (
    <div>
      <PageHeader
        title="Automations"
        description="Trigger → actions. Fired by real domain events (purchases, signups, course progress…)."
        actions={<NewAutomationButton />}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-8 w-8" />}
          title="No automations yet"
          description="Example: when a lead is captured → send a welcome email and add a tag. Runs 24/7."
          action={<NewAutomationButton />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => (
            <Link key={a.id} href={`/dashboard/automations/${a.id}`} className="card p-5 transition hover:border-nuvra-500/40">
              <div className="flex items-start justify-between">
                <Zap className={`h-5 w-5 ${a.active ? 'text-nuvra-400' : 'text-zinc-600'}`} />
                <Badge tone={a.active ? 'green' : 'default'}>{a.active ? 'ACTIVE' : 'PAUSED'}</Badge>
              </div>
              <div className="mt-3 text-sm font-semibold text-zinc-200">{a.name}</div>
              <div className="mt-1 text-xs text-zinc-600">
                on <span className="text-nuvra-400">{a.triggerEvent}</span> · {a.runCount} runs
              </div>
              <div className="mt-3 text-[11px] text-zinc-600">updated {timeAgo(a.updatedAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
