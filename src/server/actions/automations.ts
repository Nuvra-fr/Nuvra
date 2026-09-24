'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  automations,
  automationActions,
  emailSequences,
  emailSequenceSteps,
} from '@/db/schema';
import { requireUser, type AuthContext } from '@/lib/auth';
import { AUTOMATION_TRIGGERS, type AutomationActionType, type AutomationTrigger } from '@/lib/constants';
import { audit } from '@/lib/audit';

function ownedAutomation(ctx: AuthContext, id: string) {
  const a = db.select().from(automations).where(eq(automations.id, id)).get();
  if (!a) throw new Error('Automation not found');
  if (a.workspaceId !== ctx.workspace.id) throw new Error('Not authorized');
  return a;
}

export async function createAutomationAction(input: {
  name: string;
  triggerEvent: string;
  actions?: { type: AutomationActionType; config: Record<string, unknown> }[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    if (!AUTOMATION_TRIGGERS.includes(input.triggerEvent as AutomationTrigger)) {
      return { ok: false, error: 'Unknown trigger' };
    }
    const auto = db
      .insert(automations)
      .values({
        workspaceId: ctx.workspace.id,
        name: input.name.trim().slice(0, 120) || 'My automation',
        triggerEvent: input.triggerEvent,
        active: false,
      })
      .returning({ id: automations.id })
      .get();
    const acts = input.actions?.length
      ? input.actions
      : [
          {
            type: 'send_email' as AutomationActionType,
            config: {
              subject: 'Welcome!',
              body: 'Thanks for joining — here is what to do next.',
            },
          },
        ];
    acts.forEach((a, i) => {
      db.insert(automationActions)
        .values({ automationId: auto.id, type: a.type, config: JSON.stringify(a.config), position: i })
        .run();
    });
    audit('automation.created', { actorUserId: ctx.user.id, target: auto.id });
    revalidatePath('/dashboard/automations');
    return { ok: true, id: auto.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function updateAutomationAction(
  id: string,
  input: Partial<{
    name: string;
    active: boolean;
    actions: { type: AutomationActionType; config: Record<string, unknown> }[];
  }>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedAutomation(ctx, id);
    const updates: Partial<typeof automations.$inferInsert> = { updatedAt: new Date() };
    if (input.name !== undefined) updates.name = input.name.slice(0, 120);
    if (input.active !== undefined) updates.active = input.active;
    db.update(automations).set(updates).where(eq(automations.id, id)).run();
    if (input.actions) {
      db.delete(automationActions).where(eq(automationActions.automationId, id)).run();
      input.actions.forEach((a, i) => {
        db.insert(automationActions)
          .values({ automationId: id, type: a.type, config: JSON.stringify(a.config), position: i })
          .run();
      });
    }
    revalidatePath('/dashboard/automations');
    revalidatePath(`/dashboard/automations/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteAutomationAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedAutomation(ctx, id);
    db.delete(automations).where(eq(automations.id, id)).run();
    revalidatePath('/dashboard/automations');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

// ── Email sequences ────────────────────────────────────

export async function createSequenceAction(input: {
  name: string;
  triggerEvent: string;
  steps: { delayHours: number; subject: string; body: string }[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const seq = db
      .insert(emailSequences)
      .values({
        workspaceId: ctx.workspace.id,
        name: input.name.trim().slice(0, 120) || 'Sequence',
        triggerEvent: input.triggerEvent,
        active: false,
      })
      .returning({ id: emailSequences.id })
      .get();
    input.steps.forEach((s, i) => {
      db.insert(emailSequenceSteps)
        .values({
          sequenceId: seq.id,
          delayHours: Math.max(0, Math.round(s.delayHours)),
          subject: s.subject.slice(0, 200),
          body: s.body,
          position: i,
        })
        .run();
    });
    revalidatePath('/dashboard/emails');
    return { ok: true, id: seq.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function toggleSequenceAction(
  id: string,
  active: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const seq = db.select().from(emailSequences).where(eq(emailSequences.id, id)).get();
    if (!seq || seq.workspaceId !== ctx.workspace.id) return { ok: false, error: 'Not found' };
    db.update(emailSequences).set({ active, updatedAt: new Date() }).where(eq(emailSequences.id, id)).run();
    revalidatePath('/dashboard/emails');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteSequenceAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const seq = db.select().from(emailSequences).where(eq(emailSequences.id, id)).get();
    if (!seq || seq.workspaceId !== ctx.workspace.id) return { ok: false, error: 'Not found' };
    db.delete(emailSequences).where(eq(emailSequences.id, id)).run();
    revalidatePath('/dashboard/emails');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
