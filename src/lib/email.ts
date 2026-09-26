import { db } from '@/lib/db';
import { emailLogs } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────
// Email layer. Every message Nuvra "sends" is recorded in the outbox
// (email_logs) — this is a real, inspectable delivery pipeline:
//  • RESEND_API_KEY configured → message actually delivered (channel=RESEND)
//  • no provider → message stays in OUTBOX (clearly marked as not delivered),
//    visible in Admin → Emails.
// ─────────────────────────────────────────────────────────────

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  workspaceId?: string | null;
  relatedTo?: string | null;
}

function resendKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

export function emailProvider(): 'RESEND' | 'OUTBOX' {
  return resendKey() ? 'RESEND' : 'OUTBOX';
}

export async function deliverLog(logId: string): Promise<'SENT' | 'FAILED' | 'QUEUED'> {
  const log = await db.select().from(emailLogs).where(eq(emailLogs.id, logId)).get();
  if (!log) return 'FAILED';
  const key = resendKey();
  if (!key) {
    await db.update(emailLogs).set({ status: 'QUEUED', channel: 'OUTBOX' }).where(eq(emailLogs.id, logId)).run();
    return 'QUEUED';
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'Nuvra <onboarding@resend.dev>',
        to: [log.toEmail],
        subject: log.subject,
        text: log.body,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      await db.update(emailLogs)
        .set({ status: 'FAILED', channel: 'RESEND', error: err.slice(0, 500) })
        .where(eq(emailLogs.id, logId))
        .run();
      return 'FAILED';
    }
    await db.update(emailLogs).set({ status: 'SENT', channel: 'RESEND', error: null }).where(eq(emailLogs.id, logId)).run();
    return 'SENT';
  } catch (e) {
    await db.update(emailLogs)
      .set({ status: 'FAILED', channel: 'RESEND', error: String(e).slice(0, 500) })
      .where(eq(emailLogs.id, logId))
      .run();
    return 'FAILED';
  }
}

/** Record + deliver immediately (unless no provider → outbox). */
export async function sendEmail(input: SendEmailInput): Promise<string> {
  const row = await db
    .insert(emailLogs)
    .values({
      workspaceId: input.workspaceId ?? null,
      toEmail: input.to,
      subject: input.subject,
      body: input.body,
      channel: emailProvider(),
      status: emailProvider() === 'RESEND' ? 'QUEUED' : 'QUEUED',
      relatedTo: input.relatedTo ?? null,
    })
    .returning({ id: emailLogs.id })
    .get();
  await deliverLog(row.id);
  return row.id;
}

/** Schedule an email (sequence delays). Process with processDueEmails(). */
export async function scheduleEmail(input: SendEmailInput & { runAt: Date }): Promise<string> {
  const row = await db
    .insert(emailLogs)
    .values({
      workspaceId: input.workspaceId ?? null,
      toEmail: input.to,
      subject: input.subject,
      body: input.body,
      channel: emailProvider(),
      status: 'SCHEDULED',
      scheduledAt: input.runAt,
      relatedTo: input.relatedTo ?? null,
    })
    .returning({ id: emailLogs.id })
    .get();
  return row.id;
}

/** Deliver all due scheduled emails. Called by cron endpoint or Admin → Run now. */
export async function processDueEmails(): Promise<{ processed: number; sent: number; queued: number }> {
  const due = (await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.status, 'SCHEDULED'))
    .all())
    .filter((e) => !e.scheduledAt || e.scheduledAt.getTime() <= Date.now());
  let sent = 0;
  let queued = 0;
  for (const e of due) {
    const r = await deliverLog(e.id);
    if (r === 'SENT') sent++;
    else if (r === 'QUEUED') queued++;
  }
  return { processed: due.length, sent, queued };
}

export async function listOutbox(workspaceId?: string, limit = 100) {
  return await db
    .select()
    .from(emailLogs)
    .where(workspaceId ? eq(emailLogs.workspaceId, workspaceId) : undefined)
    .orderBy(desc(emailLogs.createdAt))
    .limit(limit)
    .all();
}
