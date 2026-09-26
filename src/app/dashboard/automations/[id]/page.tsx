import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { Zap } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { automationActions, automationRuns, automations } from '@/db/schema';
import { PageHeader, Badge, StatusBadge } from '@/components/ui';
import { formatDateTime, safeJson } from '@/lib/utils';
import AutomationClient from './AutomationClient';

export const metadata: Metadata = { title: 'Automation' };

export default async function AutomationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireUser();
  const { id } = await params;
  const auto = await db.select().from(automations).where(eq(automations.id, id)).get();
  if (!auto || auto.workspaceId !== ctx.workspace.id) notFound();

  const actions = (await db
    .select()
    .from(automationActions)
    .where(eq(automationActions.automationId, id))
    .all())
    .sort((a, b) => a.position - b.position);

  const runs = await db
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.automationId, id))
    .orderBy(desc(automationRuns.createdAt))
    .limit(20)
    .all();

  return (
    <div>
      <PageHeader
        title={auto.name}
        description={`Trigger: ${auto.triggerEvent}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={auto.active ? 'green' : 'default'}>{auto.active ? 'ACTIVE' : 'PAUSED'}</Badge>
            <Badge>{auto.runCount} runs</Badge>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Zap className="h-4 w-4 text-nuvra-400" /> Workflow
          </div>
          <AutomationClient
            automationId={auto.id}
            active={auto.active}
            initialActions={actions.map((a) => ({
              type: a.type as import('@/lib/constants').AutomationActionType,
              config: safeJson<Record<string, unknown>>(a.config, {}),
            }))}
          />
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-200">Recent runs</h3>
          {runs.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No runs yet. Activate the automation and trigger the event (e.g. capture a lead) to see
              it fire.
            </p>
          ) : (
            <div className="space-y-2">
              {runs.map((r) => (
                <div key={r.id} className="rounded-lg border border-white/[0.07] px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={r.status} />
                    <span className="text-[10px] text-zinc-600">{formatDateTime(r.createdAt)}</span>
                  </div>
                  <div className="mt-1 truncate text-[11px] text-zinc-600">
                    {safeJson<{ email?: string; orderId?: string }>(r.context, {}).email ??
                      safeJson<{ orderId?: string }>(r.context, {}).orderId ??
                      'context recorded'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
