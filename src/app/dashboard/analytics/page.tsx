import type { Metadata } from 'next';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, enrollments, funnels } from '@/db/schema';
import {
  workspaceStats,
  revenueSeries,
  topPages,
  funnelAnalytics,
} from '@/lib/analytics';
import { formatCents } from '@/lib/money';
import { paymentsMode } from '@/lib/stripe';
import { flagEnabled } from '@/lib/config';
import {
  PageHeader,
  Stat,
  BarChart,
  Badge,
  InlineAlert,
  Card,
} from '@/components/ui';
export const metadata: Metadata = { title: 'Statistiques' };

export default async function AnalyticsPage() {
  const ctx = await requireUser();
  const ws = ctx.workspace.id;
  const stats = await workspaceStats(ws);
  const series = await revenueSeries(30);
  const tops = await topPages(ws, 6);
  const funnelRows = await db
    .select()
    .from(funnels)
    .where(eq(funnels.workspaceId, ws))
    .all();
  const testMode = paymentsMode() === 'test';

  const courseRows = await db
    .select()
    .from(courses)
    .where(eq(courses.workspaceId, ws))
    .all();
  const courseStats = await Promise.all(
    courseRows.map(async (c) => {
      const students = (
        await db
          .select({ id: enrollments.id })
          .from(enrollments)
          .where(eq(enrollments.courseId, c.id))
          .all()
      ).length;
      return { ...c, students };
    }),
  );

  return (
    <div>
      <PageHeader
        title="Statistiques"
        description="Des chiffres réels issus de vos commandes, pages et inscriptions — jamais inventés."
        actions={
          <Badge tone={testMode ? 'purple' : 'green'}>
            {testMode ? 'DONNÉES TEST' : 'DONNÉES LIVE'}
          </Badge>
        }
      />

      {!(await flagEnabled('advancedAnalytics')) ? (
        <div className="mb-5">
          <InlineAlert tone="warning">
            Les statistiques avancées sont désactivées par un administrateur
            (option de fonctionnalité).
          </InlineAlert>
        </div>
      ) : null}

      <div className="grid-stats">
        <Stat
          label="Chiffre d’affaires (30 j)"
          value={formatCents(stats.revenue30)}
          hint={`${stats.sales} commande(s) payée(s) au total`}
        />
        <Stat
          label="Conversion"
          value={`${stats.conversion} %`}
          hint="commandes / tentatives de paiement"
        />
        <Stat label="Pages vues" value={String(stats.pageViews)} />
        <Stat
          label="Commissions plateforme payées"
          value={formatCents(stats.platformFees)}
          hint="votre statut 10 %/0 % : voir la facturation"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">
              Chiffre d’affaires — 30 derniers jours
            </h2>
            <span className="text-xs text-zinc-600">totaux journaliers payés</span>
          </div>
          <BarChart data={series} height={160} format={(v) => formatCents(v)} />
        </Card>

        <Card padded>
          <h2 className="mb-4 section-title">Pages les plus vues</h2>
          {tops.length === 0 ? (
            <p className="text-sm text-zinc-600">Aucune page pour l’instant.</p>
          ) : (
            <div className="space-y-3">
              {tops.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm"
                >
                  <Link
                    href={`/dashboard/pages/${p.id}`}
                    className="truncate text-zinc-400 hover:text-nuvra-300"
                  >
                    {p.title}
                  </Link>
                  <span className="tabular-nums text-zinc-200">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card padded>
          <h2 className="mb-4 section-title">Funnel performance</h2>
          {funnelRows.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No funnels yet —{' '}
              <Link href="/dashboard/funnels" className="text-nuvra-400">
                en créer un
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-4">
              {await Promise.all(
                funnelRows.map(async (f) => {
                  const a = await funnelAnalytics(f.id);
                  return (
                    <div
                      key={f.id}
                      className="rounded-lg border border-white/[0.07] p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/dashboard/funnels/${f.id}`}
                          className="text-sm font-medium text-zinc-200 hover:text-nuvra-300"
                        >
                          {f.name}
                        </Link>
                        <Badge tone="blue">
                          {a?.overallConversion ?? 0} % overall
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {a?.steps.map((s, i) => (
                          <span
                            key={i}
                            className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] text-zinc-500"
                          >
                            {s.stepType}: {s.views}
                            {s.conversionFromPrev !== null && i > 0
                              ? ` (${s.conversionFromPrev}%)`
                              : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }),
              )}
            </div>
          )}
        </Card>

        <Card padded>
          <h2 className="mb-4 section-title">Formations</h2>
          {courseStats.length === 0 ? (
            <p className="text-sm text-zinc-600">
              Aucune formation pour l’instant.
            </p>
          ) : (
            <div className="table-wrap border-0">
              <table className="data">
                <thead>
                  <tr>
                    <th>Formation</th>
                    <th>Élèves</th>
                    <th>Prix</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link
                          href={`/dashboard/courses/${c.id}`}
                          className="text-zinc-200 hover:text-nuvra-300"
                        >
                          {c.title}
                        </Link>
                      </td>
                      <td className="tabular-nums">{c.students}</td>
                      <td className="tabular-nums">
                        {formatCents(c.priceCents)}
                      </td>
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
