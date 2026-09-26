'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { profiles, workspaces } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { audit } from '@/lib/audit';

export async function saveOnboardingStep(input: {
  step: number;
  name?: string;
  goal?: string;
  activity?: string;
  workspaceName?: string;
  username?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireUser();

  const updates: Partial<typeof profiles.$inferInsert> = {};
  if (typeof input.step === 'number') updates.onboardingStep = Math.max(0, Math.min(5, input.step));
  if (input.goal) updates.goal = input.goal;
  if (input.activity) {
    // stored alongside goal as a free-form activity tag
    updates.bio = input.activity.slice(0, 280);
  }
  if (input.username) {
    const clean = input.username.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
    if (clean.length >= 3) {
      const existing = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.username, clean))
        .get();
      if (!existing || existing.id === ctx.profile?.id) updates.username = clean;
    }
  }

  if (Object.keys(updates).length > 0) {
    if (ctx.profile) {
      await db.update(profiles).set(updates).where(eq(profiles.id, ctx.profile.id)).run();
    } else {
      await db.insert(profiles)
        .values({ userId: ctx.user.id, username: updates.username ?? 'creator', ...updates })
        .run();
    }
  }

  if (input.workspaceName && input.workspaceName.trim().length >= 2) {
    await db.update(workspaces)
      .set({ name: input.workspaceName.trim().slice(0, 60), updatedAt: new Date() })
      .where(eq(workspaces.id, ctx.workspace.id))
      .run();
  }

  await audit('onboarding.step', { actorUserId: ctx.user.id, target: String(input.step) });
  revalidatePath('/onboarding');
  revalidatePath('/dashboard');
  return { ok: true };
}
