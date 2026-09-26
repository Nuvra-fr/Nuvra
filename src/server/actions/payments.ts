'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, workspaces } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { refundOrder, OrderError } from '@/lib/orders';
import { requestPayout, availableBalance, grossBalance } from '@/lib/payouts';
import type { LedgerAccount } from '@/lib/constants';
import { audit } from '@/lib/audit';

export async function refundOrderAction(
  orderId: string,
  reason?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) return { ok: false, error: 'Order not found' };
    // Only the seller workspace owner or an admin can refund
    const seller = await db.select().from(workspaces).where(eq(workspaces.id, order.workspaceId)).get();
    if (!seller) return { ok: false, error: 'Seller not found' };
    const isSellerOwner = ctx.membership.workspaceId === order.workspaceId;
    if (!isSellerOwner && ctx.user.role !== 'ADMIN') {
      return { ok: false, error: 'Not authorized to refund this order' };
    }
    await refundOrder(orderId, { reason: reason ?? 'manual refund' });
    await audit('order.refund_requested', { actorUserId: ctx.user.id, target: orderId });
    revalidatePath('/dashboard/payments');
    revalidatePath('/admin/orders');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof OrderError ? e.message : 'Refund failed' };
  }
}

export async function requestPayoutAction(
  account: LedgerAccount,
  mode: 'LIVE' | 'TEST',
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    await requestPayout(ctx.user.id, account, mode);
    revalidatePath('/dashboard/payments');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Payout request failed' };
  }
}

export async function payoutSnapshot() {
  const ctx = await requireUser();
  const accounts: LedgerAccount[] = ['CREATOR_PAYABLE', 'RESELLER_PAYABLE', 'AFFILIATE_PAYABLE'];
  return accounts.map((a) => ({
    account: a,
    gross: grossBalance(ctx.user.id, a),
    available: availableBalance(ctx.user.id, a),
  }));
}
