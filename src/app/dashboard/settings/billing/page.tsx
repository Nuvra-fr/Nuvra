import type { Metadata } from 'next';

import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { requireUser } from '@/lib/auth';
import { getSubscription, ensurePlans } from '@/lib/billing';
import { paymentsMode } from '@/lib/stripe';
import { formatCents } from '@/lib/money';
import { getConfig, freeCommissionBps } from '@/lib/config';
import { Badge, InlineAlert, PageHeader as PH } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import UpgradeButton from './UpgradeButton';
import CancelPlanButton from './CancelPlanButton';

export const metadata: Metadata = { title: 'Facturation' };

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
  const proPrice = Number((await getConfig<number>('pro.priceCents')) ?? 2900);
  const businessPrice = Number(
    (await getConfig<number>('business.priceCents')) ?? 9900,
  );
  const freeBps = await freeCommissionBps();
  const commissionBps = ctx.workspace.plan === 'FREE' ? freeBps : 0;
  const exampleSales = 100000; // $1,000.00 — same currency as the configured prices
  const freeFee = Math.floor((exampleSales * freeBps) / 10000);
  const breakEven = Math.ceil((proPrice / Math.max(1, freeBps)) * 10000);

  return (
    <div>
      <PH
        title="Facturation & plan"
        description="Pro supprime la commission plateforme sur vos ventes."
      />

      {sp.upgraded ? (
        <div className="mb-6">
          <InlineAlert tone="success">
            Plan activated
            {mode === 'test'
              ? ' (MODE TEST — configurez STRIPE_SECRET_KEY pour la facturation réelle)'
              : ''}
            . You now keep 100 % of your sales before payment-processing fees.
          </InlineAlert>
        </div>
      ) : null}
      {sp.canceled ? (
        <div className="mb-6">
          <InlineAlert tone="warning">
            Paiement annulé — votre plan est inchangé.
          </InlineAlert>
        </div>
      ) : null}

      {/* Current plan */}
      <div className="card card-body mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="eyebrow">Plan actuel</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold text-zinc-100">
                Nuvra {ctx.workspace.plan}
              </span>
              <Badge tone={ctx.workspace.plan === 'FREE' ? 'default' : 'green'}>
                {ctx.workspace.plan === 'FREE'
                  ? `${commissionBps / 100}% commission`
                  : '0% commission'}
              </Badge>
            </div>
            <div className="mt-1.5 text-xs text-zinc-600">
              {sub?.sub.currentPeriodEnd
                ? `Renews ${formatDateTime(sub.sub.currentPeriodEnd)}`
                : ctx.workspace.plan === 'FREE'
                  ? 'Gratuit à vie — passez au payant quand c’est rentable'
                  : 'Aucune date de renouvellement enregistrée'}
              {' · '}
              {mode === 'stripe'
                ? 'Stripe — abonnements en production'
                : 'MODE TEST — aucun prélèvement réel'}
            </div>
          </div>
          {ctx.workspace.plan !== 'FREE' ? <CancelPlanButton /> : null}
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-2">
        <div
          className={cn(
            'card card-body',
            ctx.workspace.plan === 'PRO' && 'border-emerald-500/30',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-nuvra-300">
              Nuvra Pro
            </div>
            {ctx.workspace.plan === 'PRO' ? (
              <Badge tone="green">ACTIF</Badge>
            ) : null}
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {formatCents(proPrice)}
            <span className="text-sm font-normal text-zinc-500">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {[
              '0 % de commission Nuvra sur vos ventes',
              'Domaine personnalisé',
              'Statistiques avancées & tests A/B',
              '200 crédits IA / mois',
              'API, webhooks, priority support',
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <UpgradeButton
              plan="PRO"
              label={
                ctx.workspace.plan === 'PRO' ? 'Passer en Pro' : 'Passer en Pro'
              }
              disabled={ctx.workspace.plan === 'PRO'}
            />
          </div>
        </div>

        <div
          className={cn(
            'card card-body',
            ctx.workspace.plan === 'BUSINESS' && 'border-emerald-500/30',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-300">Business</div>
            {ctx.workspace.plan === 'BUSINESS' ? (
              <Badge tone="green">ACTIF</Badge>
            ) : null}
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {formatCents(businessPrice)}
            <span className="text-sm font-normal text-zinc-500">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {[
              'Tout ce qui est inclus dans Pro',
              '1 000 crédits IA / mois',
              'Priority support',
              'Dedicated onboarding',
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <UpgradeButton
              plan="BUSINESS"
              label={
                ctx.workspace.plan === 'BUSINESS'
                  ? 'Current'
                  : 'Choisir Business'
              }
              disabled={ctx.workspace.plan === 'BUSINESS'}
            />
          </div>
        </div>
      </div>

      {/* Free economics explainer */}
      <div className="card card-body mt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h2 className="section-title">Ce que Pro vous fait économiser</h2>
          </div>
          <span className="text-xs text-zinc-600">
            {freeBps / 100} % → 0 % de commission
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.07] p-4">
            <div className="text-xs text-zinc-500">
              Free — vous gardez {100 - freeBps / 100} %
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
              {formatCents(exampleSales)} de ventes → commission{' '}
              <strong className="text-zinc-100">{formatCents(freeFee)}</strong>
            </p>
          </div>
          <div className="rounded-xl border border-nuvra-500/25 bg-nuvra-500/[0.06] p-4">
            <div className="text-xs text-nuvra-300">
              Pro — vous gardez 100 %
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
              Mêmes {formatCents(exampleSales)} → commission{' '}
              <strong className="text-emerald-300">{formatCents(0)}</strong>,
              soit {formatCents(freeFee)} en plus.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-600">
          Pro rentabilisé dès {formatCents(breakEven)} de ventes par mois. Les
          frais Stripe restent séparés et ne sont jamais comptés comme
          commission Nuvra.
        </p>
      </div>
    </div>
  );
}
