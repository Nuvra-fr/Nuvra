import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { CheckCircle2, GraduationCap } from 'lucide-react';
import { db } from '@/lib/db';
import { orderItems, orders, workspaces, ledgerEntries } from '@/db/schema';
import { formatCents, creatorSplit } from '@/lib/money';
import { freeCommissionBps } from '@/lib/config';
import { BrandLogo } from '@/components/BrandLogo';
import { Badge, StatusBadge, InlineAlert } from '@/components/ui';
import { getSession } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { verifyCheckoutSessionForOrder } from '@/lib/checkout-verify';

export const metadata: Metadata = { title: 'Commande confirmée' };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.order) notFound();

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, sp.order))
    .get();
  if (!order) notFound();

  // If Stripe returned here with a session, verify + finalize server-side (idempotent).
  // The session is only allowed to finalize THIS order, for the exact amount the
  // order asks for — otherwise a `cs_…` id paid for a cheap order could be
  // replayed here against an expensive pending one.
  if (sp.session_id && order.status === 'PENDING') {
    try {
      const { getStripe } = await import('@/lib/stripe');
      const stripe = getStripe();
      if (stripe) {
        const session = await stripe.checkout.sessions.retrieve(sp.session_id);
        const verdict = verifyCheckoutSessionForOrder(session, order);
        if (verdict.ok) {
          const { finalizeOrderPaid } = await import('@/lib/orders');
          await finalizeOrderPaid(order.id, {
            provider: 'stripe',
            reference: session.id,
            raw: { payment_status: session.payment_status },
          });
        } else {
          await audit('payment.claim_rejected', {
            target: order.id,
            meta: {
              sessionId: sp.session_id,
              reason: verdict.reason,
              detail: verdict.detail,
            },
          });
        }
      }
    } catch {
      // webhook remains the source of truth
    }
  }

  const fresh = (await db
    .select()
    .from(orders)
    .where(eq(orders.id, sp.order))
    .get())!;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, fresh.id))
    .all();
  const seller = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, fresh.workspaceId))
    .get();
  const entries = await db
    .select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.orderId, fresh.id))
    .all();
  const ctx = await getSession();

  const split =
    fresh.kind === 'ACADEMY_SALE'
      ? {
          seller: fresh.totalCents - fresh.platformFeeCents,
          platform: fresh.platformFeeCents,
          label: fresh.resellerId
            ? 'Revendeur (programme 90/10)'
            : 'Nuvra (direct)',
        }
      : await (async () => {
          const plan = seller?.plan ?? 'FREE';
          const s = creatorSplit(
            fresh.totalCents,
            plan as 'FREE' | 'PRO',
            await freeCommissionBps(),
          );
          return {
            seller: s.sellerCents,
            platform: s.platformCents,
            label: `Créateur (${plan})`,
          };
        })();

  const courseItem = items.find(
    (i) => i.kind === 'COURSE' || i.kind === 'ACADEMY',
  );

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="glass-capsule sticky top-0 z-40 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <BrandLogo href="/" />
          <StatusBadge status={fresh.mode} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-12">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          <h1 className="mt-4 text-2xl font-semibold text-zinc-100">
            {fresh.status === 'PAID'
              ? 'Paiement confirmé'
              : 'Commande enregistrée'}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Commande <strong className="text-zinc-300">{fresh.number}</strong>
            {fresh.status === 'PAID'
              ? ' est payée'
              : ' — en attente de confirmation du paiement'}
            .
          </p>
          {fresh.mode === 'TEST' ? (
            <div className="mt-3">
              <Badge tone="purple">MODE TEST — aucun paiement réel</Badge>
            </div>
          ) : null}
        </div>

        <div className="card mt-8 p-6">
          <h2 className="section-title">Reçu</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-zinc-400">
                <span>
                  {i.title} × {i.quantity}
                </span>
                <span className="tabular-nums">
                  {formatCents(i.priceCents)}
                </span>
              </div>
            ))}
            {fresh.discountCents > 0 ? (
              <div className="flex justify-between text-emerald-400">
                <span>Remise</span>
                <span className="tabular-nums">
                  -{formatCents(fresh.discountCents)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-white/[0.07] pt-2.5 font-semibold text-zinc-100">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCents(fresh.totalCents)}
              </span>
            </div>
          </div>

          {fresh.status === 'PAID' ? (
            <div className="mt-6 rounded-lg border border-white/[0.07] bg-ink-900 p-4">
              <div className="eyebrow">Répartition transparente</div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-white/[0.04] p-3">
                  <div className="text-[11px] text-zinc-500">{split.label}</div>
                  <div className="mt-0.5 text-lg font-semibold text-emerald-300">
                    {formatCents(split.seller)}
                  </div>
                </div>
                <div className="rounded-md bg-white/[0.04] p-3">
                  <div className="text-[11px] text-zinc-500">
                    Part plateforme Nuvra
                  </div>
                  <div className="mt-0.5 text-lg font-semibold text-nuvra-300">
                    {formatCents(split.platform)}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-zinc-600">
                {entries.length} écritures au grand livre · les frais de
                paiement éventuels sont enregistrés à part, jamais mélangés à la
                commission Nuvra.
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <InlineAlert tone="warning">
                Cette commande n&apos;est pas encore confirmée. Si vous avez
                payé par Stripe, le webhook la valide en quelques secondes —
                rechargez cette page.
              </InlineAlert>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {courseItem && fresh.status === 'PAID' && ctx ? (
            <Link href="/dashboard/academy" className="btn-primary">
              <GraduationCap className="h-4 w-4" /> Ouvrir l&apos;espace
              d&apos;apprentissage
            </Link>
          ) : null}
          <Link href="/dashboard" className="btn-secondary">
            Aller au tableau de bord
          </Link>
        </div>
      </main>
    </div>
  );
}
