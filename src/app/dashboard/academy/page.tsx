import Link from 'next/link';
import type { Metadata } from 'next';
import { desc, eq, and } from 'drizzle-orm';
import { Award, Link2, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  certificates,
  courses,
  enrollments,
  orders,
  resellerProfiles,
} from '@/db/schema';
import { formatCents } from '@/lib/money';
import { appBaseUrl } from '@/lib/utils';
import { academyPriceCents, resellerBps } from '@/lib/config';
import { Badge, PageHeader, Stat, StatusBadge, Tabs } from '@/components/ui';
import CopyButton from './CopyButton';

export const metadata: Metadata = { title: 'Nuvra Academy' };

export default async function AcademyDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === 'reseller' ? 'reseller' : 'learn';

  const reseller = await db
    .select()
    .from(resellerProfiles)
    .where(eq(resellerProfiles.userId, ctx.user.id))
    .get();

  const hasAcademy = !!await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(enrollments.userId, ctx.user.id), eq(courses.isAcademy, true)))
    .get();

  const myEnrollments = await db
    .select({ enrollment: enrollments, course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, ctx.user.id))
    .orderBy(desc(enrollments.updatedAt))
    .all();

  // Reseller stats (platform sales attributed to this reseller)
  const resellerSales = reseller
    ? await db
        .select()
        .from(orders)
        .where(and(eq(orders.resellerId, reseller.id), eq(orders.status, 'PAID')))
        .all()
    : [];
  const gross = resellerSales.reduce((s, o) => s + o.totalCents, 0);
  const bps = await resellerBps();
  const yourCut = resellerSales.reduce((s, o) => s + (o.totalCents - o.platformFeeCents), 0);
  const nuvraCut = resellerSales.reduce((s, o) => s + o.platformFeeCents, 0);

  const resellerLink = reseller ? `${appBaseUrl()}/checkout?item=academy&reseller=${reseller.code}` : null;

  return (
    <div>
      <PageHeader
        title="Nuvra Academy"
        description="Learn the system — and optionally resell it with a 90/10 split."
        actions={
          !hasAcademy ? (
            <Link href={`/checkout?item=academy`} className="btn-primary">
              Get Academy — {formatCents(await academyPriceCents())}
            </Link>
          ) : null
        }
      />

      <Tabs
        active={tab === 'reseller' ? '/dashboard/academy?tab=reseller' : '/dashboard/academy'}
        items={[
          { href: '/dashboard/academy', label: 'My learning' },
          { href: '/dashboard/academy?tab=reseller', label: 'Reseller hub' },
        ]}
      />

      {tab === 'learn' ? (
        <div className="space-y-5">
          {!hasAcademy ? (
            <div className="card border-amber-500/25 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-300">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Nuvra Academy is a separate paid product</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                    The Nuvra platform stays free. Academy is the full 15-module program — and buying
                    it makes you eligible for the reseller program (you keep{' '}
                    <strong className="text-zinc-300">{bps / 100} %</strong> of attributed sales).
                  </p>
                </div>
                <Link href="/academy" className="btn-secondary">
                  Explore curriculum
                </Link>
              </div>
            </div>
          ) : null}

          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Enrolled courses</h2>
          {myEnrollments.length === 0 ? (
            <div className="card p-8 text-center text-sm text-zinc-600">
              You&apos;re not enrolled in any course yet. Browse the marketplace or grab Academy.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {await Promise.all(myEnrollments.map(async ({ enrollment, course }) => {
                const cert = await db
                  .select({ code: certificates.code })
                  .from(certificates)
                  .where(eq(certificates.enrollmentId, enrollment.id))
                  .get();
                return (
                  <div key={enrollment.id} className="card p-5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/dashboard/learn/${course.id}`}
                        className="text-sm font-semibold text-zinc-200 hover:text-nuvra-300"
                      >
                        {course.isAcademy ? '🎓 ' : ''}
                        {course.title}
                      </Link>
                      {enrollment.completedAt ? (
                        <Badge tone="green">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </Badge>
                      ) : (
                        <Badge>{enrollment.progressPct}%</Badge>
                      )}
                    </div>
                    {cert ? (
                      <div className="mt-2 text-xs text-amber-400">
                        <Award className="mr-1 inline h-3 w-3" />
                        Certificate {cert.code}
                      </div>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-zinc-600">
                        Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}
                      </span>
                      <Link href={`/dashboard/learn/${course.id}`} className="btn-secondary !px-3 !py-1.5 !text-xs">
                        {enrollment.completedAt ? 'Review' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                );
              }))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {!reseller || reseller.status !== 'ACTIVE' ? (
            <div className="card p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <TrendingUp className="h-4 w-4 text-nuvra-400" /> Reseller program
              </div>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                {hasAcademy
                  ? 'Your Academy purchase is recorded. Reseller activation is subject to the conditions defined by the Nuvra administration — once activated, your personal link and dashboard appear here.'
                  : 'Purchase Nuvra Academy to become eligible for the reseller program.'}
              </p>
              {!hasAcademy ? (
                <Link href="/checkout?item=academy" className="btn-primary mt-4 inline-flex">
                  Get Academy — {formatCents(await academyPriceCents())}
                </Link>
              ) : (
                <Badge tone="amber" className="mt-4">
                  {reseller?.status ?? 'PENDING'} — awaiting admin activation
                </Badge>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Academy revenue" value={formatCents(gross)} hint={`${resellerSales.length} sales`} />
                <Stat label="Your share" value={formatCents(yourCut)} tone="positive" hint={`${bps / 100} % split`} />
                <Stat label="Nuvra share" value={formatCents(nuvraCut)} hint="10 % platform" />
                <Stat label="Reseller status" value="ACTIVE" tone="positive" hint={`since ${reseller.activatedAt ? new Date(reseller.activatedAt).toLocaleDateString() : '—'}`} />
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                  <Link2 className="h-4 w-4 text-nuvra-400" /> Your personal sales link
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-xs text-nuvra-200">
                    {resellerLink}
                  </code>
                  <CopyButton value={resellerLink ?? ''} />
                </div>
                <p className="mt-2 text-[11px] text-zinc-600">
                  Sales attributed to this link pay you {bps / 100} % — displayed transparently in your
                  ledger and payouts. Payment-processing fees are always separate.
                </p>
              </div>

              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Buyer</th>
                      <th>Gross</th>
                      <th>You ({bps / 100}%)</th>
                      <th>Nuvra (10%)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resellerSales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-zinc-600">
                          No attributed sales yet — share your link.
                        </td>
                      </tr>
                    ) : (
                      resellerSales.map((o) => (
                        <tr key={o.id}>
                          <td className="font-medium text-zinc-200">{o.number}</td>
                          <td className="text-zinc-400">{o.buyerEmail}</td>
                          <td className="tabular-nums">{formatCents(o.totalCents)}</td>
                          <td className="tabular-nums text-emerald-300">{formatCents(o.totalCents - o.platformFeeCents)}</td>
                          <td className="tabular-nums text-zinc-500">{formatCents(o.platformFeeCents)}</td>
                          <td>
                            <div className="flex gap-1.5">
                              <StatusBadge status={o.status} />
                              <StatusBadge status={o.mode} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
