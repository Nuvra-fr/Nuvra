import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { pages } from '@/db/schema';
import PageEditor from './PageEditor';

export const metadata: Metadata = { title: 'Page editor' };

export default async function PageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireUser();
  const { id } = await params;
  const page = await db.select().from(pages).where(eq(pages.id, id)).get();
  if (!page || page.workspaceId !== ctx.workspace.id) notFound();

  return (
    <PageEditor
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        type: page.type,
        status: page.status,
        content: page.content,
        seoTitle: page.seoTitle ?? '',
        seoDescription: page.seoDescription ?? '',
        views: page.views,
        funnelId: page.funnelId,
      }}
      workspaceSlug={ctx.workspace.slug}
    />
  );
}
