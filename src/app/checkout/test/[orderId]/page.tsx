import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { FlaskConical, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { orderItems, orders } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { Logo } from '@/components/auth';
import { InlineAlert, Badge } from '@/components/ui';
import { confirmTestPurchaseAction } from '@/server/actions/checkout';

export const metadata: Metadata = { title: 'Test checkout' };

export default async function TestCheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order || order.mode !== 'TEST') notFound();
  if (order.status === 'PAID') {
    // already confirmed — go to success
    const { redirect } = await import('next/navigation');
    redirect(`/checkout/success?order=${orderId}`);
  }
  const items = db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all();

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Logo />
          <Badge tone="purple">
            <FlaskConical className="h-3 w-3" /> TEST MODE
          </Badge>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-5 py-12">
        <div className="mb-6">
          <InlineAlert tone="warning">
            <strong>This is a test purchase — no real payment occurs.</strong>
            <br />
            Stripe is not configured on this deployment. Confirming records a{' '}
            <strong>TEST</strong> order and exercises the complete pipeline: split calculation,
            financial ledger, enrollment, CRM and automations. Orders in test mode are always
            labeled <strong>TEST</strong> in every dashboard.
          </InlineAlert>
        </div>

        <div className="card p-6">
          <div className="text-xs uppercase tracking-wide text-zinc-600">Order {order.number}</div>
          <div className="mt-3 space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm text-zinc-300">
                <span>{i.title}</span>
                <span className="tabular-nums">{formatCents(i.priceCents)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-white/[0.07] pt-4 font-semibold text-zinc-100">
            <span>Total (test)</span>
            <span className="tabular-nums">{formatCents(order.totalCents)}</span>
          </div>

          <form
            action={async () => {
              'use server';
              await confirmTestPurchaseAction(orderId);
            }}
          >
            <button className="btn-primary mt-6 w-full py-3" type="submit">
              Confirm TEST purchase
            </button>
          </form>

          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel and go back
          </Link>
        </div>
      </main>
    </div>
  );
}
