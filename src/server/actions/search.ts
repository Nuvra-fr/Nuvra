'use server';

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contacts, courses, funnels, orders, pages, products } from '@/db/schema';
import { requireUser } from '@/lib/auth';

export interface SearchHit {
  label: string;
  sublabel?: string;
  href: string;
  kind: string;
}

export async function globalSearch(q: string): Promise<SearchHit[]> {
  const ctx = await requireUser();
  const query = q.trim();
  if (query.length < 2) return [];
  const ws = ctx.workspace.id;
  const likeQ = `%${query}%`;
  const hits: SearchHit[] = [];

  for (const p of db
    .select()
    .from(pages)
    .where(sql`${pages.workspaceId} = ${ws} AND (${pages.title} LIKE ${likeQ} OR ${pages.slug} LIKE ${likeQ})`)
    .limit(5)
    .all()) {
    hits.push({ label: p.title, sublabel: `/p/${ctx.workspace.slug}/${p.slug}`, href: `/dashboard/pages/${p.id}`, kind: 'Page' });
  }
  for (const p of db
    .select()
    .from(products)
    .where(sql`${products.workspaceId} = ${ws} AND ${products.name} LIKE ${likeQ}`)
    .limit(5)
    .all()) {
    hits.push({ label: p.name, sublabel: `${(p.priceCents / 100).toFixed(2)} · ${p.status}`, href: `/dashboard/products?edit=${p.id}`, kind: 'Product' });
  }
  for (const c of db
    .select()
    .from(courses)
    .where(sql`${courses.workspaceId} = ${ws} AND ${courses.title} LIKE ${likeQ}`)
    .limit(5)
    .all()) {
    hits.push({ label: c.title, sublabel: `${(c.priceCents / 100).toFixed(2)} · ${c.status}`, href: `/dashboard/courses/${c.id}`, kind: 'Course' });
  }
  for (const f of db
    .select()
    .from(funnels)
    .where(sql`${funnels.workspaceId} = ${ws} AND ${funnels.name} LIKE ${likeQ}`)
    .limit(5)
    .all()) {
    hits.push({ label: f.name, sublabel: 'Funnel', href: `/dashboard/funnels/${f.id}`, kind: 'Funnel' });
  }
  for (const c of db
    .select()
    .from(contacts)
    .where(sql`${contacts.workspaceId} = ${ws} AND (${contacts.email} LIKE ${likeQ} OR ${contacts.name} LIKE ${likeQ})`)
    .limit(5)
    .all()) {
    hits.push({ label: c.name ?? c.email, sublabel: c.email, href: `/dashboard/customers?contact=${c.id}`, kind: 'Contact' });
  }
  for (const o of db
    .select()
    .from(orders)
    .where(sql`${orders.workspaceId} = ${ws} AND (${orders.number} LIKE ${likeQ} OR ${orders.buyerEmail} LIKE ${likeQ})`)
    .limit(5)
    .all()) {
    hits.push({ label: o.number, sublabel: `${o.buyerEmail} · ${o.status}`, href: `/dashboard/payments?order=${o.id}`, kind: 'Order' });
  }
  return hits.slice(0, 12);
}
