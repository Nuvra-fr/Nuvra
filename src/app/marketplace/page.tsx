import type { Metadata } from 'next';
import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { Store, Star, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { enrollments, marketplaceListings, reviews } from '@/db/schema';
import { flagEnabled } from '@/lib/config';
import { formatCents } from '@/lib/money';
import { Logo } from '@/components/auth';
import { Badge, InlineAlert } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Nuvra Marketplace',
  description: 'Browse courses created by Nuvra creators.',
};

export default async function PublicMarketplace({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;

  if (!flagEnabled('marketplace')) {
    return (
      <div className="min-h-screen bg-ink-950">
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <InlineAlert tone="warning">The marketplace is currently disabled.</InlineAlert>
        </main>
      </div>
    );
  }

  let listings = db
    .select()
    .from(marketplaceListings)
    .where(eq(marketplaceListings.status, 'APPROVED'))
    .orderBy(asc(marketplaceListings.createdAt))
    .all();

  if (sp.q) {
    const q = sp.q.toLowerCase();
    listings = listings.filter(
      (l) => l.title.toLowerCase().includes(q) || (l.description ?? '').toLowerCase().includes(q),
    );
  }
  if (sp.category) {
    listings = listings.filter((l) => l.category === sp.category);
  }

  const categories = Array.from(
    new Set(
      db
        .select({ category: marketplaceListings.category })
        .from(marketplaceListings)
        .where(eq(marketplaceListings.status, 'APPROVED'))
        .all()
        .map((l) => l.category)
        .filter(Boolean),
    ),
  ) as string[];

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/register" className="btn-primary">Start for free</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <Store className="h-6 w-6 text-nuvra-400" /> Nuvra Marketplace
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Courses published by Nuvra creators. Creators keep 90 % on the Free plan and 100 % on Pro.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <form className="flex gap-2" action="/marketplace">
            <input
              name="q"
              defaultValue={sp.q ?? ''}
              placeholder="Search courses…"
              className="input !w-64 !py-2"
            />
            <button className="btn-secondary !py-2">Search</button>
          </form>
          <Link href="/marketplace" className={`badge ${!sp.category ? '!border-nuvra-500/50 !bg-nuvra-500/15' : ''}`}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/marketplace?category=${encodeURIComponent(c!)}`}
              className={`badge ${sp.category === c ? '!border-nuvra-500/50 !bg-nuvra-500/15' : ''}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {listings.length === 0 ? (
          <div className="card p-12 text-center text-sm text-zinc-600">
            No courses match{sp.q ? ` “${sp.q}”` : ''}. Check back soon.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => {
              const students = l.courseId
                ? db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.courseId, l.courseId)).all().length
                : 0;
              const ratingRows = db.select().from(reviews).where(eq(reviews.listingId, l.id)).all();
              const avg =
                ratingRows.length > 0
                  ? Math.round((ratingRows.reduce((s, r) => s + r.rating, 0) / ratingRows.length) * 10) / 10
                  : null;
              return (
                <Link key={l.id} href={`/marketplace/${l.id}`} className="card p-5 transition hover:border-nuvra-500/40">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone="blue">{l.category ?? 'Course'}</Badge>
                    <span className="text-lg font-semibold text-zinc-100">{formatCents(l.priceCents)}</span>
                  </div>
                  <div className="mt-3 line-clamp-2 text-sm font-semibold text-zinc-200">{l.title}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{l.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
                    <span>{l.creatorName ?? 'Creator'}</span>
                    <span className="flex items-center gap-3">
                      {avg ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="h-3 w-3" /> {avg}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {students}
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
