import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  affiliates,
  affiliatePrograms,
  affiliateSales,
  contacts,
  contactActivities,
  coupons,
  enrollments,
  orderItems,
  orders,
  payments,
  refunds,
  resellerProfiles,
  users,
  workspaces,
  type Order,
} from '@/db/schema';
import { academySplit, applyCoupon, creatorSplit } from '@/lib/money';
import { freeCommissionBps, resellerBps } from '@/lib/config';
import { recordAffiliateCommission, recordRefund, recordSale } from '@/lib/ledger';
import { emitEvent } from '@/lib/events';
import { notifyWorkspaceOwners } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import type { Plan } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────
// Order lifecycle: create → pay (Stripe or explicit TEST MODE) →
// split (server-side) → ledger → enrollment → automations.
// ALL financial logic runs here, server-side. Never in the frontend.
// ─────────────────────────────────────────────────────────────

export interface CreateOrderItemInput {
  kind: 'PRODUCT' | 'COURSE' | 'ACADEMY';
  productId?: string | null;
  courseId?: string | null;
  title: string;
  priceCents: number;
  quantity?: number;
}

export interface CreateOrderInput {
  workspaceId: string;
  kind?: 'CREATOR_SALE' | 'ACADEMY_SALE';
  items: CreateOrderItemInput[];
  buyerEmail: string;
  buyerName?: string | null;
  buyerUserId?: string | null;
  couponCode?: string | null;
  resellerId?: string | null;
  affiliateCode?: string | null;
  mode?: 'LIVE' | 'TEST';
}

export class OrderError extends Error {}

async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 30; attempt++) {
    const n = Math.floor(Math.random() * 900000) + 100000;
    const number = `NV-${year}-${n}`;
    const existing = await db.select({ id: orders.id }).from(orders).where(eq(orders.number, number)).get();
    if (!existing) return number;
  }
  return `NV-${year}-${Date.now()}`;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (input.items.length === 0) throw new OrderError('Order must have at least one item');
  let subtotal = 0;
  for (const it of input.items) {
    if (it.priceCents < 0 || !Number.isInteger(it.priceCents)) {
      throw new OrderError('Invalid item price');
    }
    subtotal += it.priceCents * (it.quantity ?? 1);
  }

  let discount = 0;
  let couponRow = null;
  if (input.couponCode) {
    couponRow = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, input.couponCode.toUpperCase()))
      .get();
    if (!couponRow || !couponRow.active) throw new OrderError('Invalid coupon');
    if (couponRow.expiresAt && couponRow.expiresAt.getTime() < Date.now()) {
      throw new OrderError('Coupon expired');
    }
    if (couponRow.maxRedemptions && couponRow.redeemedCount >= couponRow.maxRedemptions) {
      throw new OrderError('Coupon fully redeemed');
    }
    if (couponRow.percentOff) discount = subtotal - applyCoupon(subtotal, couponRow.percentOff);
    else if (couponRow.amountOffCents) discount = Math.min(subtotal, couponRow.amountOffCents);
  }

  const total = subtotal - discount;
  const mode = input.mode ?? 'TEST';

  const order = await db
    .insert(orders)
    .values({
      workspaceId: input.workspaceId,
      buyerUserId: input.buyerUserId ?? null,
      resellerId: input.resellerId ?? null,
      couponId: couponRow?.id ?? null,
      affiliateCode: input.affiliateCode ?? null,
      number: await nextOrderNumber(),
      kind: input.kind ?? 'CREATOR_SALE',
      status: 'PENDING',
      mode,
      subtotalCents: subtotal,
      discountCents: discount,
      platformFeeCents: 0,
      totalCents: total,
      buyerEmail: input.buyerEmail.toLowerCase().trim(),
      buyerName: input.buyerName ?? null,
    })
    .returning()
    .get();

  for (const it of input.items) {
    await db.insert(orderItems)
      .values({
        orderId: order.id,
        kind: it.kind,
        productId: it.productId ?? null,
        courseId: it.courseId ?? null,
        title: it.title,
        priceCents: it.priceCents,
        quantity: it.quantity ?? 1,
      })
      .run();
  }

  if (couponRow) {
    await db.update(coupons)
      .set({ redeemedCount: couponRow.redeemedCount + 1 })
      .where(eq(coupons.id, couponRow.id))
      .run();
  }

  return order;
}

/** Server-side split decision for a paid order. */
export async function computeOrderSplit(order: Order): Promise<{
  sellerAccount: 'CREATOR_PAYABLE' | 'RESELLER_PAYABLE' | null;
  sellerUserId: string | null;
  sellerCents: number;
  platformCents: number;
  sellerBps: number;
}> {
  const gross = order.totalCents;
  if (order.kind === 'ACADEMY_SALE') {
    if (order.resellerId) {
      const reseller = await db
        .select()
        .from(resellerProfiles)
        .where(eq(resellerProfiles.id, order.resellerId))
        .get();
      if (reseller && reseller.status === 'ACTIVE') {
        const split = academySplit(gross, await resellerBps());
        return {
          sellerAccount: 'RESELLER_PAYABLE',
          sellerUserId: reseller.userId,
          sellerCents: split.sellerCents,
          platformCents: split.platformCents,
          sellerBps: await resellerBps(),
        };
      }
    }
    // Direct Academy sale (no reseller) → Nuvra keeps 100 %
    return {
      sellerAccount: null,
      sellerUserId: null,
      sellerCents: 0,
      platformCents: gross,
      sellerBps: 0,
    };
  }

  // Creator sale — plan of the seller workspace, determined at transaction time
  const workspace = await db.select().from(workspaces).where(eq(workspaces.id, order.workspaceId)).get();
  const plan = (workspace?.plan ?? 'FREE') as Plan;
  const split = creatorSplit(gross, plan, await freeCommissionBps());
  return {
    sellerAccount: 'CREATOR_PAYABLE',
    sellerUserId: workspace?.ownerId ?? null,
    sellerCents: split.sellerCents,
    platformCents: split.platformCents,
    sellerBps: plan === 'FREE' ? 10000 - await freeCommissionBps() : 10000,
  };
}

export interface FinalizeInput {
  provider: 'stripe' | 'test';
  reference?: string | null;
  raw?: unknown;
}

/**
 * Mark an order as paid, apply the split, write ledger entries, enroll
 * buyers, upsert CRM and fire automations. Idempotent: a PAID order is a no-op.
 * Called ONLY from the Stripe webhook, checkout success verification or the
 * explicit TEST MODE confirmation endpoint — always server-side.
 */
export async function finalizeOrderPaid(orderId: string, input: FinalizeInput): Promise<Order> {
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) throw new OrderError('Order not found');
  if (order.status === 'PAID') return order; // idempotent
  if (order.status !== 'PENDING') throw new OrderError(`Order not payable (status ${order.status})`);

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all();
  const split = await computeOrderSplit(order);

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status: 'PAID',
        paidAt: new Date(),
        paymentRef: input.reference ?? order.paymentRef,
        platformFeeCents: split.platformCents,
      })
      .where(eq(orders.id, orderId))
      .run();

    await tx
      .insert(payments)
      .values({
        orderId,
        provider: input.provider,
        reference: input.reference ?? null,
        amountCents: order.totalCents,
        status: 'SUCCEEDED',
        raw: input.raw ? JSON.stringify(input.raw).slice(0, 4000) : null,
      })
      .run();
  });

  // Ledger
  if (split.sellerAccount && split.sellerUserId) {
    await recordSale({
      orderId,
      workspaceId: order.workspaceId,
      mode: order.mode as 'LIVE' | 'TEST',
      currency: order.currency,
      sellerUserId: split.sellerUserId,
      sellerAccount: split.sellerAccount,
      sellerCents: split.sellerCents,
      platformCents: split.platformCents,
      description: `${order.number} sale`,
    });
  } else {
    await recordSale({
      orderId,
      workspaceId: order.workspaceId,
      mode: order.mode as 'LIVE' | 'TEST',
      currency: order.currency,
      sellerUserId: '',
      sellerAccount: 'CREATOR_PAYABLE',
      sellerCents: 0,
      platformCents: split.platformCents,
      description: `${order.number} direct sale`,
    });
  }

  // CRM upsert
  let contactId: string | null = order.contactId;
  try {
    const existing = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.workspaceId, order.workspaceId), eq(contacts.email, order.buyerEmail)))
      .get();
    if (existing) {
      contactId = existing.id;
      if (existing.status !== 'STUDENT') {
        await db.update(contacts)
          .set({ status: 'CUSTOMER', updatedAt: new Date() })
          .where(eq(contacts.id, existing.id))
          .run();
      }
    } else {
      const created = await db
        .insert(contacts)
        .values({
          workspaceId: order.workspaceId,
          email: order.buyerEmail,
          name: order.buyerName,
          status: 'CUSTOMER',
          source: 'purchase',
          userId: order.buyerUserId,
        })
        .returning({ id: contacts.id })
        .get();
      contactId = created.id;
    }
    if (contactId) {
      await db.insert(contactActivities)
        .values({
          contactId,
          type: 'purchase.completed',
          summary: `Purchased ${order.number} — ${(order.totalCents / 100).toFixed(2)} ${order.currency.toUpperCase()}`,
          meta: JSON.stringify({ orderId, totalCents: order.totalCents }),
        })
        .run();
      if (!order.contactId) {
        await db.update(orders).set({ contactId }).where(eq(orders.id, orderId)).run();
      }
    }
  } catch {
    // CRM must never break payment finalization
  }

  // Enrollments for course items + Academy activation
  const courseIds = items
    .filter((i) => i.kind === 'COURSE' || i.kind === 'ACADEMY')
    .map((i) => i.courseId)
    .filter(Boolean) as string[];
  if (order.buyerUserId && courseIds.length) {
    for (const courseId of courseIds) {
      const already = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.userId, order.buyerUserId), eq(enrollments.courseId, courseId)))
        .get();
      if (!already) {
        await db.insert(enrollments)
          .values({
            userId: order.buyerUserId,
            courseId,
            orderId,
            source:
              items.find((i) => i.courseId === courseId)?.kind === 'ACADEMY' ? 'ACADEMY' : 'PURCHASE',
          })
          .run();
      }
    }
    if (order.kind === 'ACADEMY_SALE') {
      await activateReseller(order.buyerUserId, orderId);
    }
  }

  // Affiliate commission
  if (order.affiliateCode) {
    try {
      const aff = await db.select().from(affiliates).where(eq(affiliates.code, order.affiliateCode)).get();
      if (aff) {
        const program = await db
          .select()
          .from(affiliatePrograms)
          .where(eq(affiliatePrograms.id, aff.programId))
          .get();
        const bps = program?.commissionBps ?? 0;
        const commissionCents = Math.floor((order.totalCents * bps) / 10000);
        await db.insert(affiliateSales)
          .values({
            affiliateId: aff.id,
            orderId,
            commissionBps: bps,
            commissionCents,
            status: 'APPROVED',
          })
          .onConflictDoNothing()
          .run();
        if (commissionCents > 0 && aff.userId) {
          await recordAffiliateCommission({
            orderId,
            workspaceId: order.workspaceId,
            mode: order.mode as 'LIVE' | 'TEST',
            affiliateUserId: aff.userId,
            commissionCents,
            description: `Affiliate commission ${bps / 100}% on ${order.number}`,
          });
        }
      }
    } catch {
      // affiliate attribution best-effort
    }
  }

  // Notification + automation event
  await notifyWorkspaceOwners(order.workspaceId, {
    type: 'sale',
    title: `New sale — ${order.number}`,
    body: `${order.buyerEmail} purchased for ${(order.totalCents / 100).toFixed(2)} ${order.currency.toUpperCase()}${
      order.platformFeeCents
        ? ` (Nuvra fee: ${(order.platformFeeCents / 100).toFixed(2)})`
        : ' (0 % platform fee)'
    }`,
    link: `/dashboard/payments?order=${order.id}`,
  });

  await emitEvent({
    name: 'purchase.completed',
    workspaceId: order.workspaceId,
    userId: order.buyerUserId,
    payload: {
      orderId,
      email: order.buyerEmail,
      name: order.buyerName ?? '',
      totalCents: order.totalCents,
      kind: order.kind,
      contactId,
    },
  });

  if (order.resellerId) {
    await emitEvent({
      name: 'reseller.sale',
      workspaceId: order.workspaceId,
      userId: order.buyerUserId,
      payload: { orderId, email: order.buyerEmail, totalCents: order.totalCents },
    });
  }

  await audit('order.paid', {
    actorUserId: order.buyerUserId,
    target: orderId,
    meta: { mode: order.mode, provider: input.provider },
  });

  return (await db.select().from(orders).where(eq(orders.id, orderId)).get())!;
}

/** Full or partial refund — recalculates and reverses the ledger split. */
export async function refundOrder(
  orderId: string,
  opts: { amountCents?: number; reason?: string; provider?: string; reference?: string } = {},
): Promise<Order> {
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) throw new OrderError('Order not found');
  if (order.status !== 'PAID' && order.status !== 'PARTIALLY_REFUNDED') {
    throw new OrderError(`Order not refundable (status ${order.status})`);
  }
  const alreadyRefunded = (await db
    .select()
    .from(refunds)
    .where(eq(refunds.orderId, orderId))
    .all())
    .reduce((s, r) => s + r.amountCents, 0);
  const refundCents = opts.amountCents ?? order.totalCents - alreadyRefunded;
  if (refundCents <= 0) throw new OrderError('Nothing to refund');
  if (refundCents > order.totalCents - alreadyRefunded) throw new OrderError('Refund exceeds captured amount');

  const split = await computeOrderSplit(order);
  // Reverse the exact proportions captured AT SALE TIME (order.platformFeeCents) —
  // a plan upgrade/downgrade between sale and refund must never change who bears
  // the refund, and the ledger stays reconstructable.
  const platformReversal =
    order.totalCents > 0 ? Math.floor((refundCents * order.platformFeeCents) / order.totalCents) : refundCents;
  const sellerReversal = refundCents - platformReversal;

  await db.insert(refunds)
    .values({
      orderId,
      amountCents: refundCents,
      reason: opts.reason ?? null,
      provider: opts.provider ?? 'test',
      reference: opts.reference ?? null,
      status: 'SUCCEEDED',
    })
    .run();

  await recordRefund({
    orderId,
    workspaceId: order.workspaceId,
    mode: order.mode as 'LIVE' | 'TEST',
    currency: order.currency,
    sellerUserId: split.sellerUserId ?? '',
    sellerAccount: split.sellerAccount ?? 'CREATOR_PAYABLE',
    refundCents,
    sellerReversalCents: split.sellerUserId ? sellerReversal : 0,
    platformReversalCents: split.sellerUserId ? platformReversal : refundCents,
    description: `Refund of ${order.number} (${(refundCents / 100).toFixed(2)})`,
  });

  const full = alreadyRefunded + refundCents >= order.totalCents;
  await db.update(orders)
    .set({
      status: full ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .run();

  if (full) {
    // Revoke course access granted by this order
    await db.delete(enrollments).where(eq(enrollments.orderId, orderId)).run();
    await db.update(affiliateSales).set({ status: 'REVERSED' }).where(eq(affiliateSales.orderId, orderId)).run();
  }

  await notifyWorkspaceOwners(order.workspaceId, {
    type: 'payment_error',
    title: `Refund processed — ${order.number}`,
    body: `${(refundCents / 100).toFixed(2)} ${order.currency.toUpperCase()} refunded${full ? ' (full)' : ' (partial)'}`,
    link: `/dashboard/payments?order=${order.id}`,
  });

  await audit('order.refunded', { target: orderId, meta: { refundCents, reason: opts.reason } });

  return (await db.select().from(orders).where(eq(orders.id, orderId)).get())!;
}

/** After an Academy purchase the buyer becomes an ACTIVE reseller. */
export async function activateReseller(userId: string, academyOrderId: string): Promise<void> {
  const existing = await db.select().from(resellerProfiles).where(eq(resellerProfiles.userId, userId)).get();
  if (existing) {
    if (existing.status !== 'ACTIVE') {
      await db.update(resellerProfiles)
        .set({ status: 'ACTIVE', activatedAt: new Date(), academyOrderId, updatedAt: new Date() })
        .where(eq(resellerProfiles.id, existing.id))
        .run();
    }
    return;
  }
  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  const base = (user?.name ?? 'reseller')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 10);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `nv-${base}-${randomUUID().slice(0, 6)}`;
    const row = await db
      .insert(resellerProfiles)
      .values({ userId, status: 'ACTIVE', code, activatedAt: new Date(), academyOrderId })
      .onConflictDoNothing()
      .returning({ id: resellerProfiles.id })
      .get();
    if (row) return;
  }
}
