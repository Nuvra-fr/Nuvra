'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contacts, contactActivities, emailCampaigns } from '@/db/schema';
import { requireUser, type AuthContext } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { emitEvent } from '@/lib/events';
import { audit } from '@/lib/audit';

function ownedContact(ctx: AuthContext, id: string) {
  const c = db.select().from(contacts).where(eq(contacts.id, id)).get();
  if (!c) throw new Error('Contact not found');
  if (c.workspaceId !== ctx.workspace.id) throw new Error('Not authorized');
  return c;
}

export async function upsertContactAction(input: {
  email: string;
  name?: string;
  status?: string;
  tags?: string[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const email = input.email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Invalid email' };
    const existing = db
      .select()
      .from(contacts)
      .where(and(eq(contacts.workspaceId, ctx.workspace.id), eq(contacts.email, email)))
      .get();
    if (existing) {
      db.update(contacts)
        .set({ name: input.name ?? existing.name, updatedAt: new Date() })
        .where(eq(contacts.id, existing.id))
        .run();
      revalidatePath('/dashboard/customers');
      revalidatePath('/dashboard/leads');
      return { ok: true, id: existing.id };
    }
    const created = db
      .insert(contacts)
      .values({
        workspaceId: ctx.workspace.id,
        email,
        name: input.name ?? null,
        status: input.status ?? 'LEAD',
        source: 'manual',
        tags: JSON.stringify(input.tags ?? []),
      })
      .returning({ id: contacts.id })
      .get();
    db.insert(contactActivities)
      .values({ contactId: created.id, type: 'lead.created', summary: 'Added manually' })
      .run();
    emitEvent({
      name: 'lead.created',
      workspaceId: ctx.workspace.id,
      payload: { email, name: input.name ?? '', contactId: created.id },
    });
    audit('contact.created', { actorUserId: ctx.user.id, target: created.id });
    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/leads');
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function updateContactAction(
  id: string,
  input: Partial<{ name: string; status: string; tags: string[]; notes: string; phone: string }>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedContact(ctx, id);
    const updates: Partial<typeof contacts.$inferInsert> = { updatedAt: new Date() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.status !== undefined) updates.status = input.status;
    if (input.tags !== undefined) updates.tags = JSON.stringify(input.tags);
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.phone !== undefined) updates.phone = input.phone;
    db.update(contacts).set(updates).where(eq(contacts.id, id)).run();
    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/leads');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteContactAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedContact(ctx, id);
    db.delete(contacts).where(eq(contacts.id, id)).run();
    revalidatePath('/dashboard/customers');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

// ── Campaigns ──────────────────────────────────────────

export async function createCampaignAction(input: {
  name: string;
  subject: string;
  body: string;
  segment?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    if (!input.name.trim() || !input.subject.trim()) return { ok: false, error: 'Name and subject required' };
    const created = db
      .insert(emailCampaigns)
      .values({
        workspaceId: ctx.workspace.id,
        name: input.name.trim().slice(0, 120),
        subject: input.subject.trim().slice(0, 200),
        body: input.body,
        segment: input.segment ?? 'ALL',
        status: 'DRAFT',
      })
      .returning({ id: emailCampaigns.id })
      .get();
    revalidatePath('/dashboard/emails');
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function sendCampaignAction(
  campaignId: string,
): Promise<{ ok: true; sent: number } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const campaign = db.select().from(emailCampaigns).where(eq(emailCampaigns.id, campaignId)).get();
    if (!campaign || campaign.workspaceId !== ctx.workspace.id) return { ok: false, error: 'Campaign not found' };
    if (campaign.status === 'SENT') return { ok: false, error: 'Already sent' };

    const all = db.select().from(contacts).where(eq(contacts.workspaceId, ctx.workspace.id)).all();
    const targets = all.filter((c) => {
      if (c.status === 'UNSUBSCRIBED') return false;
      if (campaign.segment === 'ALL') return true;
      if (campaign.segment === 'LEADS') return c.status === 'LEAD';
      if (campaign.segment === 'CUSTOMERS') return c.status === 'CUSTOMER';
      if (campaign.segment === 'STUDENTS') return c.status === 'STUDENT';
      if (campaign.segment.startsWith('tag:')) {
        const tag = campaign.segment.slice(4);
        try {
          return (JSON.parse(c.tags) as string[]).includes(tag);
        } catch {
          return false;
        }
      }
      return true;
    });

    for (const c of targets) {
      await sendEmail({
        to: c.email,
        subject: campaign.subject,
        body: campaign.body.replace(/\{\{name\}\}/g, c.name ?? ''),
        workspaceId: ctx.workspace.id,
        relatedTo: `campaign:${campaign.id}`,
      });
    }

    db.update(emailCampaigns)
      .set({ status: 'SENT', sentAt: new Date(), sentCount: targets.length, updatedAt: new Date() })
      .where(eq(emailCampaigns.id, campaignId))
      .run();
    audit('campaign.sent', { actorUserId: ctx.user.id, target: campaignId, meta: { count: targets.length } });
    revalidatePath('/dashboard/emails');
    return { ok: true, sent: targets.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteCampaignAction(campaignId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const campaign = db.select().from(emailCampaigns).where(eq(emailCampaigns.id, campaignId)).get();
    if (!campaign || campaign.workspaceId !== ctx.workspace.id) return { ok: false, error: 'Not found' };
    db.delete(emailCampaigns).where(eq(emailCampaigns.id, campaignId)).run();
    revalidatePath('/dashboard/emails');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
