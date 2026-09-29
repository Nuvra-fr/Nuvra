import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  emailLogs,
  marketplaceListings,
  orders,
  payouts,
  subscriptionPlans,
  subscriptions,
  users,
  workspaces,
} from '@/db/schema';
import { formatCents } from '@/lib/money';
import { getPlatformRevenue, ledgerSummary } from '@/lib/ledger';
import { paymentsMode } from '@/lib/stripe';
import { emailProvider } from '@/lib/email';
import { daysAgo } from '@/lib/analytics';
import {
  PageHeader,
  Stat,
  Badge,
  BarChart,
  Card,
  InlineAlert,
} from '@/components/ui';
import { revenueSeries } from '@/lib/analytics';

export const metadata: Metadata = { title: 'Admin — Vue d’ensemble' };

export default async function AdminOverview() {
  await requireAdmin();
  const since30 = daysAgo(30);
  const mode = paymentsMode();
  const testMode = mode === 'test';

  const allUsers = (await db.select({ id: users.id }).from(users).all()).length;
  const allWs = (await db.select({ id: workspaces.id }).from(workspaces).all())
    .length;

  const paidOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.status, 'PAID'))
    .all();
  const gmv = paidOrders.reduce((s, o) => s + o.totalCents, 0);
  const gmv30 = paidOrders
    .filter((o) => o.paidAt && o.paidAt >= since30)
    .reduce((s, o) => s + o.totalCents, 0);
  const academyGmv = paidOrders
    .filter((o) => o.kind === 'ACADEMY_SALE')
    .reduce((s, o) => s + o.totalCents, 0);
  const creatorGmv = gmv - academyGmv;
  const refunds = (
    await db.select().from(orders).where(eq(orders.status, 'REFUNDED')).all()
  ).length;
  const refundRate = paidOrders.length
    ? Math.round((refunds / paidOrders.length) * 1000) / 10
    : 0;

  const subs = (
    await db
      .select({ sub: subscriptions, plan: subscriptionPlans })
      .from(subscriptions)
      .innerJoin(
        subscriptionPlans,
        eq(subscriptions.planId, subscriptionPlans.id),
      )
      .all()
  ).filter((s) => s.sub.status === 'active' || s.sub.status === 'trialing');
  const mrr = subs.reduce(
    (s, x) =>
      s +
      (x.sub.stripeSubscriptionId || !testMode
        ? x.plan.priceCents
        : x.plan.priceCents),
    0,
  );
  const proWs = (
    await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.plan, 'PRO'))
      .all()
  ).length;
  const freeWs = (
    await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.plan, 'FREE'))
      .all()
  ).length;

  const listingsPending = (
    await db
      .select({ id: marketplaceListings.id })
      .from(marketplaceListings)
      .where(eq(marketplaceListings.status, 'PENDING'))
      .all()
  ).length;
  const pendingPayouts = (
    await db
      .select({ id: payouts.id })
      .from(payouts)
      .where(eq(payouts.status, 'PENDING'))
      .all()
  ).length;
  const failedEmails = (
    await db
      .select({ id: emailLogs.id })
      .from(emailLogs)
      .where(eq(emailLogs.status, 'FAILED'))
      .all()
  ).length;

  const summary = await ledgerSummary();
  const platformNet = await getPlatformRevenue();

  const conversion =
    freeWs + proWs > 0 ? Math.round((proWs / (freeWs + proWs)) * 1000) / 10 : 0;

  return (
    <div>
      <PageHeader
        title="Vue d’ensemble"
        description="MRR, GMV, revenus de la plateforme et files opérationnelles — calculés sur des données réelles."
        actions={
          <div className="flex gap-2">
            <Badge tone={testMode ? 'purple' : 'green'}>
              {testMode ? 'DONNÉES EN MODE TEST' : 'DONNÉES LIVE'}
            </Badge>
            <Badge tone="blue">Email: {emailProvider()}</Badge>
          </div>
        }
      />

      {testMode ? (
        <div className="mb-5">
          <InlineAlert tone="warning">
            Stripe n&apos;est pas configuré — tous les montants ci-dessous
            proviennent de commandes TEST identifiées. Connectez{' '}
            <code>STRIPE_SECRET_KEY</code> + <code>STRIPE_WEBHOOK_SECRET</code>{' '}
            pour suivre le chiffre d&apos;affaires réel.
          </InlineAlert>
        </div>
      ) : null}

      <div className="grid-stats">
        <Stat
          label="MRR"
          value={formatCents(mrr)}
          hint={`${subs.length} active subscriptions`}
        />
        <Stat label="ARR (annualisé)" value={formatCents(mrr * 12)} />
        <Stat
          label="GMV (total)"
          value={formatCents(gmv)}
          hint={`${paidOrders.length} commandes payées`}
        />
        <Stat label="GMV (30 jours)" value={formatCents(gmv30)} />
        <Stat
          label="Revenus Académie"
          value={formatCents(academyGmv)}
          hint="GMV créateurs ci-dessous"
        />
        <Stat label="GMV créateurs" value={formatCents(creatorGmv)} />
        <Stat
          label="Résultat plateforme (grand livre)"
          value={formatCents(platformNet)}
          hint="frais − remboursements"
        />
        <Stat
          label="Taux de remboursement"
          value={`${refundRate} %`}
          hint={`${refunds} commandes remboursées`}
          tone={refundRate > 10 ? 'negative' : 'neutral'}
        />
        <Stat
          label="Utilisateurs"
          value={String(allUsers)}
          hint={`${allWs} workspaces`}
        />
        <Stat
          label="Gratuit → Pro"
          value={`${conversion} %`}
          hint={`${proWs} Pro / ${freeWs} Gratuit`}
        />
        <Stat
          label="En attente de modération"
          value={String(listingsPending)}
          hint="annonces marketplace"
        />
        <Stat
          label="Versements en attente"
          value={String(pendingPayouts)}
          hint={
            failedEmails
              ? `${failedEmails} emails en échec`
              : 'file d’envoi opérationnelle'
          }
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded>
          <h2 className="mb-4 section-title">GMV plateforme — 14 jours</h2>
          <BarChart
            data={await revenueSeries(14)}
            format={(v) => formatCents(v)}
          />
        </Card>
        <Card padded>
          <h2 className="mb-4 section-title">Comptes du grand livre</h2>
          <div className="space-y-2.5 text-sm">
            {Object.keys(summary).length === 0 ? (
              <p className="text-zinc-600">No entries yet.</p>
            ) : (
              Object.entries(summary).map(([account, balance]) => (
                <div
                  key={account}
                  className="flex items-center justify-between"
                >
                  <span className="text-zinc-500">{account}</span>
                  <span
                    className={`tabular-nums ${balance >= 0 ? 'text-emerald-300' : 'text-red-300'}`}
                  >
                    {formatCents(balance)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
