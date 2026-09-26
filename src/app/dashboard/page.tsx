import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import {
  ArrowUpRight,
  Plus,
  CreditCard,
  Rocket,
  GraduationCap,
  FileText,
  Package,
  Sparkles,
} from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, orders, pages, products, funnels } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { BarChart, Badge, PageHeader, Stat, StatusBadge } from '@/components/ui';
import { revenueSeries, workspaceStats } from '@/lib/analytics';
import { paymentsMode } from '@/lib/stripe';
import { academyPriceCents } from '@/lib/config';

export const metadata: Metadata = { title: 'Overview' };

export default async function OverviewPage() {
  const ctx = await requireUser();
  const ws = ctx.workspace.id;
  const stats = await workspaceStats(ws);
  const series = await revenueSeries(14);

  const recentOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.workspaceId, ws))
    .orderBy(desc(orders.createdAt))
    .limit(6)
    .all();

  // "Your next moves" — real recommendations from real data
  const productCount = (await db.select({ id: products.id }).from(products).where(eq(products.workspaceId, ws)).all()).length;
  const courseCount = (await db.select({ id: courses.id }).from(courses).where(eq(courses.workspaceId, ws)).all()).length;
  const pageCount = (await db.select({ id: pages.id }).from(pages).where(eq(pages.workspaceId, ws)).all()).length;
  const funnelCount = (await db.select({ id: funnels.id }).from(funnels).where(eq(funnels.workspaceId, ws)).all()).length;
  const hasStripe = paymentsMode() === 'stripe';

  const moves: { title: string; body: string; href: string; cta: string; done?: boolean }[] = [
    {
      title: productCount === 0 && courseCount === 0 ? 'Create your first product' : 'Products & courses on track',
      body:
        productCount === 0 && courseCount === 0
          ? 'Something to sell is the seed of everything else.'
          : `${productCount} product(s), ${courseCount} course(s) in your workspace.`,
      href: '/dashboard/products?new=1',
      cta: productCount === 0 && courseCount === 0 ? 'Create product' : 'Open products',
      done: productCount > 0 || courseCount > 0,
    },
    {
      title: pageCount === 0 ? 'Build a landing page' : 'Pages are live',
      body: pageCount === 0 ? 'Turn traffic into leads with a dedicated page.' : `${pageCount} page(s) created.`,
      href: '/dashboard/pages?new=1',
      cta: pageCount === 0 ? 'Build page' : 'Open pages',
      done: pageCount > 0,
    },
    {
      title: funnelCount === 0 ? 'Structure a funnel' : 'Funnels in place',
      body:
        funnelCount === 0
          ? 'Landing → lead → sales → checkout → upsell, with conversions tracked.'
          : `${funnelCount} funnel(s) tracking step conversions.`,
      href: '/dashboard/funnels?new=1',
      cta: funnelCount === 0 ? 'Create funnel' : 'Open funnels',
      done: funnelCount > 0,
    },
    {
      title: hasStripe ? 'Payments connected' : 'Connect your payments',
      body: hasStripe
        ? 'Stripe is configured — live checkout enabled.'
        : 'Set STRIPE_SECRET_KEY to accept live payments. Until then, checkout runs in labeled TEST MODE.',
      href: '/dashboard/settings#payments',
      cta: hasStripe ? 'View settings' : 'Payment settings',
      done: hasStripe,
    },
    {
      title: 'Discover Nuvra Academy',
      body: `Paid program with reseller eligibility — ${formatCents(await academyPriceCents())}. The platform itself stays free.`,
      href: '/dashboard/academy',
      cta: 'Explore Academy',
      done: false,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${ctx.user.name.split(' ')[0]}`}
        description="Your business at a glance."
        actions={
          <>
            <Link href="/dashboard/products?new=1" className="btn-secondary">
              <Plus className="h-4 w-4" /> New product
            </Link>
            <Link href="/dashboard/courses?new=1" className="btn-primary">
              <Plus className="h-4 w-4" /> New course
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Revenue (all time)"
          value={formatCents(stats.revenue)}
          hint={`${stats.sales} paid order(s)`}
        />
        <Stat label="Revenue (30 days)" value={formatCents(stats.revenue30)} hint="Paid orders" />
        <Stat label="Customers" value={String(stats.customers)} hint={`${stats.leads} leads in CRM`} />
        <Stat label="Students" value={String(stats.students)} hint={`${stats.pageViews} page views`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Revenue — last 14 days</h2>
              <p className="text-xs text-zinc-600">Paid orders only, from your ledger-verified data.</p>
            </div>
            <Link href="/dashboard/analytics" className="text-xs text-nuvra-400 hover:text-nuvra-300">
              Full analytics →
            </Link>
          </div>
          <BarChart data={series} format={(v) => formatCents(v)} />
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-nuvra-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Your next moves</h2>
          </div>
          <div className="space-y-3">
            {moves.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="block rounded-lg border border-white/[0.07] bg-white/[0.03] p-3 transition hover:border-nuvra-500/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-200">{m.title}</span>
                  {m.done ? (
                    <Badge tone="green">Done</Badge>
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-nuvra-400" />
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{m.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-200">Recent orders</h2>
            <Link href="/dashboard/payments" className="text-xs text-nuvra-400 hover:text-nuvra-300">
              Payments →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-600">
              No orders yet. Publish something and share your link.
            </div>
          ) : (
            <div className="table-wrap border-0">
              <table className="data">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Buyer</th>
                    <th>Total</th>
                    <th>Nuvra fee</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="font-medium text-zinc-200">{o.number}</td>
                      <td className="text-zinc-400">{o.buyerEmail}</td>
                      <td className="tabular-nums">{formatCents(o.totalCents, o.currency)}</td>
                      <td className="tabular-nums text-zinc-500">
                        {formatCents(o.platformFeeCents, o.currency)}
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          <StatusBadge status={o.status} />
                          <StatusBadge status={o.mode} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-200">Quick actions</h2>
          <div className="space-y-2">
            {[
              { icon: Package, label: 'New product', href: '/dashboard/products?new=1' },
              { icon: FileText, label: 'New page', href: '/dashboard/pages?new=1' },
              { icon: GraduationCap, label: 'New course', href: '/dashboard/courses?new=1' },
              { icon: CreditCard, label: 'Payments & payouts', href: '/dashboard/payments' },
              { icon: Sparkles, label: 'Nuvra Academy', href: '/dashboard/academy' },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-2.5 rounded-lg border border-white/[0.07] px-3.5 py-2.5 text-sm text-zinc-400 transition hover:border-white/15 hover:text-zinc-200"
              >
                <a.icon className="h-4 w-4 text-nuvra-400" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
