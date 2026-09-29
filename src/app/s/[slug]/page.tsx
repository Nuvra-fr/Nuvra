import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ShoppingBag } from 'lucide-react';
import { db } from '@/lib/db';
import { courses, products, workspaces } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { BrandLogo } from '@/components/BrandLogo';
import { Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ws = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .get();
  return { title: ws ? `${ws.name} — Boutique` : 'Boutique' };
}

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ws = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .get();
  if (!ws) notFound();

  const productRows = (
    await db
      .select()
      .from(products)
      .where(eq(products.workspaceId, ws.id))
      .all()
  ).filter((p) => p.status === 'PUBLISHED');
  const courseRows = (
    await db.select().from(courses).where(eq(courses.workspaceId, ws.id)).all()
  ).filter((c) => c.status === 'PUBLISHED' && !c.isAcademy);

  const items = [
    ...productRows.map((p) => ({
      id: p.id,
      kind: 'product' as const,
      title: p.name,
      description: p.description ?? '',
      price: p.priceCents,
      href: `/checkout?item=product:${p.id}`,
      badge: p.type,
    })),
    ...courseRows.map((c) => ({
      id: c.id,
      kind: 'course' as const,
      title: c.title,
      description: c.description ?? '',
      price: c.priceCents,
      href:
        c.priceCents === 0 ? `/c/${c.slug}` : `/checkout?item=course:${c.id}`,
      badge: 'Formation',
    })),
  ];

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="glass-capsule sticky top-0 z-40 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <BrandLogo href="/" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">{ws.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Boutique propulsée par Nuvra
          </p>
        </div>

        {items.length === 0 ? (
          <div className="card p-10 text-center text-sm text-zinc-600">
            Rien à vendre ici pour l&apos;instant.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={`${item.kind}-${item.id}`}
                className="card flex flex-col p-5"
              >
                <div className="flex items-start justify-between">
                  <Badge tone={item.kind === 'course' ? 'blue' : 'default'}>
                    {item.badge}
                  </Badge>
                  <span className="text-lg font-semibold text-zinc-100">
                    {formatCents(item.price)}
                  </span>
                </div>
                <div className="mt-3 section-title">{item.title}</div>
                <p className="mt-1 line-clamp-3 text-xs text-zinc-500">
                  {item.description}
                </p>
                <a
                  href={item.href}
                  className="btn-primary mt-4 w-full !py-2.5 !text-xs"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {item.price === 0 ? 'Obtenir gratuitement' : 'Acheter'}
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
