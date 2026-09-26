import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Star, Users, Shield } from 'lucide-react';
import { db } from '@/lib/db';
import { courseModules, courses, enrollments, marketplaceListings, reviews, workspaces } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { Logo } from '@/components/auth';
import { Badge } from '@/components/ui';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id)).get();
  return { title: l ? l.title : 'Marketplace' };
}

export default async function ListingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id)).get();
  if (!listing || listing.status !== 'APPROVED') notFound();

  const course = listing.courseId ? await db.select().from(courses).where(eq(courses.id, listing.courseId)).get() : null;
  const ws = course ? await db.select().from(workspaces).where(eq(workspaces.id, course.workspaceId)).get() : null;
  const mods = course
    ? await db.select().from(courseModules).where(eq(courseModules.courseId, course.id)).all()
    : [];
  const ratingRows = await db.select().from(reviews).where(eq(reviews.listingId, id)).all();
  const avg = ratingRows.length ? Math.round((ratingRows.reduce((s, r) => s + r.rating, 0) / ratingRows.length) * 10) / 10 : null;
  const students = course
    ? (await db.select({ x: enrollments.id }).from(enrollments).where(eq(enrollments.courseId, course.id)).all()).length
    : 0;

  // track listing view
  try {
    await db.update(marketplaceListings)
      .set({ views: listing.views + 1 })
      .where(eq(marketplaceListings.id, id))
      .run();
  } catch {
    /* noop */
  }

  const href = course
    ? listing.priceCents === 0
      ? `/c/${course.slug}`
      : `/checkout?item=course:${course.id}`
    : '/marketplace';

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo />
          <Link href="/marketplace" className="btn-ghost text-sm">← Marketplace</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{listing.category ?? 'Course'}</Badge>
              {listing.level ? <Badge>{listing.level}</Badge> : null}
              {listing.sponsoredUntil && listing.sponsoredUntil.getTime() > Date.now() ? (
                <Badge tone="amber">SPONSORED</Badge>
              ) : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white">{listing.title}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              by {listing.creatorName ?? ws?.name ?? 'Creator'}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              {avg ? (
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4" /> {avg} ({ratingRows.length})
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {students} students
              </span>
            </div>
            <p className="mt-5 whitespace-pre-wrap leading-relaxed text-zinc-400">{listing.description}</p>

            {mods.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {mods.length} modules
                </h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {mods.map((m) => (
                    <div key={m.id} className="rounded-lg border border-white/[0.07] bg-ink-900 px-4 py-2.5 text-sm text-zinc-400">
                      {m.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ratingRows.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Reviews</h2>
                <div className="mt-3 space-y-3">
                  {ratingRows.map((r) => (
                    <div key={r.id} className="rounded-xl border border-white/[0.07] p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                        <span className="text-xs text-zinc-600">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.comment ? <p className="mt-1.5 text-sm text-zinc-400">{r.comment}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="card p-6">
              <div className="text-3xl font-semibold text-white">{formatCents(listing.priceCents)}</div>
              <Link href={href} className="btn-primary mt-5 w-full">
                {listing.priceCents === 0 ? 'Enroll for free' : 'Enroll now'}
              </Link>
              <ul className="mt-5 space-y-2 text-xs text-zinc-500">
                <li className="flex gap-2"><Shield className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> Moderated listing</li>
                <li className="flex gap-2"><Users className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> Lifetime access</li>
                <li className="flex gap-2"><Star className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> Progress tracking & certificate</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
