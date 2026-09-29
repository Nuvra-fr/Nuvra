import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { FlaskConical, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { orderItems, orders } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { BrandLogo } from '@/components/BrandLogo';
import { InlineAlert, Badge } from '@/components/ui';
import { confirmTestPurchaseAction } from '@/server/actions/checkout';

export const metadata: Metadata = { title: 'Paiement test' };

export default async function TestCheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .get();
  if (!order || order.mode !== 'TEST') notFound();
  if (order.status === 'PAID') {
    // already confirmed — go to success
    const { redirect } = await import('next/navigation');
    redirect(`/checkout/success?order=${orderId}`);
  }
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .all();

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="glass-capsule sticky top-0 z-40 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <BrandLogo href="/" />
          <Badge tone="purple">
            <FlaskConical className="h-3 w-3" /> TEST MODE
          </Badge>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-5 py-12">
        <div className="mb-6">
          <InlineAlert tone="warning">
            <strong>Achat de test — aucun paiement réel.</strong> Confirmer
            enregistre une commande <strong>TEST</strong> identifiée et déroule
            tout le pipeline : répartition, grand livre, inscription, CRM et
            automatisations.
          </InlineAlert>
        </div>

        <div className="card card-body">
          <div className="text-xs uppercase tracking-wide text-zinc-600">
            Order {order.number}
          </div>
          <div className="mt-3 space-y-2">
            {items.map((i) => (
              <div
                key={i.id}
                className="flex justify-between text-sm text-zinc-300"
              >
                <span>{i.title}</span>
                <span className="tabular-nums">
                  {formatCents(i.priceCents)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-white/[0.07] pt-4 font-semibold text-zinc-100">
            <span>Total (test)</span>
            <span className="tabular-nums">
              {formatCents(order.totalCents)}
            </span>
          </div>

          <form
            action={async () => {
              'use server';
              await confirmTestPurchaseAction(orderId);
            }}
          >
            <button className="btn-primary mt-6 w-full py-3" type="submit">
              Confirmer l&apos;achat test
            </button>
          </form>

          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Annuler et revenir
          </Link>
        </div>
      </main>
    </div>
  );
}
