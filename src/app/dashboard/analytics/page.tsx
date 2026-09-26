import type { Metadata } from 'next';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, enrollments, funnels } from '@/db/schema';
import { workspaceStats, revenueSeries, topPages, funnelAnalytics } from '@/lib/analytics';
import { formatCents } from '@/lib/money';
import { paymentsMode } from '@/lib/stripe';
import { flagEnabled } from '@/lib/config';
import { PageHeader, Stat, BarChart, Badge, InlineAlert, Card } from '@/components/ui';
export const metadata: Metadata = { title: 'Analytics' };

export default async function AnalyticsPage() {
  const ctx = await requireUser();
  const ws = ctx.workspace.id;
  const stats = await workspaceStats(ws);
  const series = await revenueSeries(30);
  const tops = await topPages(ws, 6);
  const funnelRows = await db.select().from(funnels).where(eq(funnels.workspaceId, ws)).all();
  const testMode = paymentsMode() === 'test';

  const courseRows = await db.select().from(courses).where(eq(courses.workspaceId, ws)).all();
  const courseStats = await Promise.all(courseRows.map(async (c) => {
    const students = (await db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.courseId, c.id)).all()).length;
    return { ...c, students };
  }));

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Real numbers from your orders, pages and enrollments — never invented."
        actions={
          <Badge tone={testMode ? 'purple' : 'green'}>
            {testMode ? 'TEST DATA' : 'LIVE DATA'}
          </Badge>
        }
      />

      {!await flagEnabled('advancedAnalytics') ? (
        <div className="mb-5">
          <InlineAlert tone="warning">
            Advanced analytics are disabled by an administrator (feature flag).
          </InlineAlert>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue (30d)" value={formatCents(stats.revenue30)} hint={`${stats.sales} paid orders all-time`} />
        <Stat label="Conversion" value={`${stats.conversion} %`} hint="orders / checkout attempts" />
        <Stat label="Page views" value={String(stats.pageViews)} />
        <Stat label="Platform fees paid" value={formatCents(stats.platformFees)} hint="your 10 %/0 % status: see billing" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">Revenue — 30 days</h2>
            <span className="text-xs text-zinc-600">daily paid totals</span>
          </div>
          <BarChart data={series} height={160} format={(v) => formatCents(v)} />
        </Card>

        <Card padded>
          <h2 className="mb-4 text-sm font-semibold text-zinc-200">Top pages</h2>
          {tops.length === 0 ? (
            <p className="text-sm text-zinc-600">No pages yet.</p>
          ) : (
            <div className="space-y-3">
              {tops.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <Link href={`/dashboard/pages/${p.id}`} className="truncate text-zinc-400 hover:text-nuvra-300">
                    {p.title}
                  </Link>
                  <span className="tabular-nums text-zinc-200">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card padded>
          <h2 className="mb-4 text-sm font-semibold text-zinc-200">Funnel performance</h2>
          {funnelRows.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No funnels yet — <Link href="/dashboard/funnels" className="text-nuvra-400">create one</Link>.
            </p>
          ) : (
            <div className="space-y-4">
              {await Promise.all(funnelRows.map(async (f) => {
                const a = await funnelAnalytics(f.id);
                return (
                  <div key={f.id} className="rounded-lg border border-white/[0.07] p-3.5">
                    <div className="flex items-center justify-between">
                      <Link href={`/dashboard/funnels/${f.id}`} className="text-sm font-medium text-zinc-200 hover:text-nuvra-300">
                        {f.name}
                      </Link>
                      <Badge tone="blue">{a?.overallConversion ?? 0} % overall</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a?.steps.map((s, i) => (
                        <span key={i} className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] text-zinc-500">
                          {s.stepType}: {s.views}
                          {s.conversionFromPrev !== null && i > 0 ? ` (${s.conversionFromPrev}%)` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }))}
            </div>
          )}
        </Card>

        <Card padded>
          <h2 className="mb-4 text-sm font-semibold text-zinc-200">Courses</h2>
          {courseStats.length === 0 ? (
            <p className="text-sm text-zinc-600">No courses yet.</p>
          ) : (
            <div className="table-wrap border-0">
              <table className="data">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Students</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/dashboard/courses/${c.id}`} className="text-zinc-200 hover:text-nuvra-300">
                          {c.title}
                        </Link>
                      </td>
                      <td className="tabular-nums">{c.students}</td>
                      <td className="tabular-nums">{formatCents(c.priceCents)}</td>
                      <td>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
