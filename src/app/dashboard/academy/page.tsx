import Link from 'next/link';
import type { Metadata } from 'next';
import { and, asc, desc, eq } from 'drizzle-orm';
import { Award, CheckCircle2, Link2, Sparkles, TrendingUp } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  certificates,
  courseModules,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  orders,
  resellerProfiles,
} from '@/db/schema';
import { formatCents } from '@/lib/money';
import { appBaseUrl } from '@/lib/utils';
import { academyPriceCents, resellerBps } from '@/lib/config';
import { Badge, EmptyState, Stat, StatusBadge, Tabs } from '@/components/ui';
import { AcademyCover } from '@/components/AcademyCover';
import {
  ProgramOutline,
  type OutlineModule,
} from '@/components/ProgramOutline';
import CopyButton from './CopyButton';

export const metadata: Metadata = { title: 'Académie Nuvra' };

export default async function AcademyDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === 'reseller' ? 'reseller' : 'learn';

  const price = await academyPriceCents();
  const bps = await resellerBps();

  // ── Programme ────────────────────────────────────────────────────────────
  const academyCourse = await db
    .select()
    .from(courses)
    .where(and(eq(courses.isAcademy, true), eq(courses.status, 'PUBLISHED')))
    .get();

  const modules = academyCourse
    ? await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, academyCourse.id))
        .orderBy(asc(courseModules.position))
        .all()
    : [];
  const academyLessons = academyCourse
    ? await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, academyCourse.id))
        .orderBy(asc(lessons.position))
        .all()
    : [];

  const academyEnrollment = academyCourse
    ? await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.userId, ctx.user.id),
            eq(enrollments.courseId, academyCourse.id),
          ),
        )
        .get()
    : undefined;

  const completedLessonIds = new Set(
    academyEnrollment
      ? (
          await db
            .select({ lessonId: lessonProgress.lessonId })
            .from(lessonProgress)
            .where(eq(lessonProgress.enrollmentId, academyEnrollment.id))
            .all()
        ).map((p) => p.lessonId)
      : [],
  );

  const outline: OutlineModule[] = modules.map((m) => {
    const modLessons = academyLessons.filter((l) => l.moduleId === m.id);
    const first = modLessons[0];
    return {
      id: m.id,
      title: m.title,
      lessonCount: modLessons.length,
      doneCount: academyEnrollment
        ? modLessons.filter((l) => completedLessonIds.has(l.id)).length
        : undefined,
      href:
        academyEnrollment && first
          ? `/dashboard/learn/${academyCourse!.id}?lesson=${first.id}`
          : undefined,
    };
  });

  const nextLesson =
    academyLessons.find((l) => !completedLessonIds.has(l.id)) ??
    academyLessons[0] ??
    null;

  // ── Mon apprentissage ────────────────────────────────────────────────────
  const reseller = await db
    .select()
    .from(resellerProfiles)
    .where(eq(resellerProfiles.userId, ctx.user.id))
    .get();

  const myEnrollments = await db
    .select({ enrollment: enrollments, course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, ctx.user.id))
    .orderBy(desc(enrollments.updatedAt))
    .all();

  // ── Revendeur ────────────────────────────────────────────────────────────
  const resellerSales = reseller
    ? await db
        .select()
        .from(orders)
        .where(
          and(eq(orders.resellerId, reseller.id), eq(orders.status, 'PAID')),
        )
        .all()
    : [];
  const gross = resellerSales.reduce((s, o) => s + o.totalCents, 0);
  const yourCut = resellerSales.reduce(
    (s, o) => s + (o.totalCents - o.platformFeeCents),
    0,
  );
  const nuvraCut = resellerSales.reduce((s, o) => s + o.platformFeeCents, 0);
  const resellerLink = reseller
    ? `${appBaseUrl()}/checkout?item=academy&reseller=${reseller.code}`
    : null;

  const hasAcademy = !!academyEnrollment;

  return (
    <div>
      <Tabs
        active={
          tab === 'reseller'
            ? '/dashboard/academy?tab=reseller'
            : '/dashboard/academy'
        }
        items={[
          { href: '/dashboard/academy', label: 'Mon parcours' },
          {
            href: '/dashboard/academy?tab=reseller',
            label: 'Espace revendeur',
          },
        ]}
      />

      {tab === 'learn' ? (
        <div className="stack-sections">
          <AcademyCover
            mode={hasAcademy ? 'learning' : 'discover'}
            moduleCount={modules.length || 15}
            lessonCount={academyLessons.length}
            progressPct={academyEnrollment?.progressPct}
            priceLabel={hasAcademy ? undefined : formatCents(price)}
            ctaHref={
              hasAcademy && academyCourse
                ? `/dashboard/learn/${academyCourse.id}${nextLesson ? `?lesson=${nextLesson.id}` : ''}`
                : '/checkout?item=academy'
            }
            ctaLabel={
              hasAcademy ? 'Continuer la formation' : "Commencer l'Académie"
            }
            secondaryHref={
              hasAcademy ? '/dashboard/academy?tab=reseller' : '/academy'
            }
            secondaryLabel={
              hasAcademy ? 'Programme revendeur' : 'Voir le programme'
            }
          />

          {outline.length > 0 ? (
            <section className="card overflow-hidden">
              <div className="card-head">
                <div>
                  <h2 className="section-title">Votre parcours</h2>
                  <p className="section-subtitle">
                    {modules.length} modules · {academyLessons.length} leçons
                  </p>
                </div>
                {hasAcademy ? (
                  <Badge tone="blue">
                    {academyEnrollment?.progressPct ?? 0}% terminé
                  </Badge>
                ) : null}
              </div>
              <ProgramOutline modules={outline} />
            </section>
          ) : null}

          {hasAcademy ? (
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="section-title">Mes formations</h2>
                  <p className="section-subtitle">
                    Cours achetés et formations suivies.
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="text-xs text-nuvra-400 hover:text-nuvra-300"
                >
                  Marketplace →
                </Link>
              </div>

              {myEnrollments.length === 0 ? (
                <EmptyState
                  title="Aucune formation en cours"
                  description="Explorez la marketplace ou commencez l'Académie pour démarrer un parcours."
                  action={
                    <Link href="/marketplace" className="btn-secondary">
                      Parcourir la marketplace
                    </Link>
                  }
                />
              ) : (
                <div className="grid-cards">
                  {await Promise.all(
                    myEnrollments.map(async ({ enrollment, course }) => {
                      const cert = await db
                        .select({ code: certificates.code })
                        .from(certificates)
                        .where(eq(certificates.enrollmentId, enrollment.id))
                        .get();
                      return (
                        <article
                          key={enrollment.id}
                          className="card card-hover card-body flex flex-col"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-semibold leading-snug text-zinc-200">
                              {course.title}
                            </h3>
                            {enrollment.completedAt ? (
                              <Badge tone="green">
                                <CheckCircle2 className="h-3 w-3" /> Terminé
                              </Badge>
                            ) : (
                              <Badge>{enrollment.progressPct}%</Badge>
                            )}
                          </div>

                          {course.isAcademy ? (
                            <div className="mt-2">
                              <Badge tone="blue">
                                <Sparkles className="h-3 w-3" /> Academy
                              </Badge>
                            </div>
                          ) : null}

                          {cert ? (
                            <p className="mt-2 text-xs text-amber-400">
                              <Award className="mr-1 inline h-3 w-3" />
                              Certificat {cert.code}
                            </p>
                          ) : null}

                          <p className="mt-3 text-xs text-zinc-600">
                            Inscrit le{' '}
                            {new Date(enrollment.createdAt).toLocaleDateString(
                              'fr-FR',
                            )}
                          </p>

                          <div className="mt-4 flex-1" />
                          <Link
                            href={`/dashboard/learn/${course.id}`}
                            className="btn-secondary btn-sm w-full justify-center"
                          >
                            {enrollment.completedAt ? 'Revoir' : 'Continuer'}
                          </Link>
                        </article>
                      );
                    }),
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card card-body flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Sparkles className="h-4 w-4 text-nuvra-400" />
                  <span className="section-title">
                    La plateforme reste gratuite
                  </span>
                </div>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-500">
                  L&apos;Académie est un produit à part. L&apos;acheter ouvre le
                  programme revendeur : vous conservez{' '}
                  <strong className="text-zinc-300">{bps / 100} %</strong> des
                  ventes attribuées.
                </p>
              </div>
              <Link href="/academy" className="btn-secondary shrink-0">
                Voir le programme
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="stack-sections">
          <div>
            <h1 className="page-title">
              {reseller && reseller.status === 'ACTIVE'
                ? 'Vendre l’Académie'
                : 'Programme revendeur'}
            </h1>
            <p className="page-subtitle">
              {reseller && reseller.status === 'ACTIVE'
                ? 'Vos ventes attribuées, vos gains et votre lien personnel.'
                : 'Vendez l’Académie avec votre lien personnel.'}
            </p>
          </div>

          {!reseller || reseller.status !== 'ACTIVE' ? (
            <section className="card card-body">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-nuvra-400" />
                <h2 className="section-title">Programme revendeur</h2>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                {hasAcademy
                  ? 'Votre achat est enregistré. L’activation est validée par l’administration Nuvra — votre lien et vos statistiques apparaîtront ici.'
                  : 'Achetez l’Académie pour devenir éligible au programme revendeur.'}
              </p>
              <div className="mt-5">
                {!hasAcademy ? (
                  <Link href="/checkout?item=academy" className="btn-primary">
                    Obtenir l&apos;Académie — {formatCents(price)}
                  </Link>
                ) : (
                  <Badge tone="amber">
                    {reseller?.status ?? 'PENDING'} — en attente d’activation
                  </Badge>
                )}
              </div>
            </section>
          ) : (
            <>
              <div className="grid-stats">
                <Stat
                  label="Chiffre d'affaires"
                  value={formatCents(gross)}
                  hint={`${resellerSales.length} ventes`}
                />
                <Stat
                  label="Votre part"
                  value={formatCents(yourCut)}
                  tone="positive"
                  hint={`${bps / 100} % du prix`}
                />
                <Stat
                  label="Part Nuvra"
                  value={formatCents(nuvraCut)}
                  hint={`${100 - bps / 100} % plateforme`}
                />
                <Stat
                  label="Statut revendeur"
                  value="ACTIF"
                  tone="positive"
                  hint={
                    reseller.activatedAt
                      ? `depuis le ${new Date(reseller.activatedAt).toLocaleDateString('fr-FR')}`
                      : '—'
                  }
                />
              </div>

              <section className="card card-body">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-nuvra-400" />
                  <h2 className="section-title">Votre lien de vente</h2>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-ink-900 px-3.5 py-2.5 text-xs text-nuvra-200">
                    {resellerLink}
                  </code>
                  <CopyButton value={resellerLink ?? ''} />
                </div>
                <p className="mt-2.5 text-xs text-zinc-500">
                  Chaque vente attribuée vous rapporte {bps / 100} %. Les frais
                  de paiement restent affichés séparément.
                </p>
              </section>

              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Commande</th>
                      <th>Acheteur</th>
                      <th>Montant</th>
                      <th>Vous ({bps / 100} %)</th>
                      <th>Nuvra ({100 - bps / 100} %)</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resellerSales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-zinc-600"
                        >
                          Aucune vente attribuée — partagez votre lien.
                        </td>
                      </tr>
                    ) : (
                      resellerSales.map((o) => (
                        <tr key={o.id}>
                          <td className="font-medium text-zinc-200">
                            {o.number}
                          </td>
                          <td className="text-zinc-400">{o.buyerEmail}</td>
                          <td className="tabular-nums">
                            {formatCents(o.totalCents)}
                          </td>
                          <td className="tabular-nums text-emerald-300">
                            {formatCents(o.totalCents - o.platformFeeCents)}
                          </td>
                          <td className="tabular-nums text-zinc-500">
                            {formatCents(o.platformFeeCents)}
                          </td>
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
