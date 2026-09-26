'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { marketplaceListings, sessions, users } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { setConfig } from '@/lib/config';
import { markPayoutFailed, markPayoutPaid } from '@/lib/payouts';
import { refundOrder } from '@/lib/orders';
import { audit } from '@/lib/audit';
import { processDueEmails } from '@/lib/email';

export async function adminUpdateSettingAction(
  key: string,
  value: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireAdmin();
    await setConfig(key, value);
    await audit('admin.setting_updated', { actorUserId: ctx.user.id, target: key, meta: { value } });
    revalidatePath('/admin/settings');
    revalidatePath('/admin');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

const settingsSchema = z.object({
  academyPrice: z.number().int().min(0),
  proPrice: z.number().int().min(0),
  businessPrice: z.number().int().min(0),
  freeCommissionBps: z.number().int().min(0).max(10000),
  resellerBps: z.number().int().min(0).max(10000),
  payoutHoldDays: z.number().int().min(0).max(90),
  aiFreeCredits: z.number().int().min(0),
  aiProCredits: z.number().int().min(0),
});

export async function adminSaveBusinessSettingsAction(input: {
  academyPrice: number;
  proPrice: number;
  businessPrice: number;
  freeCommissionBps: number;
  resellerBps: number;
  payoutHoldDays: number;
  aiFreeCredits: number;
  aiProCredits: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireAdmin();
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Invalid values' };
    const v = parsed.data;
    await setConfig('academy.priceCents', v.academyPrice);
    await setConfig('pro.priceCents', v.proPrice);
    await setConfig('business.priceCents', v.businessPrice);
    await setConfig('commission.freeBps', v.freeCommissionBps);
    await setConfig('commission.resellerBps', v.resellerBps);
    await setConfig('payouts.holdDays', v.payoutHoldDays);
    await setConfig('ai.freeCredits', v.aiFreeCredits);
    await setConfig('ai.proCredits', v.aiProCredits);
    await audit('admin.business_settings', { actorUserId: ctx.user.id, meta: v });
    revalidatePath('/admin/settings');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function adminModerateListingAction(
  listingId: string,
  status: 'APPROVED' | 'REJECTED',
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireAdmin();
    await db.update(marketplaceListings)
      .set({ status, updatedAt: new Date() })
      .where(eq(marketplaceListings.id, listingId))
      .run();
    await audit('admin.listing_moderated', { actorUserId: ctx.user.id, target: listingId, meta: { status } });
    revalidatePath('/admin/marketplace');
    revalidatePath('/marketplace');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function adminPayoutAction(
  payoutId: string,
  action: 'paid' | 'failed',
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireAdmin();
    if (action === 'paid') await markPayoutPaid(payoutId);
    else await markPayoutFailed(payoutId, 'admin rejected');
    await audit(`admin.payout_${action}`, { actorUserId: ctx.user.id, target: payoutId });
    revalidatePath('/admin/payouts');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function adminRefundAction(
  orderId: string,
  reason?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireAdmin();
    await refundOrder(orderId, { reason: reason ?? 'admin refund' });
    await audit('admin.refund', { actorUserId: ctx.user.id, target: orderId });
    revalidatePath('/admin/orders');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function adminToggleUserAction(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED',
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireAdmin();
    if (userId === ctx.user.id) return { ok: false, error: 'You cannot suspend yourself' };
    await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId)).run();
    if (status === 'SUSPENDED') await db.delete(sessions).where(eq(sessions.userId, userId)).run();
    await audit('admin.user_status', { actorUserId: ctx.user.id, target: userId, meta: { status } });
    revalidatePath('/admin/users');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function adminRunEmailQueueAction(): Promise<{ ok: true; processed: number } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const res = await processDueEmails();
    revalidatePath('/admin/emails');
    return { ok: true, processed: res.processed };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
