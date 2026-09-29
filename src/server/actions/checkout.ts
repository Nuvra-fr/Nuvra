'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  courses,
  orderItems,
  orders,
  products,
  resellerProfiles,
  workspaces,
} from '@/db/schema';
import { getSession } from '@/lib/auth';
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
export async function resolveCheckoutItem(
  item: string,
): Promise<CheckoutItemInfo | null> {
  if (item === 'academy') {
    const platform =
      (await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.isPlatform, true))
        .get()) ??
      (await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, 'nuvra'))
        .get());
    const academyCourse = await db
      .select()
      .from(courses)
      .where(and(eq(courses.isAcademy, true), eq(courses.status, 'PUBLISHED')))
      .get();
    if (!platform) return null;
    return {
      kind: 'academy',
      id: academyCourse?.id ?? null,
      title: (await getConfig<string>('academy.name')) || 'Nuvra Academy',
      priceCents: await academyPriceCents(),
      workspaceId: platform.id,
      requiresAccount: true,
    };
  }
  const [type, id] = item.split(':');
  if (!type || !id) return null;
  if (type === 'course') {
    const c = await db.select().from(courses).where(eq(courses.id, id)).get();
    // Only PUBLISHED items are sellable: DRAFT/REVIEW/ARCHIVED are not for sale.
    if (!c || c.status !== 'PUBLISHED') return null;
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
    const p = await db.select().from(products).where(eq(products.id, id)).get();
    if (!p || p.status !== 'PUBLISHED') return null;
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
    if (!parsed.success)
      return { ok: false, error: 'Demande de paiement invalide' };

    const item = await resolveCheckoutItem(parsed.data.item);
    if (!item)
      return { ok: false, error: 'Article introuvable ou plus disponible' };

    const ctx = await getSession();
    if (item.requiresAccount && !ctx) {
      return {
        ok: false,
        error: `Connectez-vous pour acheter ${item.title}.`,
      };
    }

    // Reseller attribution for Academy — URL param first, then ?ref= cookies
    const jar = await cookies();
    const cookieRef = jar.get('nuvra_ref')?.value ?? null;
    const cookieReseller = jar.get('nuvra_reseller')?.value ?? null;
    const cookieAff = jar.get('nuvra_aff')?.value ?? null;

    let resellerId: string | null = null;
    if (item.kind === 'academy') {
      const candidates = [
        parsed.data.reseller,
        cookieReseller,
        cookieRef,
      ].filter((c): c is string => !!c);
      for (const code of candidates) {
        const rp = await db
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
    const order = await createOrder({
      workspaceId: item.workspaceId,
      kind: item.kind === 'academy' ? 'ACADEMY_SALE' : 'CREATOR_SALE',
      items: [
        {
          kind:
            item.kind === 'academy'
              ? 'ACADEMY'
              : item.kind === 'course'
                ? 'COURSE'
                : 'PRODUCT',
          courseId:
            item.kind === 'course' || item.kind === 'academy' ? item.id : null,
          productId: item.kind === 'product' ? item.id : null,
          title: item.title,
          priceCents: item.priceCents,
        },
      ],
      buyerEmail:
        ctx?.user.email ??
        String(input.email ?? '')
          .toLowerCase()
          .trim(),
      buyerName: input.name || ctx?.user.name || null,
      buyerUserId: ctx?.user.id ?? null,
      couponCode: parsed.data.coupon || null,
      resellerId,
      affiliateCode: affCode,
      mode: mode === 'stripe' ? 'LIVE' : 'TEST',
    });

    if (order.totalCents === 0) {
      await finalizeOrderPaid(order.id, {
        provider: 'test',
        reference: 'zero-amount',
      });
      redirect(`/checkout/success?order=${order.id}`);
    }

    if (mode === 'stripe') {
      const url = await createPaymentCheckoutSession({
        orderId: order.id,
        amountCents: order.totalCents,
        currency: order.currency,
        customerEmail: order.buyerEmail,
        successUrl: appUrl(
          `/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        ),
        cancelUrl: appUrl(
          `/checkout?item=${encodeURIComponent(parsed.data.item)}&canceled=1`,
        ),
        metadata: { kind: item.kind },
      });
      redirect(url.url);
    }

    // TEST MODE — clearly labeled confirmation step, no real money
    redirect(`/checkout/test/${order.id}`);
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e; // next redirect
    if (e instanceof OrderError) return { ok: false, error: e.message };
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Paiement impossible',
    };
  }
}

/** Explicit TEST MODE confirmation — labeled as test everywhere. */
export async function confirmTestPurchaseAction(
  orderId: string,
): Promise<void> {
  if (paymentsMode() === 'stripe')
    throw new Error('Mode test désactivé tant que Stripe est configuré');
  const ctx = await getSession();
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .get();
  if (!order) throw new Error('Commande introuvable');
  if (order.mode !== 'TEST') throw new Error('Not a test order');

  // Authorization: the order id is not a credential. Course/Academy access is
  // account-bound, so only the buyer may confirm such an order; guest product
  // orders (no account required) stay confirmable by whoever holds the link.
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .all();
  const requiresAccount =
    order.kind === 'ACADEMY_SALE' ||
    items.some((i) => i.kind === 'COURSE' || i.kind === 'ACADEMY');
  if (order.buyerUserId && order.buyerUserId !== ctx?.user.id) {
    throw new Error('Cette commande appartient à un autre compte');
  }
  if (requiresAccount && !order.buyerUserId) {
    throw new Error(
      'Connectez-vous avec le compte utilisé pour cette commande afin de la confirmer',
    );
  }

  if (order.status === 'PAID') {
    redirect(`/checkout/success?order=${orderId}`);
    return;
  }
  await finalizeOrderPaid(orderId, {
    provider: 'test',
    reference: `test_${orderId.slice(0, 8)}`,
  });
  await audit('checkout.test_confirmed', {
    actorUserId: ctx?.user.id ?? null,
    target: orderId,
  });
  redirect(`/checkout/success?order=${orderId}`);
}

/** Free course enrollment (price = 0) without going through checkout UI. */
export async function enrollFreeAction(
  courseId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await getSession();
  if (!ctx)
    return {
      ok: false,
      error: 'Connectez-vous pour vous inscrire à cette formation.',
    };
  try {
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .get();
    if (!course || course.status !== 'PUBLISHED')
      return { ok: false, error: 'Formation indisponible' };
    if (course.priceCents > 0)
      return { ok: false, error: 'Cette formation n’est pas gratuite' };
    const { enrollments } = await import('@/db/schema');
    const existing = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, ctx.user.id),
          eq(enrollments.courseId, courseId),
        ),
      )
      .get();
    if (existing) return { ok: true };
    await db
      .insert(enrollments)
      .values({ userId: ctx.user.id, courseId, source: 'FREE' })
      .run();
    revalidatePath(`/dashboard/learn/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Échec' };
  }
}
