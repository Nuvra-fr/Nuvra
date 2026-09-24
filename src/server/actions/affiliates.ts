'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { affiliates, affiliatePrograms } from '@/db/schema';
import { requireUser, type AuthContext } from '@/lib/auth';
import { randomCode } from '@/lib/utils';
import { audit } from '@/lib/audit';

function ownedProgram(ctx: AuthContext, id: string) {
  const p = db.select().from(affiliatePrograms).where(eq(affiliatePrograms.id, id)).get();
  if (!p) throw new Error('Program not found');
  if (p.workspaceId !== ctx.workspace.id) throw new Error('Not authorized');
  return p;
}

export async function createAffiliateProgramAction(input: {
  name: string;
  commissionBps: number;
  cookieDays?: number;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    if (!input.name.trim()) return { ok: false, error: 'Name required' };
    const bps = Math.min(9000, Math.max(100, Math.round(input.commissionBps || 3000)));
    const created = db
      .insert(affiliatePrograms)
      .values({
        workspaceId: ctx.workspace.id,
        name: input.name.trim().slice(0, 120),
        commissionBps: bps,
        cookieDays: input.cookieDays ?? 30,
        active: true,
      })
      .returning({ id: affiliatePrograms.id })
      .get();
    audit('affiliate_program.created', { actorUserId: ctx.user.id, target: created.id });
    revalidatePath('/dashboard/affiliates');
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function addAffiliateAction(
  programId: string,
  input: { name?: string; email?: string },
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedProgram(ctx, programId);
    const code = `${randomCode(7)}`;
    db.insert(affiliates)
      .values({
        programId,
        code,
        name: input.name ?? null,
        email: input.email ?? null,
        userId: ctx.user.id,
      })
      .run();
    revalidatePath('/dashboard/affiliates');
    return { ok: true, code };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function toggleAffiliateProgramAction(
  id: string,
  active: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedProgram(ctx, id);
    db.update(affiliatePrograms).set({ active }).where(eq(affiliatePrograms.id, id)).run();
    revalidatePath('/dashboard/affiliates');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
