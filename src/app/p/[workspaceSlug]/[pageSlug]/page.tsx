import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pages, pageViews, workspaces } from '@/db/schema';
import { PageRenderer } from '@/components/PageRenderer';
import { parseBlocks } from '@/components/blocks';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ workspaceSlug: string; pageSlug: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}

async function load(workspaceSlug: string, pageSlug: string) {
  const ws = db.select().from(workspaces).where(eq(workspaces.slug, workspaceSlug)).get();
  if (!ws) return null;
  const page = db
    .select()
    .from(pages)
    .where(and(eq(pages.workspaceId, ws.id), eq(pages.slug, pageSlug)))
    .get();
  if (!page) return null;
  return { ws, page };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workspaceSlug, pageSlug } = await params;
  const found = await load(workspaceSlug, pageSlug);
  if (!found || found.page.status !== 'PUBLISHED') return { title: 'Page not found' };
  return {
    title: found.page.seoTitle || found.page.title,
    description: found.page.seoDescription || undefined,
    openGraph: { title: found.page.seoTitle || found.page.title },
  };
}

export default async function PublicPage({ params, searchParams }: Props) {
  const { workspaceSlug, pageSlug } = await params;
  const sp = await searchParams;
  const found = await load(workspaceSlug, pageSlug);
  if (!found || found.page.status !== 'PUBLISHED') notFound();

  const { ws, page } = found;

  // Track view + affiliate referrer (fire-and-forget, synchronous for sqlite)
  const visitorId =
    typeof sp.ref === 'string' && sp.ref.length < 80 ? sp.ref : null;
  try {
    db.insert(pageViews)
      .values({
        pageId: page.id,
        visitorId,
        referrer: null,
        path: `/p/${workspaceSlug}/${pageSlug}`,
      })
      .run();
    db.update(pages).set({ views: sql`${pages.views} + 1` }).where(eq(pages.id, page.id)).run();
  } catch {
    // tracking must never break rendering
  }

  // Affiliate click attribution: /p/...?aff=CODE
  if (typeof sp.aff === 'string' && sp.aff.length <= 64) {
    try {
      const { affiliates, affiliateClicks } = await import('@/db/schema');
      const aff = db.select().from(affiliates).where(eq(affiliates.code, sp.aff)).get();
      if (aff) {
        db.insert(affiliateClicks)
          .values({ affiliateId: aff.id, visitorId, path: `/p/${workspaceSlug}/${pageSlug}` })
          .run();
      }
    } catch {
      /* best-effort */
    }
  }

  const blocks = parseBlocks(page.content);

  return (
    <div className="min-h-screen bg-ink-950">
      <PageRenderer blocks={blocks} workspaceId={ws.id} basePath={`/p/${workspaceSlug}/${pageSlug}`} />
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-700">
        Powered by <span className="font-semibold text-zinc-500">Nuvra</span> · {ws.name}
      </footer>
    </div>
  );
}
