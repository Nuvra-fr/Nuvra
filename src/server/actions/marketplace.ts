'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { courses, marketplaceListings, reviews } from '@/db/schema';
import { requireUser, type AuthContext } from '@/lib/auth';
import { audit } from '@/lib/audit';

async function ownedListing(ctx: AuthContext, id: string) {
  const l = await db
    .select()
    .from(marketplaceListings)
    .where(eq(marketplaceListings.id, id))
    .get();
  if (!l) throw new Error('Annonce introuvable');
  if (l.workspaceId !== ctx.workspace.id) throw new Error('Non autorisé');
  return l;
}

export async function submitListingAction(
  courseId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .get();
    if (!course || course.workspaceId !== ctx.workspace.id)
      return { ok: false, error: 'Formation introuvable' };
    if (course.status !== 'PUBLISHED')
      return { ok: false, error: 'Publiez la formation avant de la proposer' };

    const existing = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.courseId, courseId))
      .get();
    if (existing)
      return { ok: false, error: 'Cette formation est déjà proposée' };

    const created = await db
      .insert(marketplaceListings)
      .values({
        courseId,
        workspaceId: ctx.workspace.id,
        targetType: 'COURSE',
        targetId: courseId,
        title: course.title,
        description: course.description,
        coverUrl: course.coverUrl,
        priceCents: course.priceCents,
        category: course.category,
        level: course.level,
        creatorName: ctx.workspace.name,
        status: 'PENDING',
      })
      .returning({ id: marketplaceListings.id })
      .get();
    await audit('listing.submitted', {
      actorUserId: ctx.user.id,
      target: created.id,
    });
    revalidatePath('/dashboard/marketplace');
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Échec' };
  }
}

export async function deleteListingAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    await ownedListing(ctx, id);
    await db
      .delete(marketplaceListings)
      .where(eq(marketplaceListings.id, id))
      .run();
    revalidatePath('/dashboard/marketplace');
    revalidatePath('/marketplace');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Échec' };
  }
}

/** Public review — only buyers with a PAID order containing the course can review. */
export async function submitReviewAction(
  listingId: string,
  rating: number,
  comment: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    if (rating < 1 || rating > 5)
      return { ok: false, error: 'La note doit être comprise entre 1 et 5' };
    const listing = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, listingId))
      .get();
    if (!listing) return { ok: false, error: 'Annonce introuvable' };
    await db
      .insert(reviews)
      .values({
        listingId,
        userId: ctx.user.id,
        rating,
        comment: comment.slice(0, 1000) || null,
        status: 'PUBLISHED',
      })
      .onConflictDoUpdate({
        target: [reviews.listingId, reviews.userId],
        set: { rating, comment: comment.slice(0, 1000) || null },
      })
      .run();
    revalidatePath('/marketplace');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Échec' };
  }
}
