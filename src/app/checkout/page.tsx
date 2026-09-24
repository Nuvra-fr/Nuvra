import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { resolveCheckoutItem } from '@/server/actions/checkout';
import { paymentsMode } from '@/lib/stripe';
import { formatCents, estimateProcessorFee } from '@/lib/money';
import { Logo } from '@/components/auth';
import { Badge, InlineAlert } from '@/components/ui';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; aff?: string; reseller?: string; ref?: string; canceled?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.item) redirect('/');
  const item = await resolveCheckoutItem(sp.item);
  if (!item) redirect('/');

  const ctx = await getSession();
  const mode = paymentsMode();
  const fee = estimateProcessorFee(item.priceCents);

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Logo />
          <Link href="/" className="btn-ghost text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        {sp.canceled ? (
          <div className="mb-6">
            <InlineAlert tone="warning">Checkout canceled — no payment was taken.</InlineAlert>
          </div>
        ) : null}

        {mode === 'test' ? (
          <div className="mb-6">
            <InlineAlert tone="warning">
              <strong>TEST MODE.</strong> Stripe is not configured on this deployment
              (set <code>STRIPE_SECRET_KEY</code>), so this checkout records a clearly-labeled test
              order. <strong>No real money moves.</strong> The full flow (split, ledger, enrollment,
              automations) runs exactly as in live mode.
            </InlineAlert>
          </div>
        ) : (
          <div className="mb-6">
            <InlineAlert tone="success">
              <ShieldCheck className="inline h-4 w-4" /> Secure Stripe checkout — your card data never
              touches Nuvra servers.
            </InlineAlert>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-600">Buying</div>
                <h1 className="mt-1 text-lg font-semibold text-zinc-100">{item.title}</h1>
                <div className="mt-1 text-xs text-zinc-500 capitalize">
                  {item.kind}
                  {item.requiresAccount && !ctx ? ' · account required' : ''}
                </div>
              </div>
              <div className="text-xl font-semibold text-zinc-100">
                {formatCents(item.priceCents)}
              </div>
            </div>

            {item.requiresAccount && !ctx ? (
              <div className="mt-6 rounded-lg border border-white/10 bg-ink-900 p-4 text-sm text-zinc-400">
                You need an account to access this content after purchase.{' '}
                <Link href="/login" className="text-nuvra-400 hover:underline">Sign in</Link> or{' '}
                <Link href="/register" className="text-nuvra-400 hover:underline">create one</Link> —
                it&apos;s free.
              </div>
            ) : (
              <CheckoutForm
                item={sp.item}
                defaultName={ctx?.user.name ?? ''}
                defaultEmail={ctx?.user.email ?? ''}
                reseller={sp.reseller ?? sp.ref ?? ''}
                aff={sp.aff ?? sp.ref ?? ''}
                requireAccount={item.requiresAccount}
              />
            )}
          </div>

          <div className="card h-fit p-5">
            <h2 className="text-sm font-semibold text-zinc-200">Order summary</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>{item.title}</span>
                <span className="tabular-nums">{formatCents(item.priceCents)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Payment processing (est.)</span>
                <span className="tabular-nums">{item.priceCents > 0 ? `~${formatCents(fee)}` : '—'}</span>
              </div>
              <div className="border-t border-white/[0.07] pt-2.5 flex justify-between font-semibold text-zinc-100">
                <span>Total</span>
                <span className="tabular-nums">{formatCents(item.priceCents)}</span>
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-zinc-600">
              Processing fees are estimates and always kept separate from the platform commission.
              Your receipt shows the exact breakdown.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge tone={mode === 'stripe' ? 'green' : 'purple'}>
                {mode === 'stripe' ? 'LIVE STRIPE' : 'TEST MODE'}
              </Badge>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
