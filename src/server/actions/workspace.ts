'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customDomains, profiles, workspaces } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { randomCode } from '@/lib/utils';
import { audit } from '@/lib/audit';

export async function saveWorkspaceSettingsAction(input: {
  name: string;
  slug: string;
  username: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const name = input.name.trim().slice(0, 60);
    if (name.length < 2) return { ok: false, error: 'Name too short' };

    const slug = slugify(input.slug);
    if (slug.length < 2) return { ok: false, error: 'Invalid storefront slug' };
    const slugClash = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .get();
    if (slugClash && slugClash.id !== ctx.workspace.id) {
      return { ok: false, error: 'This storefront slug is already taken' };
    }

    const handle = input.username.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
    if (handle.length >= 3 && ctx.profile) {
      const handleClash = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.username, handle))
        .get();
      if (!handleClash || handleClash.id === ctx.profile.id) {
        await db.update(profiles).set({ username: handle }).where(eq(profiles.id, ctx.profile.id)).run();
      }
    }

    await db.update(workspaces)
      .set({ name, slug, updatedAt: new Date() })
      .where(eq(workspaces.id, ctx.workspace.id))
      .run();

    await audit('workspace.settings_updated', { actorUserId: ctx.user.id, target: ctx.workspace.id });
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function addDomainAction(domain: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(clean)) return { ok: false, error: 'Invalid domain' };
    const existing = await db.select({ id: customDomains.id }).from(customDomains).where(eq(customDomains.domain, clean)).get();
    if (existing) return { ok: false, error: 'Domain already registered' };
    await db.insert(customDomains)
      .values({
        workspaceId: ctx.workspace.id,
        domain: clean,
        status: 'PENDING',
        verificationToken: `nuvra-verify-${randomCode(10)}`,
      })
      .run();
    await audit('domain.added', { actorUserId: ctx.user.id, target: clean });
    revalidatePath('/dashboard/settings');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function removeDomainAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const row = await db.select().from(customDomains).where(eq(customDomains.id, id)).get();
    if (!row || row.workspaceId !== ctx.workspace.id) return { ok: false, error: 'Not found' };
    await db.delete(customDomains).where(eq(customDomains.id, id)).run();
    revalidatePath('/dashboard/settings');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
