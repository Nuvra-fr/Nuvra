'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { courses, orders, products, resellerProfiles, workspaces } from '@/db/schema';
import { requireUser, getSession } from '@/lib/auth';
import { createOrder, finalizeOrderPaid, OrderError } from '@/lib/orders';
import { paymentsMode, createPaymentCheckoutSession } from '@/lib/stripe';
import { academyPriceCents, getConfig } from '@/lib/config';
import { appUrl } from '@/lib/utils';
import { audit } from '@/lib/audit';
const checkoutSchema = z.object({
  item: z.string().min(3), // course:{id} | product:{id} | academy
  name: z.string().max(120).optional(),
  coupon: z.string().max(40).optional(),
  reseller: z.string().max(64).optional(),
  aff: z.string().max(64).optional(),
});

export interface CheckoutItemInfo {
  kind: 'course' | 'product' | 'academy';
  id: string | null;
  title: string;
  priceCents: number;
  workspaceId: string;
  requiresAccount: boolean;
}

/** Server-side resolution of what is being bought (never trust client prices). */
export async function resolveCheckoutItem(item: string): Promise<CheckoutItemInfo | null> {
  if (item === 'academy') {
    const platform =
      db.select().from(workspaces).where(eq(workspaces.isPlatform, true)).get() ??
      db.select().from(workspaces).where(eq(workspaces.slug, 'nuvra')).get();
    const academyCourse = db
      .select()
      .from(courses)
      .where(and(eq(courses.isAcademy, true), eq(courses.status, 'PUBLISHED')))
      .get();
    if (!platform) return null;
    return {
      kind: 'academy',
      id: academyCourse?.id ?? null,
      title: (getConfig<string>('academy.name') as string) || 'Nuvra Academy',
      priceCents: academyPriceCents(),
      workspaceId: platform.id,
      requiresAccount: true,
    };
  }
  const [type, id] = item.split(':');
  if (!type || !id) return null;
  if (type === 'course') {
    const c = db.select().from(courses).where(eq(courses.id, id)).get();
    if (!c || c.status === 'ARCHIVED') return null;
    return {
      kind: 'course',
      id: c.id,
      title: c.title,
      priceCents: c.priceCents,
      workspaceId: c.workspaceId,
      requiresAccount: true,
    };
  }
  if (type === 'product') {
    const p = db.select().from(products).where(eq(products.id, id)).get();
    if (!p || p.status === 'ARCHIVED') return null;
    return {
      kind: 'product',
      id: p.id,
      title: p.name,
      priceCents: p.priceCents,
      workspaceId: p.workspaceId,
      requiresAccount: false,
    };
  }
  return null;
}

export async function startCheckoutAction(input: {
  item: string;
  name?: string;
  email?: string;
  coupon?: string;
  reseller?: string;
  aff?: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Invalid checkout request' };

    const item = await resolveCheckoutItem(parsed.data.item);
    if (!item) return { ok: false, error: 'Item not found or no longer available' };

    const ctx = await getSession();
    if (item.requiresAccount && !ctx) {
      return {
        ok: false,
        error: `Please sign in to purchase ${item.title}.`,
      };
    }

    // Reseller attribution for Academy — URL param first, then ?ref= cookies
    const jar = await cookies();
    const cookieRef = jar.get('nuvra_ref')?.value ?? null;
    const cookieReseller = jar.get('nuvra_reseller')?.value ?? null;
    const cookieAff = jar.get('nuvra_aff')?.value ?? null;

    let resellerId: string | null = null;
    if (item.kind === 'academy') {
      const candidates = [parsed.data.reseller, cookieReseller, cookieRef].filter(
        (c): c is string => !!c,
      );
      for (const code of candidates) {
        const rp = db
          .select()
          .from(resellerProfiles)
          .where(eq(resellerProfiles.code, code))
          .get();
        // ACTIVE resellers only, and never attribute a reseller's own purchase to themselves
        if (rp && rp.status === 'ACTIVE' && rp.userId !== ctx?.user.id) {
          resellerId = rp.id;
          break;
        }
      }
    }

    const affCode = parsed.data.aff || cookieAff || cookieRef || null;

    // Free item → instant enroll/order at 0 €
    const mode = paymentsMode();
    const order = createOrder({
      workspaceId: item.workspaceId,
      kind: item.kind === 'academy' ? 'ACADEMY_SALE' : 'CREATOR_SALE',
      items: [
        {
          kind: item.kind === 'academy' ? 'ACADEMY' : item.kind === 'course' ? 'COURSE' : 'PRODUCT',
          courseId: item.kind === 'course' || item.kind === 'academy' ? item.id : null,
          productId: item.kind === 'product' ? item.id : null,
          title: item.title,
          priceCents: item.priceCents,
        },
      ],
      buyerEmail: ctx?.user.email ?? String(input.email ?? '').toLowerCase().trim(),
      buyerName: input.name || ctx?.user.name || null,
      buyerUserId: ctx?.user.id ?? null,
      couponCode: parsed.data.coupon || null,
      resellerId,
      affiliateCode: affCode,
      mode: mode === 'stripe' ? 'LIVE' : 'TEST',
    });

    if (order.totalCents === 0) {
      finalizeOrderPaid(order.id, { provider: 'test', reference: 'zero-amount' });
      redirect(`/checkout/success?order=${order.id}`);
    }

    if (mode === 'stripe') {
      const url = await createPaymentCheckoutSession({
        orderId: order.id,
        amountCents: order.totalCents,
        currency: order.currency,
        customerEmail: order.buyerEmail,
        successUrl: appUrl(`/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`),
        cancelUrl: appUrl(`/checkout?item=${encodeURIComponent(parsed.data.item)}&canceled=1`),
        metadata: { kind: item.kind },
      });
      redirect(url.url);
    }

    // TEST MODE — clearly labeled confirmation step, no real money
    redirect(`/checkout/test/${order.id}`);
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e; // next redirect
    if (e instanceof OrderError) return { ok: false, error: e.message };
    return { ok: false, error: e instanceof Error ? e.message : 'Checkout failed' };
  }
}

/** Explicit TEST MODE confirmation — labeled as test everywhere. */
export async function confirmTestPurchaseAction(orderId: string): Promise<void> {
  if (paymentsMode() === 'stripe') throw new Error('Test mode disabled while Stripe is configured');
  const ctx = await getSession();
  const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) throw new Error('Order not found');
  if (order.mode !== 'TEST') throw new Error('Not a test order');
  if (order.status === 'PAID') {
    redirect(`/checkout/success?order=${orderId}`);
    return;
  }
  finalizeOrderPaid(orderId, { provider: 'test', reference: `test_${orderId.slice(0, 8)}` });
  audit('checkout.test_confirmed', { actorUserId: ctx?.user.id ?? null, target: orderId });
  redirect(`/checkout/success?order=${orderId}`);
}

/** Free course enrollment (price = 0) without going through checkout UI. */
export async function enrollFreeAction(
  courseId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const course = db.select().from(courses).where(eq(courses.id, courseId)).get();
    if (!course || course.status !== 'PUBLISHED') return { ok: false, error: 'Course unavailable' };
    if (course.priceCents > 0) return { ok: false, error: 'This course is not free' };
    const { enrollments } = await import('@/db/schema');
    const existing = db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, ctx.user.id), eq(enrollments.courseId, courseId)))
      .get();
    if (existing) return { ok: true };
    db.insert(enrollments)
      .values({ userId: ctx.user.id, courseId, source: 'FREE' })
      .run();
    revalidatePath(`/dashboard/learn/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
