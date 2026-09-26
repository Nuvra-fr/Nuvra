'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { funnels, funnelSteps, pages, type Page } from '@/db/schema';
import { requireUser, type AuthContext } from '@/lib/auth';
import { slugify, randomCode } from '@/lib/utils';

import { audit } from '@/lib/audit';

class ActionError extends Error {}

async function ownedPage(ctx: AuthContext, id: string): Promise<Page> {
  const page = await db.select().from(pages).where(eq(pages.id, id)).get();
  if (!page) throw new ActionError('Page not found');
  if (page.workspaceId !== ctx.workspace.id) throw new ActionError('Not authorized');
  return page;
}

async function uniquePageSlug(ctx: AuthContext, base: string): Promise<string> {
  const root = slugify(base) || 'page';
  let slug = root;
  for (let i = 0; i < 30; i++) {
    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.workspaceId, ctx.workspace.id), eq(pages.slug, slug)))
      .get();
    if (!existing) return slug;
    slug = `${root}-${randomCode(3)}`;
  }
  return `${root}-${Date.now()}`;
}

function defaultBlocks(type: string): string {
  if (type === 'LINKINBIO') {
    return JSON.stringify({
      blocks: [
        { id: randomCode(8), type: 'hero', data: { heading: ctxNameFallback(), subheading: 'All my links', ctaLabel: '', ctaHref: '#', align: 'center' } },
        { id: randomCode(8), type: 'link', data: { label: 'My website', href: 'https://', icon: 'link' } },
        { id: randomCode(8), type: 'link', data: { label: 'YouTube', href: 'https://youtube.com', icon: 'video' } },
        { id: randomCode(8), type: 'divider', data: {} },
      ],
    });
  }
  return JSON.stringify({
    blocks: [
      {
        id: randomCode(8),
        type: 'hero',
        data: {
          heading: 'Your headline goes here',
          subheading: 'Say something that makes people stay.',
          ctaLabel: 'Start for free',
          ctaHref: '/register',
          align: 'center',
        },
      },
      {
        id: randomCode(8),
        type: 'features',
        data: {
          title: 'Why this matters',
          items: [
            { title: 'Benefit one', body: 'Explain the value clearly.' },
            { title: 'Benefit two', body: 'Keep it concrete.' },
            { title: 'Benefit three', body: 'Remove the doubt.' },
          ],
        },
      },
      { id: randomCode(8), type: 'cta', data: { label: 'Get started', href: '/register', variant: 'primary' } },
    ],
  });
}

function ctxNameFallback(): string {
  return 'Hello';
}

export async function createPageAction(input: {
  title: string;
  type?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const title = input.title.trim().slice(0, 80) || 'Untitled page';
    const type = input.type ?? 'LANDING';
    const page = await db
      .insert(pages)
      .values({
        workspaceId: ctx.workspace.id,
        title,
        slug: await uniquePageSlug(ctx, title),
        type,
        status: 'DRAFT',
        content: defaultBlocks(type),
      })
      .returning({ id: pages.id })
      .get();
    await audit('page.created', { actorUserId: ctx.user.id, target: page.id, meta: { title } });
    revalidatePath('/dashboard/pages');
    return { ok: true, id: page.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to create page' };
  }
}

export async function savePageAction(
  id: string,
  input: {
    title?: string;
    content?: string;
    status?: 'DRAFT' | 'PUBLISHED';
    slug?: string;
    seoTitle?: string;
    seoDescription?: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const page = await ownedPage(ctx, id);
    const updates: Partial<typeof pages.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) updates.title = input.title.trim().slice(0, 120) || page.title;
    if (input.content !== undefined) {
      try {
        const parsed = JSON.parse(input.content);
        if (!parsed || !Array.isArray(parsed.blocks)) throw new Error('bad');
        updates.content = input.content;
      } catch {
        return { ok: false, error: 'Invalid block content' };
      }
    }
    if (input.status) updates.status = input.status;
    if (input.slug !== undefined) {
      const clean = slugify(input.slug);
      if (clean.length < 2) return { ok: false, error: 'Invalid slug' };
      const clash = await db
        .select({ id: pages.id })
        .from(pages)
        .where(
          and(
            eq(pages.workspaceId, ctx.workspace.id),
            eq(pages.slug, clean),
            ne(pages.id, id),
          ),
        )
        .get();
      if (clash) return { ok: false, error: 'Slug already used by another page' };
      updates.slug = clean;
    }
    if (input.seoTitle !== undefined) updates.seoTitle = input.seoTitle.slice(0, 120);
    if (input.seoDescription !== undefined) updates.seoDescription = input.seoDescription.slice(0, 300);

    await db.update(pages).set(updates).where(eq(pages.id, id)).run();
    revalidatePath('/dashboard/pages');
    revalidatePath(`/dashboard/pages/${id}`);
    revalidatePath(`/p/${ctx.workspace.slug}/${page.slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to save' };
  }
}

export async function deletePageAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    await ownedPage(ctx, id);
    await db.delete(pages).where(eq(pages.id, id)).run();
    await audit('page.deleted', { actorUserId: ctx.user.id, target: id });
    revalidatePath('/dashboard/pages');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to delete' };
  }
}

// ── Funnels ────────────────────────────────────────────

const DEFAULT_STEPS: { stepType: string; title: string }[] = [
  { stepType: 'LANDING', title: 'Landing' },
  { stepType: 'SALES', title: 'Sales page' },
  { stepType: 'CHECKOUT', title: 'Checkout' },
  { stepType: 'THANKYOU', title: 'Thank you' },
];

export async function createFunnelAction(input: {
  name: string;
  skeleton?: boolean;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const name = input.name.trim().slice(0, 80) || 'My funnel';
    const funnel = await db
      .insert(funnels)
      .values({ workspaceId: ctx.workspace.id, name, status: 'DRAFT' })
      .returning({ id: funnels.id })
      .get();

    const steps = input.skeleton === false ? [] : DEFAULT_STEPS;
    for (const [i, s] of steps.entries()) {
      const page = await db
        .insert(pages)
        .values({
          workspaceId: ctx.workspace.id,
          funnelId: funnel.id,
          title: s.title,
          slug: await uniquePageSlug(ctx, `${name}-${s.stepType.toLowerCase()}`),
          type: s.stepType === 'THANKYOU' ? 'THANKYOU' : 'LANDING',
          status: 'DRAFT',
          position: i,
          content: defaultBlocks('LANDING'),
        })
        .returning({ id: pages.id })
        .get();
      await db.insert(funnelSteps)
        .values({ funnelId: funnel.id, pageId: page.id, stepType: s.stepType, position: i })
        .run();
    };

    await audit('funnel.created', { actorUserId: ctx.user.id, target: funnel.id, meta: { name } });
    revalidatePath('/dashboard/funnels');
    return { ok: true, id: funnel.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to create funnel' };
  }
}

export async function setFunnelStatusAction(
  funnelId: string,
  status: 'DRAFT' | 'PUBLISHED',
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const funnel = await db.select().from(funnels).where(eq(funnels.id, funnelId)).get();
    if (!funnel || funnel.workspaceId !== ctx.workspace.id) throw new ActionError('Funnel not found');
    await db.update(funnels).set({ status, updatedAt: new Date() }).where(eq(funnels.id, funnelId)).run();
    if (status === 'PUBLISHED') {
      // publishing a funnel publishes its steps
      const steps = await db.select().from(funnelSteps).where(eq(funnelSteps.funnelId, funnelId)).all();
      await db.update(pages)
        .set({ status: 'PUBLISHED', updatedAt: new Date() })
        .where(
          inArray(
            pages.id,
            steps.map((s) => s.pageId),
          ),
        )
        .run();
    }
    revalidatePath(`/dashboard/funnels/${funnelId}`);
    revalidatePath('/dashboard/funnels');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to update' };
  }
}

export async function addFunnelStepAction(
  funnelId: string,
  stepType: string,
  title: string,
): Promise<{ ok: true; pageId: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const funnel = await db.select().from(funnels).where(eq(funnels.id, funnelId)).get();
    if (!funnel || funnel.workspaceId !== ctx.workspace.id) throw new ActionError('Funnel not found');
    const count = (await db.select({ id: funnelSteps.id }).from(funnelSteps).where(eq(funnelSteps.funnelId, funnelId)).all()).length;
    const page = await db
      .insert(pages)
      .values({
        workspaceId: ctx.workspace.id,
        funnelId,
        title: title.trim().slice(0, 80) || stepType,
        slug: await uniquePageSlug(ctx, `${funnel.name}-${stepType.toLowerCase()}`),
        status: 'DRAFT',
        position: count,
        content: defaultBlocks('LANDING'),
      })
      .returning({ id: pages.id })
      .get();
    await db.insert(funnelSteps)
      .values({ funnelId, pageId: page.id, stepType, position: count })
      .run();
    revalidatePath(`/dashboard/funnels/${funnelId}`);
    return { ok: true, pageId: page.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to add step' };
  }
}

export async function deleteFunnelAction(funnelId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const funnel = await db.select().from(funnels).where(eq(funnels.id, funnelId)).get();
    if (!funnel || funnel.workspaceId !== ctx.workspace.id) throw new ActionError('Funnel not found');
    await db.delete(funnels).where(eq(funnels.id, funnelId)).run();
    revalidatePath('/dashboard/funnels');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to delete' };
  }
}

