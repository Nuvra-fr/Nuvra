import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { Share2 } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  affiliates,
  affiliateClicks,
  affiliatePrograms,
  affiliateSales,
  orders,
} from '@/db/schema';
import { flagEnabled } from '@/lib/config';
import {
  EmptyState,
  PageHeader,
  Stat,
  Badge,
  StatusBadge,
  InlineAlert,
} from '@/components/ui';
import { formatCents } from '@/lib/money';
import { appBaseUrl } from '@/lib/utils';
import NewAffiliateProgramButton from './NewAffiliateProgramButton';
import CopyButton from '../academy/CopyButton';

export const metadata: Metadata = { title: 'Affiliés' };

export default async function AffiliatesPage() {
  const ctx = await requireUser();

  if (!(await flagEnabled('affiliates'))) {
    return (
      <div>
        <PageHeader title="Affiliés" />
        <InlineAlert tone="warning">
          L&apos;affiliation est désactivée par un administrateur (option de
          fonctionnalité). Activez-la dans Admin → Paramètres.
        </InlineAlert>
      </div>
    );
  }

  const programs = await db
    .select()
    .from(affiliatePrograms)
    .where(eq(affiliatePrograms.workspaceId, ctx.workspace.id))
    .orderBy(desc(affiliatePrograms.createdAt))
    .all();

  const appUrl = appBaseUrl();

  const programStats = await Promise.all(
    programs.map(async (p) => {
      const affs = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.programId, p.id))
        .all();
      const affIds = affs.map((a) => a.id);
      const clicks = affIds.length
        ? (await db.select().from(affiliateClicks).all()).filter((c) =>
            affIds.includes(c.affiliateId),
          )
        : [];
      const sales = affIds.length
        ? (await db.select().from(affiliateSales).all()).filter((s) =>
            affIds.includes(s.affiliateId),
          )
        : [];
      const paidSales = (
        await Promise.all(
          sales.map(async (s) => {
            const order = await db
              .select()
              .from(orders)
              .where(eq(orders.id, s.orderId))
              .get();
            return { ...s, order };
          }),
        )
      ).filter((s) => s.order?.status === 'PAID');
      const revenue = paidSales.reduce(
        (sum, s) => sum + (s.order?.totalCents ?? 0),
        0,
      );
      const commissions = paidSales.reduce(
        (sum, s) => sum + s.commissionCents,
        0,
      );
      return {
        program: p,
        affCount: affs.length,
        clickCount: clicks.length,
        revenue,
        commissions,
        affs: affs.slice(0, 5),
        sales: paidSales,
      };
    }),
  );

  const totals = programStats.reduce(
    (acc, p) => ({
      revenue: acc.revenue + p.revenue,
      commissions: acc.commissions + p.commissions,
      clicks: acc.clicks + p.clickCount,
    }),
    { revenue: 0, commissions: 0, clicks: 0 },
  );

  return (
    <div>
      <PageHeader
        title="Affiliés"
        description="Votre programme d’affiliation : vous fixez la commission, les liens et les règles. (Différent du programme revendeur de l’Académie.)"
        actions={<NewAffiliateProgramButton />}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Revenus générés par les affiliés"
          value={formatCents(totals.revenue)}
        />
        <Stat
          label="Commissions dues"
          value={formatCents(totals.commissions)}
          hint="crédité aux affiliés"
        />
        <Stat label="Clics suivis" value={String(totals.clicks)} />
      </div>

      {programs.length === 0 ? (
        <EmptyState
          icon={<Share2 className="h-8 w-8" />}
          title="Aucun programme d’affiliation"
          description="Créez-en un, définissez votre commission (30 % par défaut) et partagez les liens de vos affiliés."
          action={<NewAffiliateProgramButton />}
        />
      ) : (
        <div className="stack-sections">
          {programStats.map(
            ({
              program,
              affCount,
              clickCount,
              revenue,
              commissions,
              affs,
              sales,
            }) => (
              <div key={program.id} className="card card-body">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="section-title">{program.name}</span>
                      <Badge tone={program.active ? 'green' : 'default'}>
                        {program.active ? 'ACTIVE' : 'PAUSED'}
                      </Badge>
                      <Badge tone="blue">
                        {(program.commissionBps / 100).toFixed(0)}% commission
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-zinc-600">
                      {affCount} affiliates · {clickCount} clicks ·{' '}
                      {formatCents(revenue)} revenue ·{' '}
                      {formatCents(commissions)} commissions
                    </div>
                  </div>
                </div>

                {affs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {affs.map((a) => (
                      <div
                        key={a.id}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2"
                      >
                        <span className="text-xs font-medium text-zinc-300">
                          {a.name ?? a.email ?? a.code}
                        </span>
                        <code className="min-w-0 flex-1 truncate text-[11px] text-nuvra-300">
                          {appUrl}/?aff={a.code}
                        </code>
                        <CopyButton value={`${appUrl}/?aff=${a.code}`} />
                      </div>
                    ))}
                  </div>
                )}

                {sales.length > 0 && (
                  <div className="mt-4 table-wrap">
                    <table className="data">
                      <thead>
                        <tr>
                          <th>Commande</th>
                          <th>Montant de la vente</th>
                          <th>Commission</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.slice(0, 8).map((s) => (
                          <tr key={s.id}>
                            <td className="font-mono text-xs">
                              {s.order?.number}
                            </td>
                            <td className="tabular-nums">
                              {formatCents(s.order?.totalCents ?? 0)}
                            </td>
                            <td className="tabular-nums text-amber-300">
                              {formatCents(s.commissionCents)}
                            </td>
                            <td>
                              <StatusBadge status={s.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
