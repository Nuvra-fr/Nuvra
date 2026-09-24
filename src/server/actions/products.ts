'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { products, type Product } from '@/db/schema';
import { requireUser, type AuthContext } from '@/lib/auth';
import { slugify, randomCode } from '@/lib/utils';
import { audit } from '@/lib/audit';

const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(4000).optional().default(''),
  type: z.enum(['DIGITAL', 'SERVICE', 'AUDIO', 'TEMPLATE']).default('DIGITAL'),
  priceCents: z.number().int().min(0).max(100_000_000),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  downloadUrl: z.string().max(500).optional(),
  coverUrl: z.string().max(500).optional(),
});

function ownedProduct(ctx: AuthContext, id: string): Product {
  const p = db.select().from(products).where(eq(products.id, id)).get();
  if (!p) throw new Error('Product not found');
  if (p.workspaceId !== ctx.workspace.id) throw new Error('Not authorized');
  return p;
}

function uniqueSlug(ctx: AuthContext, base: string): string {
  const root = slugify(base) || 'product';
  let slug = root;
  for (let i = 0; i < 30; i++) {
    const exists = db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.workspaceId, ctx.workspace.id), eq(products.slug, slug)))
      .get();
    if (!exists) return slug;
    slug = `${root}-${randomCode(3)}`;
  }
  return `${root}-${Date.now()}`;
}

export async function createProductAction(
  input: z.input<typeof productSchema>,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Check the product fields (name and price required).' };
    const p = parsed.data;
    const created = db
      .insert(products)
      .values({
        workspaceId: ctx.workspace.id,
        name: p.name,
        slug: uniqueSlug(ctx, p.name),
        description: p.description,
        type: p.type,
        priceCents: p.priceCents,
        status: p.status,
        downloadUrl: p.downloadUrl || null,
        coverUrl: p.coverUrl || null,
      })
      .returning({ id: products.id })
      .get();
    audit('product.created', { actorUserId: ctx.user.id, target: created.id, meta: { name: p.name } });
    revalidatePath('/dashboard/products');
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function updateProductAction(
  id: string,
  input: Partial<z.input<typeof productSchema>>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedProduct(ctx, id);
    const updates: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.type !== undefined) updates.type = input.type;
    if (input.priceCents !== undefined) {
      if (!Number.isInteger(input.priceCents) || input.priceCents < 0) return { ok: false, error: 'Invalid price' };
      updates.priceCents = input.priceCents;
    }
    if (input.status !== undefined) updates.status = input.status;
    if (input.downloadUrl !== undefined) updates.downloadUrl = input.downloadUrl || null;
    if (input.coverUrl !== undefined) updates.coverUrl = input.coverUrl || null;
    db.update(products).set(updates).where(eq(products.id, id)).run();
    revalidatePath('/dashboard/products');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteProductAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedProduct(ctx, id);
    db.delete(products).where(eq(products.id, id)).run();
    audit('product.deleted', { actorUserId: ctx.user.id, target: id });
    revalidatePath('/dashboard/products');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
