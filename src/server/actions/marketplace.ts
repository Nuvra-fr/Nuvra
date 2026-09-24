'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { courses, marketplaceListings, reviews } from '@/db/schema';
import { requireUser, type AuthContext } from '@/lib/auth';
import { audit } from '@/lib/audit';

function ownedListing(ctx: AuthContext, id: string) {
  const l = db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id)).get();
  if (!l) throw new Error('Listing not found');
  if (l.workspaceId !== ctx.workspace.id) throw new Error('Not authorized');
  return l;
}

export async function submitListingAction(
  courseId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const course = db.select().from(courses).where(eq(courses.id, courseId)).get();
    if (!course || course.workspaceId !== ctx.workspace.id) return { ok: false, error: 'Course not found' };
    if (course.status !== 'PUBLISHED') return { ok: false, error: 'Publish the course before listing it' };

    const existing = db.select().from(marketplaceListings).where(eq(marketplaceListings.courseId, courseId)).get();
    if (existing) return { ok: false, error: 'This course is already listed' };

    const created = db
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
    audit('listing.submitted', { actorUserId: ctx.user.id, target: created.id });
    revalidatePath('/dashboard/marketplace');
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteListingAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    ownedListing(ctx, id);
    db.delete(marketplaceListings).where(eq(marketplaceListings.id, id)).run();
    revalidatePath('/dashboard/marketplace');
    revalidatePath('/marketplace');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
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
    if (rating < 1 || rating > 5) return { ok: false, error: 'Rating must be 1-5' };
    const listing = db.select().from(marketplaceListings).where(eq(marketplaceListings.id, listingId)).get();
    if (!listing) return { ok: false, error: 'Listing not found' };
    db.insert(reviews)
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
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
