import { desc, eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  automationActions,
  automationRuns,
  automations,
  contactActivities,
  contacts,
  domainEvents,
  emailSequenceSteps,
  emailSequences,
  notifications,
} from '@/db/schema';
import { sendEmail, scheduleEmail } from '@/lib/email';
import { safeJson } from '@/lib/utils';
import type { AutomationActionType, AutomationTrigger } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────
// Domain events → automations + email sequences.
// emitEvent() is the single funnel through which business activity
// becomes automated revenue/retention mechanics.
// ─────────────────────────────────────────────────────────────

export interface EventInput {
  name: AutomationTrigger | string;
  workspaceId?: string | null;
  userId?: string | null;
  payload?: Record<string, unknown>;
}

export interface EmitResult {
  eventId: string;
  automationsRun: number;
  sequencesTriggered: number;
}

interface Ctx {
  email?: string;
  name?: string;
  [k: string]: unknown;
}

export interface RunActionsResult {
  ran: number;
  error?: string;
  waited?: boolean;
}

async function runActions(
  automationId: string,
  ctx: Ctx,
  runId: string,
  startIndex = 0,
): Promise<RunActionsResult> {
  const actions = db
    .select()
    .from(automationActions)
    .where(eq(automationActions.automationId, automationId))
    .orderBy(automationActions.position)
    .all();
  let ran = 0;
  for (let i = startIndex; i < actions.length; i++) {
    const action = actions[i]!;
    const config = safeJson<Record<string, unknown>>(action.config, {});
    try {
      switch (action.type as AutomationActionType) {
        case 'send_email': {
          if (ctx.email) {
            await sendEmail({
              to: ctx.email,
              subject: String(config.subject ?? 'Message from Nuvra'),
              body: String(config.body ?? ''),
              workspaceId: null,
              relatedTo: `automation:${automationId}`,
            });
          }
          break;
        }
        case 'send_notification': {
          if (ctx.userId) {
            db.insert(notifications)
              .values({
                userId: String(ctx.userId),
                workspaceId: null,
                type: String(config.type ?? 'system'),
                title: String(config.title ?? 'Notification'),
                body: config.body ? String(config.body) : null,
                link: config.link ? String(config.link) : null,
              })
              .run();
          }
          break;
        }
        case 'add_tag':
        case 'remove_tag': {
          if (ctx.contactId) {
            const c = db.select().from(contacts).where(eq(contacts.id, String(ctx.contactId))).get();
            if (c) {
              const tags = safeJson<string[]>(c.tags, []);
              const tag = String(config.tag ?? '');
              if (!tag) break;
              const next =
                action.type === 'add_tag'
                  ? Array.from(new Set([...tags, tag]))
                  : tags.filter((t) => t !== tag);
              db.update(contacts).set({ tags: JSON.stringify(next) }).where(eq(contacts.id, c.id)).run();
            }
          }
          break;
        }
        case 'enroll_course': {
          // handled by purchase flow; generic action marks intent in run log
          break;
        }
        case 'wait': {
          // Pause the run; remaining actions resume via processWaitingRuns()
          const hours = Number(config.hours ?? 24);
          db.update(automationRuns)
            .set({
              status: 'WAITING',
              context: JSON.stringify({
                ...ctx,
                resumeAt: new Date(Date.now() + hours * 3600_000).toISOString(),
                startIdx: i + 1,
                automationId,
              }),
            })
            .where(eq(automationRuns.id, runId))
            .run();
          return { ran, waited: true };
        }
        case 'webhook': {
          if (config.url) {
            await fetch(String(config.url), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(ctx),
            }).catch(() => undefined);
          }
          break;
        }
        case 'create_task': {
          if (ctx.contactId) {
            db.insert(contactActivities)
              .values({
                contactId: String(ctx.contactId),
                type: 'task',
                summary: String(config.title ?? 'Task'),
                meta: JSON.stringify(config),
              })
              .run();
          }
          break;
        }
      }
      ran++;
    } catch (e) {
      return { ran, error: String(e) };
    }
  }
  return { ran };
}

export async function emitEvent(input: EventInput): Promise<EmitResult> {
  const payload = input.payload ?? {};
  const evt = db
    .insert(domainEvents)
    .values({
      name: input.name,
      workspaceId: input.workspaceId ?? null,
      userId: input.userId ?? null,
      payload: JSON.stringify(payload),
    })
    .returning({ id: domainEvents.id })
    .get();

  let automationsRun = 0;
  let sequencesTriggered = 0;

  const ctx: Ctx = { ...payload };

  // 1 — Active automations matching this trigger
  if (input.workspaceId) {
    const autos = db
      .select()
      .from(automations)
      .where(
        and(eq(automations.workspaceId, input.workspaceId), eq(automations.active, true)),
      )
      .all()
      .filter((a) => a.triggerEvent === input.name);

    for (const a of autos) {
      const run = db
        .insert(automationRuns)
        .values({ automationId: a.id, status: 'RUNNING', context: JSON.stringify(ctx) })
        .returning({ id: automationRuns.id })
        .get();
      const res = await runActions(a.id, ctx, run.id);
      if (!res.waited) {
        db.update(automationRuns)
          .set({
            status: res.error ? 'FAILED' : 'COMPLETED',
            error: res.error ?? null,
            context: JSON.stringify(ctx),
          })
          .where(eq(automationRuns.id, run.id))
          .run();
      }
      db.update(automations)
        .set({ runCount: a.runCount + 1 })
        .where(eq(automations.id, a.id))
        .run();
      automationsRun++;
    }

    // 2 — Active email sequences with this trigger
    const seqs = db
      .select()
      .from(emailSequences)
      .where(
        and(eq(emailSequences.workspaceId, input.workspaceId), eq(emailSequences.active, true)),
      )
      .all()
      .filter((s) => s.triggerEvent === input.name);

    for (const s of seqs) {
      const steps = db
        .select()
        .from(emailSequenceSteps)
        .where(eq(emailSequenceSteps.sequenceId, s.id))
        .orderBy(emailSequenceSteps.position)
        .all();
      const to = ctx.email ?? payload.email;
      if (!to) continue;
      for (const step of steps) {
        const runAt = new Date(Date.now() + step.delayHours * 3600_000);
        if (step.delayHours <= 0) {
          await sendEmail({
            to: String(to),
            subject: step.subject,
            body: step.body,
            workspaceId: s.workspaceId,
            relatedTo: `sequence:${s.id}`,
          });
        } else {
          scheduleEmail({
            to: String(to),
            subject: step.subject,
            body: step.body,
            workspaceId: s.workspaceId,
            relatedTo: `sequence:${s.id}`,
            runAt,
          });
        }
      }
      sequencesTriggered++;
    }
  }

  db.update(domainEvents).set({ processedAt: new Date() }).where(eq(domainEvents.id, evt.id)).run();

  return { eventId: evt.id, automationsRun, sequencesTriggered };
}

/** Resume automations paused by a `wait` action. Safe to call repeatedly. */
export async function processWaitingRuns(): Promise<number> {
  const waiting = db
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.status, 'WAITING'))
    .all();
  let resumed = 0;
  for (const run of waiting) {
    const ctx = safeJson<{
      resumeAt?: string;
      automationId?: string;
      startIdx?: number;
    }>(run.context, {});
    if (!ctx.resumeAt || new Date(ctx.resumeAt).getTime() > Date.now()) continue;
    if (!ctx.automationId) continue;
    db.update(automationRuns).set({ status: 'RUNNING' }).where(eq(automationRuns.id, run.id)).run();
    const res = await runActions(ctx.automationId, ctx, run.id, ctx.startIdx ?? 0);
    db.update(automationRuns)
      .set({
        status: res.waited ? 'WAITING' : res.error ? 'FAILED' : 'COMPLETED',
        error: res.error ?? null,
      })
      .where(eq(automationRuns.id, run.id))
      .run();
    resumed++;
  }
  return resumed;
}

export function listEvents(workspaceId?: string, limit = 50) {
  return db
    .select()
    .from(domainEvents)
    .where(workspaceId ? eq(domainEvents.workspaceId, workspaceId) : undefined)
    .orderBy(desc(domainEvents.createdAt))
    .limit(limit)
    .all();
}
