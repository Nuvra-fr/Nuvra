'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { activatePlan, cancelPlan, ensurePlans } from '@/lib/billing';
import { paymentsMode, createSubscriptionCheckoutSession } from '@/lib/stripe';
import { proPriceCents, getConfig } from '@/lib/config';
import { appUrl } from '@/lib/utils';
import { audit } from '@/lib/audit';

/**
 * Upgrade to a paid plan.
 *  • TEST MODE (no Stripe keys): activates the plan locally, clearly labeled TEST.
 *  • STRIPE MODE: creates a Stripe Checkout subscription session and redirects.
 */
export async function upgradePlanAction(planCode: 'PRO' | 'BUSINESS' | 'AGENCY'): Promise<void> {
  const ctx = await requireUser();
  await ensurePlans();

  const priceKey = planCode === 'PRO' ? 'pro.priceCents' : planCode === 'BUSINESS' ? 'business.priceCents' : 'business.priceCents';
  const amount = Number(await getConfig<number>(priceKey) ?? await proPriceCents());

  if (paymentsMode() === 'stripe') {
    const session = await createSubscriptionCheckoutSession({
      workspaceId: ctx.workspace.id,
      planCode,
      amountCents: amount,
      currency: 'usd',
      customerEmail: ctx.user.email,
      successUrl: appUrl('/dashboard/settings/billing?upgraded=1'),
      cancelUrl: appUrl('/dashboard/settings/billing?canceled=1'),
    });
    redirect(session.url);
  }

  // TEST MODE activation
  await activatePlan(ctx.workspace.id, planCode);
  await audit('plan.upgraded', { actorUserId: ctx.user.id, target: ctx.workspace.id, meta: { planCode, mode: 'TEST' } });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings/billing');
  redirect('/dashboard/settings/billing?upgraded=1');
}

export async function cancelPlanAction(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    await cancelPlan(ctx.workspace.id);
    await audit('plan.canceled', { actorUserId: ctx.user.id, target: ctx.workspace.id });
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings/billing');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
