import { and, asc, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contacts, courses, enrollments, funnelSteps, funnels, orders, pageViews, pages, products } from '@/db/schema';

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

/** Paid orders per day for the last `days` days (respects order mode). */
export function revenueSeries(days = 14, mode?: 'LIVE' | 'TEST'): RevenuePoint[] {
  const since = daysAgo(days - 1);
  const conditions = [gte(orders.paidAt, since), eq(orders.status, 'PAID')];
  if (mode) conditions.push(eq(orders.mode, mode));
  const rows = db
    .select({ paidAt: orders.paidAt, totalCents: orders.totalCents })
    .from(orders)
    .where(and(...conditions))
    .all();

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = daysAgo(days - 1 - i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    if (!r.paidAt) continue;
    const key = r.paidAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + r.totalCents);
  }
  return Array.from(byDay.entries()).map(([date, value]) => ({
    label: date.slice(5),
    value,
  }));
}

export function workspaceStats(workspaceId: string, mode?: 'LIVE' | 'TEST') {
  const since30 = daysAgo(30);
  const orderConds = [eq(orders.workspaceId, workspaceId), eq(orders.status, 'PAID')];
  if (mode) orderConds.push(eq(orders.mode, mode));

  const paid = db
    .select({ totalCents: orders.totalCents, id: orders.id })
    .from(orders)
    .where(and(...orderConds))
    .all();
  const paidSince30 = db
    .select({ totalCents: orders.totalCents })
    .from(orders)
    .where(and(...orderConds, gte(orders.paidAt, since30)))
    .all();

  const revenue = paid.reduce((s, o) => s + o.totalCents, 0);
  const revenue30 = paidSince30.reduce((s, o) => s + o.totalCents, 0);
  const platformFees = db
    .select({ platformFeeCents: orders.platformFeeCents })
    .from(orders)
    .where(and(...orderConds))
    .all()
    .reduce((s, o) => s + o.platformFeeCents, 0);

  const customerCount = db
    .select({ email: orders.buyerEmail })
    .from(orders)
    .where(and(...orderConds))
    .all();
  const uniqueCustomers = new Set(customerCount.map((c) => c.email)).size;

  const leads = db
    .select({ id: contacts.id })
    .from(contacts)
    .where(and(eq(contacts.workspaceId, workspaceId), eq(contacts.status, 'LEAD')))
    .all().length;

  const students = db
    .select({ id: enrollments.id })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(courses.workspaceId, workspaceId))
    .all().length;

  const productCount = db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.workspaceId, workspaceId))
    .all().length;

  const courseCount = db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.workspaceId, workspaceId))
    .all().length;

  const pageRows = db
    .select({ id: pages.id, views: pages.views })
    .from(pages)
    .where(eq(pages.workspaceId, workspaceId))
    .all();
  const totalViews = pageRows.reduce((s, p) => s + p.views, 0);

  const checkoutStarts = db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.workspaceId, workspaceId))
    .all().length;
  const conversion = checkoutStarts > 0 ? Math.round((paid.length / checkoutStarts) * 1000) / 10 : 0;

  return {
    revenue,
    revenue30,
    sales: paid.length,
    platformFees,
    customers: uniqueCustomers,
    leads,
    students,
    products: productCount,
    courses: courseCount,
    pageViews: totalViews,
    conversion,
  };
}

export interface FunnelAnalytics {
  funnelId: string;
  name: string;
  steps: { stepType: string; pageId: string; title: string; views: number; conversionFromPrev: number | null }[];
  overallConversion: number;
}

export function funnelAnalytics(funnelId: string): FunnelAnalytics | null {
  const funnel = db.select().from(funnels).where(eq(funnels.id, funnelId)).get();
  if (!funnel) return null;
  const steps = db
    .select({ step: funnelSteps, page: pages })
    .from(funnelSteps)
    .innerJoin(pages, eq(funnelSteps.pageId, pages.id))
    .where(eq(funnelSteps.funnelId, funnelId))
    .orderBy(asc(funnelSteps.position))
    .all();

  let prev: number | null = null;
  let first: number | null = null;
  const out = steps.map((s) => {
    const views = db
      .select({ id: pageViews.id })
      .from(pageViews)
      .where(eq(pageViews.pageId, s.page.id))
      .all().length;
    if (first === null) first = views;
    const conversion = prev !== null && prev > 0 ? Math.round((views / prev) * 1000) / 10 : null;
    prev = views;
    return {
      stepType: s.step.stepType,
      pageId: s.page.id,
      title: s.page.title,
      views,
      conversionFromPrev: conversion,
    };
  });

  const last = out.length ? out[out.length - 1]!.views : 0;
  const overall = out.length && out[0]!.views > 0 ? Math.round((last / out[0]!.views) * 1000) / 10 : 0;

  return { funnelId, name: funnel.name, steps: out, overallConversion: overall };
}

export function topPages(workspaceId: string, limit = 5) {
  return db
    .select()
    .from(pages)
    .where(eq(pages.workspaceId, workspaceId))
    .orderBy(desc(pages.views))
    .limit(limit)
    .all();
}

export function recentPaidOrders(workspaceId: string, limit = 8) {
  return db
    .select()
    .from(orders)
    .where(and(eq(orders.workspaceId, workspaceId), eq(orders.status, 'PAID')))
    .orderBy(desc(orders.paidAt))
    .limit(limit)
    .all();
}
