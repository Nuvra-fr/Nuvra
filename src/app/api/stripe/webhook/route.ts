import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { stripeEvents } from '@/db/schema';
import { constructWebhookEvent, paymentsMode } from '@/lib/stripe';
import { finalizeOrderPaid, refundOrder, OrderError } from '@/lib/orders';
import { activatePlan, cancelPlan, markPaymentFailed } from '@/lib/billing';
import { audit } from '@/lib/audit';

// Stripe requires the raw body — Next gives it via req.text()
export async function POST(req: Request): Promise<Response> {
  if (paymentsMode() !== 'stripe') {
    return Response.json(
      { ok: false, error: 'Stripe is not configured (STRIPE_SECRET_KEY missing)' },
      { status: 503 },
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return Response.json({ ok: false, error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const payload = await req.text();

  let event: import('stripe').Stripe.Event;
  try {
    event = constructWebhookEvent(Buffer.from(payload, 'utf8'), signature);
  } catch (err) {
    return Response.json(
      { ok: false, error: `Invalid signature: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 400 },
    );
  }

  // Idempotency: process each Stripe event at most once
  const seen = db.select({ id: stripeEvents.id }).from(stripeEvents).where(eq(stripeEvents.id, event.id)).get();
  if (seen) {
    return Response.json({ ok: true, duplicate: true });
  }
  db.insert(stripeEvents)
    .values({ id: event.id, type: event.type, payload: payload.slice(0, 100_000) })
    .run();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId && session.payment_status === 'paid') {
          finalizeOrderPaid(orderId, {
            provider: 'stripe',
            reference: session.id,
            raw: { payment_status: session.payment_status, mode: session.mode },
          });
        }
        if (session.metadata?.kind === 'subscription' && session.metadata?.workspaceId) {
          activatePlan(session.metadata.workspaceId, session.metadata.plan ?? 'PRO', {
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const parentSub = invoice.parent?.subscription_details?.subscription ?? null;
        const subId = typeof parentSub === 'string' ? parentSub : parentSub?.id ?? null;
        if (subId) {
          const { subscriptions } = await import('@/db/schema');
          const sub = db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, subId)).get();
          if (sub) {
            db.update(subscriptions)
              .set({ status: 'active', currentPeriodEnd: new Date((invoice.period_end ?? 0) * 1000) })
              .where(eq(subscriptions.id, sub.id))
              .run();
            audit('subscription.invoice_paid', { target: sub.workspaceId, meta: { invoiceId: invoice.id } });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const parentSub = invoice.parent?.subscription_details?.subscription ?? null;
        const subId = typeof parentSub === 'string' ? parentSub : parentSub?.id ?? null;
        if (subId) {
          const { subscriptions } = await import('@/db/schema');
          const sub = db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, subId)).get();
          if (sub) markPaymentFailed(sub.workspaceId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const { subscriptions } = await import('@/db/schema');
        const row = db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
          .get();
        if (row) {
          if (sub.status === 'active' || sub.status === 'trialing') {
            const periodEndSec = sub.items?.data?.[0]?.current_period_end ?? 0;
            db.update(subscriptions)
              .set({
                status: sub.status,
                currentPeriodEnd: periodEndSec ? new Date(periodEndSec * 1000) : null,
                cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
              })
              .where(eq(subscriptions.id, row.id))
              .run();
          } else {
            cancelPlan(row.workspaceId);
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const orderId = charge.metadata?.orderId;
        if (orderId) {
          const refunded = charge.amount_refunded ?? 0;
          try {
            refundOrder(orderId, {
              amountCents: refunded,
              reason: 'stripe_refund',
              provider: 'stripe',
              reference: charge.id,
            });
          } catch (e) {
            if (!(e instanceof OrderError)) throw e;
          }
        }
        break;
      }

      default:
        // Other event types are acknowledged but not acted upon.
        break;
    }

    db.update(stripeEvents).set({ processedAt: new Date() }).where(eq(stripeEvents.id, event.id)).run();
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    db.update(stripeEvents).set({ error: message.slice(0, 500) }).where(eq(stripeEvents.id, event.id)).run();
    // 500 → Stripe retries with backoff (safe thanks to idempotency above)
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
