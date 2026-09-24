import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailLogs, marketplaceListings, orders, payouts, subscriptionPlans, subscriptions, users, workspaces } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { getPlatformRevenue, ledgerSummary } from '@/lib/ledger';
import { paymentsMode } from '@/lib/stripe';
import { emailProvider } from '@/lib/email';
import { daysAgo } from '@/lib/analytics';
import { PageHeader, Stat, Badge, BarChart, Card, InlineAlert } from '@/components/ui';
import { revenueSeries } from '@/lib/analytics';

export const metadata: Metadata = { title: 'Admin — Overview' };

export default async function AdminOverview() {
  await requireAdmin();
  const since30 = daysAgo(30);
  const mode = paymentsMode();
  const testMode = mode === 'test';

  const allUsers = db.select({ id: users.id }).from(users).all().length;
  const allWs = db.select({ id: workspaces.id }).from(workspaces).all().length;

  const paidOrders = db
    .select()
    .from(orders)
    .where(eq(orders.status, 'PAID'))
    .all();
  const gmv = paidOrders.reduce((s, o) => s + o.totalCents, 0);
  const gmv30 = paidOrders.filter((o) => o.paidAt && o.paidAt >= since30).reduce((s, o) => s + o.totalCents, 0);
  const academyGmv = paidOrders.filter((o) => o.kind === 'ACADEMY_SALE').reduce((s, o) => s + o.totalCents, 0);
  const creatorGmv = gmv - academyGmv;
  const refunds = db.select().from(orders).where(eq(orders.status, 'REFUNDED')).all().length;
  const refundRate = paidOrders.length ? Math.round((refunds / paidOrders.length) * 1000) / 10 : 0;

  const subs = db
    .select({ sub: subscriptions, plan: subscriptionPlans })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .all()
    .filter((s) => s.sub.status === 'active' || s.sub.status === 'trialing');
  const mrr = subs.reduce((s, x) => s + (x.sub.stripeSubscriptionId || !testMode ? x.plan.priceCents : x.plan.priceCents), 0);
  const proWs = db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.plan, 'PRO')).all().length;
  const freeWs = db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.plan, 'FREE')).all().length;

  const listingsPending = db.select({ id: marketplaceListings.id }).from(marketplaceListings).where(eq(marketplaceListings.status, 'PENDING')).all().length;
  const pendingPayouts = db.select({ id: payouts.id }).from(payouts).where(eq(payouts.status, 'PENDING')).all().length;
  const failedEmails = db.select({ id: emailLogs.id }).from(emailLogs).where(eq(emailLogs.status, 'FAILED')).all().length;

  const summary = ledgerSummary();
  const platformNet = getPlatformRevenue();

  const conversion = freeWs + proWs > 0 ? Math.round((proWs / (freeWs + proWs)) * 1000) / 10 : 0;

  return (
    <div>
      <PageHeader
        title="Business overview"
        description="MRR, GMV, platform revenue and operational queues — computed from real data."
        actions={
          <div className="flex gap-2">
            <Badge tone={testMode ? 'purple' : 'green'}>{testMode ? 'TEST MODE DATA' : 'LIVE DATA'}</Badge>
            <Badge tone="blue">Email: {emailProvider()}</Badge>
          </div>
        }
      />

      {testMode ? (
        <div className="mb-5">
          <InlineAlert tone="warning">
            Stripe is not configured — all payment figures below come from clearly-labeled TEST
            orders. Connect <code>STRIPE_SECRET_KEY</code> + <code>STRIPE_WEBHOOK_SECRET</code> for
            live revenue.
          </InlineAlert>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="MRR" value={formatCents(mrr)} hint={`${subs.length} active subscriptions`} />
        <Stat label="ARR (run-rate)" value={formatCents(mrr * 12)} />
        <Stat label="GMV (all time)" value={formatCents(gmv)} hint={`${paidOrders.length} paid orders`} />
        <Stat label="GMV (30 days)" value={formatCents(gmv30)} />
        <Stat label="Academy revenue" value={formatCents(academyGmv)} hint="creator GMV below" />
        <Stat label="Creator GMV" value={formatCents(creatorGmv)} />
        <Stat label="Platform net (ledger)" value={formatCents(platformNet)} hint="fees − reversals" />
        <Stat label="Refund rate" value={`${refundRate} %`} hint={`${refunds} refunded orders`} tone={refundRate > 10 ? 'negative' : 'neutral'} />
        <Stat label="Users" value={String(allUsers)} hint={`${allWs} workspaces`} />
        <Stat label="Free → Pro" value={`${conversion} %`} hint={`${proWs} Pro / ${freeWs} Free`} />
        <Stat label="Pending moderation" value={String(listingsPending)} hint="marketplace listings" />
        <Stat label="Pending payouts" value={String(pendingPayouts)} hint={failedEmails ? `${failedEmails} failed emails` : 'email queue healthy'} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded>
          <h2 className="mb-4 text-sm font-semibold text-zinc-200">Platform GMV — 14 days</h2>
          <BarChart data={revenueSeries(14)} format={(v) => formatCents(v)} />
        </Card>
        <Card padded>
          <h2 className="mb-4 text-sm font-semibold text-zinc-200">Ledger accounts</h2>
          <div className="space-y-2.5 text-sm">
            {Object.keys(summary).length === 0 ? (
              <p className="text-zinc-600">No entries yet.</p>
            ) : (
              Object.entries(summary).map(([account, balance]) => (
                <div key={account} className="flex items-center justify-between">
                  <span className="text-zinc-500">{account}</span>
                  <span className={`tabular-nums ${balance >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
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
