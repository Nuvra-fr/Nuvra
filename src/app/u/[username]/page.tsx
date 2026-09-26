import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  courses,
  memberships,
  pages,
  products,
  profiles,
  users,
  workspaces,
} from '@/db/schema';
import { PageRenderer } from '@/components/PageRenderer';
import { parseBlocks } from '@/components/blocks';
import { Logo } from '@/components/auth';
import { Badge } from '@/components/ui';
import { formatCents } from '@/lib/money';
import { initials } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function load(username: string) {
  const prof = await db.select().from(profiles).where(eq(profiles.username, username)).get();
  if (!prof) return null;
  const user = await db.select().from(users).where(eq(users.id, prof.userId)).get();
  if (!user) return null;
  const membership = await db
    .select({ workspace: workspaces })
    .from(memberships)
    .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
    .where(eq(memberships.userId, user.id))
    .get();
  if (!membership) return null;
  return { prof, user, ws: membership.workspace };
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const found = await load(username);
  if (!found) return { title: 'Profile not found' };
  return { title: `${found.user.name} · Nuvra Link` };
}

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const found = await load(username);
  if (!found) notFound();
  const { prof, user, ws } = found;

  // Nuvra Link page: first published LINKINBIO page of the workspace
  const linkPage = (await db
    .select()
    .from(pages)
    .where(eq(pages.workspaceId, ws.id))
    .all())
    .find((p) => p.type === 'LINKINBIO' && p.status === 'PUBLISHED');

  const otherPages = (await db
    .select()
    .from(pages)
    .where(eq(pages.workspaceId, ws.id))
    .all())
    .filter((p) => p.status === 'PUBLISHED' && p.type !== 'LINKINBIO' && p.id !== linkPage?.id);

  const productRows = (await db.select().from(products).where(eq(products.workspaceId, ws.id)).all())
    .filter((p) => p.status === 'PUBLISHED');
  const courseRows = (await db.select().from(courses).where(eq(courses.workspaceId, ws.id)).all())
    .filter((c) => c.status === 'PUBLISHED' && !c.isAcademy);

  if (linkPage) {
    const blocks = parseBlocks(linkPage.content);
    return (
      <div className="min-h-screen bg-ink-950">
        <PageRenderer blocks={blocks} workspaceId={ws.id} basePath={`/p/${ws.slug}/${linkPage.slug}`} />
        <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-700">
          Nuvra Link · <span className="font-semibold text-zinc-500">{user.name}</span> · {ws.name}
        </footer>
      </div>
    );
  }

  // Fallback: honest auto-generated profile card
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-5">
          <Logo />
          <Link href="/" className="btn-ghost text-sm">Nuvra</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-12">
        <div className="card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nuvra-600/20 text-xl font-semibold text-nuvra-300">
            {initials(user.name)}
          </div>
          <h1 className="mt-4 text-xl font-semibold text-zinc-100">{user.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            @{prof.username} · {ws.name}
          </p>
          <p className="mt-3 text-xs text-zinc-600">
            No Nuvra Link published yet — this is the auto-generated profile.
          </p>
        </div>

        {(otherPages.length > 0 || productRows.length > 0 || courseRows.length > 0) && (
          <div className="mt-6 space-y-3">
            {otherPages.map((p) => (
              <Link key={p.id} href={`/p/${ws.slug}/${p.slug}`} className="card flex items-center justify-between p-4 hover:border-white/20">
                <span className="text-sm font-medium text-zinc-200">{p.title}</span>
                <Badge>{p.type}</Badge>
              </Link>
            ))}
            {courseRows.map((c) => (
              <Link
                key={c.id}
                href={c.priceCents === 0 ? `/c/${c.slug}` : `/checkout?item=course:${c.id}`}
                className="card flex items-center justify-between p-4 hover:border-white/20"
              >
                <span className="text-sm font-medium text-zinc-200">{c.title}</span>
                <span className="text-sm text-nuvra-300">{formatCents(c.priceCents)}</span>
              </Link>
            ))}
            {productRows.map((p) => (
              <Link key={p.id} href={`/checkout?item=product:${p.id}`} className="card flex items-center justify-between p-4 hover:border-white/20">
                <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                <span className="text-sm text-nuvra-300">{formatCents(p.priceCents)}</span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-700">
        Powered by <span className="font-semibold text-zinc-500">Nuvra</span>
      </footer>
    </div>
  );
}
