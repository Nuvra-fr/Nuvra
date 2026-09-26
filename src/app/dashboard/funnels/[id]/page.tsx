import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ChevronRight, ExternalLink, FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { funnelSteps, funnels, pages } from '@/db/schema';
import { funnelAnalytics } from '@/lib/analytics';
import { Badge, PageHeader, StatusBadge, ProgressBar } from '@/components/ui';
import { FunnelClientActions } from './FunnelClientActions';

export const metadata: Metadata = { title: 'Funnel' };

const STEP_OPTIONS = [
  ['LANDING', 'Landing'],
  ['LEAD', 'Lead capture'],
  ['SALES', 'Sales page'],
  ['CHECKOUT', 'Checkout'],
  ['UPSELL', 'Upsell'],
  ['DOWNSELL', 'Downsell'],
  ['THANKYOU', 'Thank you'],
  ['DELIVERY', 'Delivery'],
];

export default async function FunnelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireUser();
  const { id } = await params;
  const funnel = await db.select().from(funnels).where(eq(funnels.id, id)).get();
  if (!funnel || funnel.workspaceId !== ctx.workspace.id) notFound();

  const steps = await db
    .select({ step: funnelSteps, page: pages })
    .from(funnelSteps)
    .innerJoin(pages, eq(funnelSteps.pageId, pages.id))
    .where(eq(funnelSteps.funnelId, id))
    .orderBy(funnelSteps.position)
    .all();

  const analytics = await funnelAnalytics(id);

  return (
    <div>
      <PageHeader
        title={funnel.name}
        description="Each step is a page. Conversions are computed from real page views."
        actions={
          <FunnelClientActions
            funnelId={funnel.id}
            status={funnel.status}
            stepOptions={STEP_OPTIONS}
          />
        }
      />

      <div className="card mb-5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Flow & conversions</h2>
          <Badge tone="blue">Overall: {analytics?.overallConversion ?? 0} %</Badge>
        </div>
        <div className="space-y-2">
          {steps.map((s, i) => {
            const a = analytics?.steps[i];
            const conv = a?.conversionFromPrev;
            return (
              <div key={s.step.id}>
                <div className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-ink-900/70 px-4 py-3">
                  <Badge tone={i === 0 ? 'blue' : 'default'}>{s.step.stepType}</Badge>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/pages/${s.page.id}`}
                      className="truncate text-sm font-medium text-zinc-200 hover:text-nuvra-300"
                    >
                      {s.page.title}
                    </Link>
                    <div className="text-[11px] text-zinc-600">{s.page.status} · {s.page.views} views</div>
                  </div>
                  <div className="hidden w-32 sm:block">
                    <ProgressBar value={a?.views ?? 0} max={Math.max(1, analytics?.steps[0]?.views ?? 1)} />
                  </div>
                  {conv !== null && conv !== undefined ? (
                    <Badge tone={conv >= 40 ? 'green' : conv >= 15 ? 'amber' : 'red'}>{conv} % →</Badge>
                  ) : null}
                  <a
                    href={`/p/${ctx.workspace.slug}/${s.page.slug}`}
                    target="_blank"
                    className="btn-ghost !px-2"
                    aria-label="Open page"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                {i < steps.length - 1 && (
                  <div className="my-1 flex justify-center text-zinc-700">
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Step</th>
              <th>Type</th>
              <th>Status</th>
              <th>Views</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.step.id}>
                <td className="font-medium text-zinc-200">{s.page.title}</td>
                <td className="text-zinc-500">{s.step.stepType}</td>
                <td>
                  <StatusBadge status={s.page.status} />
                </td>
                <td className="tabular-nums">{s.page.views}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/pages/${s.page.id}`} className="btn-secondary !px-3 !py-1.5 !text-xs">
                      <FileText className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
