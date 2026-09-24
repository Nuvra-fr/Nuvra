import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { CheckCircle2, GraduationCap } from 'lucide-react';
import { db } from '@/lib/db';
import { orderItems, orders, workspaces, ledgerEntries } from '@/db/schema';
import { formatCents, creatorSplit } from '@/lib/money';
import { freeCommissionBps } from '@/lib/config';
import { Logo } from '@/components/auth';
import { Badge, StatusBadge, InlineAlert } from '@/components/ui';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = { title: 'Order confirmed' };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.order) notFound();

  const order = db.select().from(orders).where(eq(orders.id, sp.order)).get();
  if (!order) notFound();

  // If Stripe returned here with a session, verify + finalize server-side (idempotent).
  if (sp.session_id && order.status !== 'PAID') {
    try {
      const { getStripe } = await import('@/lib/stripe');
      const stripe = getStripe();
      if (stripe) {
        const session = await stripe.checkout.sessions.retrieve(sp.session_id);
        if (session.payment_status === 'paid') {
          const { finalizeOrderPaid } = await import('@/lib/orders');
          finalizeOrderPaid(order.id, {
            provider: 'stripe',
            reference: session.id,
            raw: { payment_status: session.payment_status },
          });
        }
      }
    } catch {
      // webhook remains the source of truth
    }
  }

  const fresh = db.select().from(orders).where(eq(orders.id, sp.order)).get()!;
  const items = db.select().from(orderItems).where(eq(orderItems.orderId, fresh.id)).all();
  const seller = db.select().from(workspaces).where(eq(workspaces.id, fresh.workspaceId)).get();
  const entries = db.select().from(ledgerEntries).where(eq(ledgerEntries.orderId, fresh.id)).all();
  const ctx = await getSession();

  const split =
    fresh.kind === 'ACADEMY_SALE'
      ? {
          seller: fresh.totalCents - fresh.platformFeeCents,
          platform: fresh.platformFeeCents,
          label: fresh.resellerId ? 'Reseller (90/10 program)' : 'Nuvra (direct)',
        }
      : (() => {
          const plan = seller?.plan ?? 'FREE';
          const s = creatorSplit(fresh.totalCents, plan as 'FREE' | 'PRO', freeCommissionBps());
          return { seller: s.sellerCents, platform: s.platformCents, label: `Creator (${plan})` };
        })();

  const courseItem = items.find((i) => i.kind === 'COURSE' || i.kind === 'ACADEMY');

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Logo />
          <StatusBadge status={fresh.mode} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-12">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          <h1 className="mt-4 text-2xl font-semibold text-zinc-100">
            {fresh.status === 'PAID' ? 'Payment confirmed' : 'Order received'}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Order <strong className="text-zinc-300">{fresh.number}</strong>
            {fresh.status === 'PAID' ? ' is paid' : ' — awaiting payment confirmation'}.
          </p>
          {fresh.mode === 'TEST' ? (
            <div className="mt-3">
              <Badge tone="purple">TEST MODE — no real money moved</Badge>
            </div>
          ) : null}
        </div>

        <div className="card mt-8 p-6">
          <h2 className="text-sm font-semibold text-zinc-200">Receipt</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-zinc-400">
                <span>{i.title} × {i.quantity}</span>
                <span className="tabular-nums">{formatCents(i.priceCents)}</span>
              </div>
            ))}
            {fresh.discountCents > 0 ? (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span className="tabular-nums">-{formatCents(fresh.discountCents)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-white/[0.07] pt-2.5 font-semibold text-zinc-100">
              <span>Total</span>
              <span className="tabular-nums">{formatCents(fresh.totalCents)}</span>
            </div>
          </div>

          {fresh.status === 'PAID' ? (
            <div className="mt-6 rounded-lg border border-white/[0.07] bg-ink-900 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Transparent revenue split
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-white/[0.04] p-3">
                  <div className="text-[11px] text-zinc-500">{split.label}</div>
                  <div className="mt-0.5 text-lg font-semibold text-emerald-300">
                    {formatCents(split.seller)}
                  </div>
                </div>
                <div className="rounded-md bg-white/[0.04] p-3">
                  <div className="text-[11px] text-zinc-500">Nuvra platform share</div>
                  <div className="mt-0.5 text-lg font-semibold text-nuvra-300">
                    {formatCents(split.platform)}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-zinc-600">
                {entries.length} ledger entries written · payment-processing fees (if any) are
                recorded separately and never mixed with the platform commission.
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <InlineAlert tone="warning">
                This order is not confirmed yet. If you completed a Stripe payment, the webhook will
                finalize it within seconds — refresh this page.
              </InlineAlert>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {courseItem && fresh.status === 'PAID' && ctx ? (
            <Link href="/dashboard/academy" className="btn-primary">
              <GraduationCap className="h-4 w-4" /> Open learning space
            </Link>
          ) : null}
          <Link href="/dashboard" className="btn-secondary">
            Go to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
