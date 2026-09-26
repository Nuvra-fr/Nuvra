import type { Metadata } from 'next';

import { Check, Sparkles } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { getSubscription, ensurePlans } from '@/lib/billing';
import { paymentsMode } from '@/lib/stripe';
import { formatCents } from '@/lib/money';
import { getConfig, freeCommissionBps } from '@/lib/config';
import { Badge, InlineAlert, PageHeader as PH } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import UpgradeButton from './UpgradeButton';
import CancelPlanButton from './CancelPlanButton';

export const metadata: Metadata = { title: 'Billing' };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; canceled?: string }>;
}) {
  const ctx = await requireUser();
  await ensurePlans();
  const sp = await searchParams;
  const sub = await getSubscription(ctx.workspace.id);
  const mode = paymentsMode();
  const proPrice = Number(await getConfig<number>('pro.priceCents') ?? 2900);
  const businessPrice = Number(await getConfig<number>('business.priceCents') ?? 9900);
  const commissionBps = ctx.workspace.plan === 'FREE' ? await freeCommissionBps() : 0;

  return (
    <div>
      <PH
        title="Billing & plan"
        description="Nuvra Pro removes the platform commission on your own sales and unlocks advanced tools."
      />

      {sp.upgraded ? (
        <div className="mb-5">
          <InlineAlert tone="success">
            Plan activated{mode === 'test' ? ' (TEST MODE — set STRIPE_SECRET_KEY for live billing)' : ''}. You
            now keep 100 % of your sales before payment-processing fees.
          </InlineAlert>
        </div>
      ) : null}
      {sp.canceled ? (
        <div className="mb-5">
          <InlineAlert tone="warning">Checkout canceled — your plan is unchanged.</InlineAlert>
        </div>
      ) : null}

      <div className="mb-6">
        <InlineAlert tone={mode === 'stripe' ? 'success' : 'warning'}>
          Billing mode:{' '}
          <strong>{mode === 'stripe' ? 'Stripe (live subscriptions)' : 'TEST MODE'}</strong>
          {mode === 'test'
            ? ' — upgrades are recorded locally and labeled TEST. Configure Stripe to bill real cards.'
            : ' — subscriptions renew automatically via Stripe webhooks.'}
        </InlineAlert>
      </div>

      {/* Current plan */}
      <div className="card mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Current plan</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold text-zinc-100">Nuvra {ctx.workspace.plan}</span>
              <Badge tone={ctx.workspace.plan === 'FREE' ? 'default' : 'green'}>
                {ctx.workspace.plan === 'FREE' ? `${commissionBps / 100}% commission` : '0% commission'}
              </Badge>
            </div>
            <div className="mt-1 text-xs text-zinc-600">
              {sub?.sub.currentPeriodEnd
                ? `Renews ${formatDateTime(sub.sub.currentPeriodEnd)}`
                : ctx.workspace.plan === 'FREE'
                  ? 'Free forever — upgrade only when it pays for itself'
                  : 'No renewal date recorded'}
            </div>
          </div>
          {ctx.workspace.plan !== 'FREE' ? (
            <CancelPlanButton />
          ) : null}
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className={`card p-6 ${ctx.workspace.plan === 'PRO' ? 'border-emerald-500/40' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-nuvra-300">Nuvra Pro</div>
            {ctx.workspace.plan === 'PRO' ? <Badge tone="green">ACTIVE</Badge> : null}
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {formatCents(proPrice)}
            <span className="text-sm font-normal text-zinc-500">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {[
              '0 % Nuvra commission on your sales',
              'Custom domain',
              'Advanced analytics & A/B testing',
              '200 AI credits / month',
              'API, webhooks, priority support',
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <UpgradeButton plan="PRO" label={ctx.workspace.plan === 'PRO' ? 'Switch to Pro' : 'Upgrade to Pro'} disabled={ctx.workspace.plan === 'PRO'} />
          </div>
        </div>

        <div className={`card p-6 ${ctx.workspace.plan === 'BUSINESS' ? 'border-emerald-500/40' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-300">Business</div>
            {ctx.workspace.plan === 'BUSINESS' ? <Badge tone="green">ACTIVE</Badge> : null}
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {formatCents(businessPrice)}
            <span className="text-sm font-normal text-zinc-500">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {['Everything in Pro', '10+ team seats', '1,000 AI credits / month', 'Dedicated onboarding'].map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <UpgradeButton plan="BUSINESS" label={ctx.workspace.plan === 'BUSINESS' ? 'Current' : 'Choose Business'} disabled={ctx.workspace.plan === 'BUSINESS'} />
          </div>
        </div>
      </div>

      {/* Free economics explainer */}
      <div className="card mt-6 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Sparkles className="h-4 w-4 text-amber-400" /> What Pro actually saves you
        </div>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.07] p-4">
            <div className="text-xs text-zinc-500">On Free — you keep 90 %</div>
            <div className="mt-1 text-zinc-300">
              Example: 1 000 € in sales → Nuvra fee <strong className="text-zinc-100">100 €</strong>, you
              keep 900 € (before payment-processing fees).
            </div>
          </div>
          <div className="rounded-lg border border-nuvra-500/30 bg-nuvra-500/[0.06] p-4">
            <div className="text-xs text-nuvra-300">On Pro — you keep 100 %</div>
            <div className="mt-1 text-zinc-300">
              Same 1 000 € in sales → Nuvra fee <strong className="text-emerald-300">0 €</strong>. If Pro
              costs {formatCents(proPrice)}/mo, it pays for itself below{' '}
              {formatCents(Math.ceil(proPrice / Math.max(1, await freeCommissionBps()) * 10000))} of monthly sales.
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-zinc-600">
          Payment-processing fees (Stripe) are always separate and never counted as Nuvra commission.
        </p>
      </div>
    </div>
  );
}
