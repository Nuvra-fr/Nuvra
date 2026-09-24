import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { subscriptionPlans, subscriptions, workspaces } from '@/db/schema';
import { emitEvent } from '@/lib/events';
import { audit } from '@/lib/audit';
import { paymentsMode } from '@/lib/stripe';

// ─────────────────────────────────────────────────────────────
// Nuvra Pro / plan management. In TEST MODE a subscription is created
// locally and labeled TEST everywhere; with Stripe configured, the
// Stripe subscription is the source of truth (webhook-driven).
// ─────────────────────────────────────────────────────────────

export function ensurePlans(): void {
  const plans = [
    { code: 'FREE', name: 'Free', priceCents: 0, sortOrder: 0, features: { commissionBps: 1000, aiCredits: 20 } },
    { code: 'PRO', name: 'Nuvra Pro', priceCents: 2900, sortOrder: 1, features: { commissionBps: 0, aiCredits: 200 } },
    { code: 'BUSINESS', name: 'Business', priceCents: 9900, sortOrder: 2, features: { commissionBps: 0, aiCredits: 1000, seats: 10 } },
    { code: 'AGENCY', name: 'Agency', priceCents: 24900, sortOrder: 3, features: { commissionBps: 0, aiCredits: 3000, seats: 50 } },
  ];
  for (const p of plans) {
    db.insert(subscriptionPlans)
      .values({ ...p, features: JSON.stringify(p.features), active: true })
      .onConflictDoUpdate({
        target: subscriptionPlans.code,
        set: { name: p.name, features: JSON.stringify(p.features) },
      })
      .run();
  }
}

export function activatePlan(workspaceId: string, planCode: string, meta: { stripeSubscriptionId?: string | null } = {}) {
  const plan = db.select().from(subscriptionPlans).where(eq(subscriptionPlans.code, planCode)).get();
  if (!plan) throw new Error(`Unknown plan ${planCode}`);
  const existing = db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .get();
  const periodEnd = new Date(Date.now() + 30 * 24 * 3600_000);
  if (existing) {
    db.update(subscriptions)
      .set({
        planId: plan.id,
        status: 'active',
        stripeSubscriptionId: meta.stripeSubscriptionId ?? existing.stripeSubscriptionId,
        currentPeriodEnd: periodEnd,
        canceledAt: null,
        cancelAtPeriodEnd: false,
      })
      .where(eq(subscriptions.id, existing.id))
      .run();
  } else {
    db.insert(subscriptions)
      .values({
        workspaceId,
        planId: plan.id,
        status: 'active',
        stripeSubscriptionId: meta.stripeSubscriptionId ?? null,
        currentPeriodEnd: periodEnd,
      })
      .run();
  }
  db.update(workspaces).set({ plan: planCode, updatedAt: new Date() }).where(eq(workspaces.id, workspaceId)).run();
  const ws = db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).get();
  emitEvent({ name: 'subscription.created', workspaceId, userId: ws?.ownerId, payload: { plan: planCode } });
  audit('subscription.activated', { target: workspaceId, meta: { planCode, mode: paymentsMode() } });
}

export function cancelPlan(workspaceId: string) {
  const sub = db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId)).get();
  if (sub) {
    db.update(subscriptions)
      .set({ status: 'canceled', canceledAt: new Date(), cancelAtPeriodEnd: false })
      .where(eq(subscriptions.id, sub.id))
      .run();
  }
  db.update(workspaces).set({ plan: 'FREE', updatedAt: new Date() }).where(eq(workspaces.id, workspaceId)).run();
  const ws = db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).get();
  emitEvent({ name: 'subscription.cancelled', workspaceId, userId: ws?.ownerId, payload: {} });
  audit('subscription.canceled', { target: workspaceId });
}

export function markPaymentFailed(workspaceId: string) {
  const sub = db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId)).get();
  if (sub) db.update(subscriptions).set({ status: 'past_due' }).where(eq(subscriptions.id, sub.id)).run();
  const ws = db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).get();
  emitEvent({ name: 'subscription.payment_failed', workspaceId, userId: ws?.ownerId, payload: {} });
}

export function getSubscription(workspaceId: string) {
  const sub = db
    .select({ sub: subscriptions, plan: subscriptionPlans })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.workspaceId, workspaceId))
    .get();
  return sub ?? null;
}
