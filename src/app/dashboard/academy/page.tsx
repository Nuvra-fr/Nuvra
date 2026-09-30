import Link from 'next/link';
import type { Metadata } from 'next';
import { and, asc, desc, eq } from 'drizzle-orm';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Link2,
  Target,
} from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  certificates,
  courseModules,
  courses,
  enrollments,
  orders,
  resellerProfiles,
} from '@/db/schema';
import { formatCents } from '@/lib/money';
import { appBaseUrl } from '@/lib/utils';
import { academyPriceCents, resellerBps } from '@/lib/config';
import { Badge, EmptyState, InlineAlert, ProgressBar, Stat, Tabs } from '@/components/ui';
import { AcademyCover } from '@/components/AcademyCover';
import { ProgramOutline, type OutlineModule } from '@/components/ProgramOutline';
import {
  computeCourseProgress,
  completedLessonIds,
  getAcademyAccess,
  getAcademyAnalytics,
  getCourseLessons,
  getResumeTarget,
} from '@/lib/academy';
import CopyButton from './CopyButton';

export const metadata: Metadata = { title: 'Mon parcours — Académie Nuvra' };
export const dynamic = 'force-dynamic';

export default async function AcademyDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; locked?: string; from?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === 'reseller' ? 'reseller' : 'learn';
  const locked = sp.locked === '1';

  const price = await academyPriceCents();
  const bps = await resellerBps();

  // ── Access (entitlement) + programme ─────────────────────────────────────
  const access = await getAcademyAccess(ctx.user.id);
  const course = access.course;
  const modules = course
    ? await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, course.id))
        .orderBy(asc(courseModules.position))
        .all()
    : [];
  const allLessons = course ? await getCourseLessons(course.id) : [];
  const moduleCount = modules.length;
  const lessonCount = allLessons.length;

  const enrollment = access.enrollment;
  const done = enrollment ? await completedLessonIds(enrollment.id) : new Set<string>();
  const progress = enrollment ? await computeCourseProgress(enrollment.id) : null;
  const resume = enrollment ? await getResumeTarget(enrollment.id) : null;

  const outline: OutlineModule[] = modules.map((m) => {
    const list = allLessons.filter((l) => l.moduleId === m.id);
    return {
      id: m.id,
      title: m.title,
      lessonCount: list.length,
      doneCount: done.size ? list.filter((l) => done.has(l.id)).length : 0,
      href: access.granted ? `/dashboard/academy/${m.slug}` : undefined,
      locked: !access.granted,
    };
  });

  // ── Reseller ──────────────────────────────────────────────────────────────
  const reseller = await db
    .select()
    .from(resellerProfiles)
    .where(eq(resellerProfiles.userId, ctx.user.id))
    .get();
  const resellerSales = reseller
    ? await db
        .select()
        .from(orders)
        .where(and(eq(orders.resellerId, reseller.id), eq(orders.status, 'PAID')))
        .all()
    : [];
  const gross = resellerSales.reduce((s, o) => s + o.totalCents, 0);
  const yourCut = resellerSales.reduce((s, o) => s + (o.totalCents - o.platformFeeCents), 0);
  const nuvraCut = resellerSales.reduce((s, o) => s + o.platformFeeCents, 0);
  const resellerLink = reseller
    ? `${appBaseUrl()}/checkout?item=academy&reseller=${reseller.code}`
    : null;

  const myEnrollments = await db
    .select({ enrollment: enrollments, course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, ctx.user.id))
    .orderBy(desc(enrollments.updatedAt))
    .all();

  const cert = enrollment
    ? await db
        .select()
        .from(certificates)
        .where(eq(certificates.enrollmentId, enrollment.id))
        .get()
    : null;

  const analytics = access.granted ? await getAcademyAnalytics() : null;

  return (
    <div>
      <Tabs
        active={tab === 'reseller' ? '/dashboard/academy?tab=reseller' : '/dashboard/academy'}
        items={[
          { href: '/dashboard/academy', label: 'Mon parcours' },
          { href: '/dashboard/academy?tab=reseller', label: 'Espace revendeur' },
        ]}
      />

      {tab === 'learn' ? (
        <div className="stack-sections">
          {locked && !access.granted ? (
            <InlineAlert tone="warning">
              <Lock className="mr-1 inline h-3.5 w-3.5" />
              Cette leçon fait partie de la formation payante. Votre accès
              Académie n&apos;est pas actif — voici comment l&apos;ouvrir.
            </InlineAlert>
          ) : null}

          {access.reason === 'REVOKED' ? (
            <InlineAlert tone="error">
              Votre accès à l&apos;Académie a été suspendu (remboursement ou
              révocation administrative). Votre historique — leçons
              terminées, quiz, certificat — est conservé. Contactez le support
              pour le réactiver.
            </InlineAlert>
          ) : null}

          <AcademyCover
            mode={access.granted ? 'learning' : 'discover'}
            moduleCount={moduleCount}
            lessonCount={lessonCount}
            progressPct={progress?.pct}
            ctaHref={
              access.granted && resume
                ? `/dashboard/academy/${resume.moduleSlug}/lecon/${resume.lessonSlug}`
                : '/academy'
            }
            ctaLabel={
              access.granted
                ? progress?.completed
                  ? 'Revoir le programme'
                  : progress && progress.done > 0
                    ? 'Continuer mon parcours'
                    : 'Commencer le module 1'
                : 'Découvrir le programme'
            }
            secondaryHref={access.granted ? '/academy/completion' : undefined}
            secondaryLabel={access.granted ? 'Le projet final' : undefined}
            priceLabel={formatCents(price)}
          />

          {/* ── Reprendre exactement où l'on s'est arrêté ───────────────── */}
          {access.granted && resume ? (
            <section className="card overflow-hidden">
              <div className="card-head">
                <div>
                  <h2 className="section-title">Reprendre mon parcours</h2>
                  <p className="section-subtitle">
                    Leçon {resume.lessonIndex}/{resume.totalLessons} — Module{' '}
                    {modules.findIndex((m) => m.title === resume.moduleTitle) + 1}
                  </p>
                </div>
                <Badge tone="blue">{resume.pct} %</Badge>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="eyebrow">
                      {resume.moduleTitle ?? 'Programme'}
                    </div>
                    <p className="mt-1.5 text-base font-semibold text-zinc-100">
                      {resume.lessonTitle}
                    </p>
                    {resume.videoPositionSec > 0 ? (
                      <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        <Clock className="h-3.5 w-3.5" /> Vidéo arrêtée à{' '}
                        {Math.floor(resume.videoPositionSec / 60)} min{' '}
                        {Math.floor(resume.videoPositionSec % 60)} s
                      </p>
                    ) : null}
                    <div className="mt-4 max-w-md">
                      <ProgressBar value={progress?.pct ?? 0} />
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/academy/${resume.moduleSlug}/lecon/${resume.lessonSlug}`}
                    className="btn-primary"
                  >
                    <PlayCircle className="h-4 w-4" /> Reprendre
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          {/* ── Modules ─────────────────────────────────────────────────── */}
          {access.granted ? (
            <section className="card overflow-hidden">
              <div className="card-head">
                <div>
                  <h2 className="section-title">Le programme</h2>
                  <p className="section-subtitle">
                    {moduleCount} modules · {lessonCount} leçons · votre
                    progression est enregistrée à chaque étape
                  </p>
                </div>
                {analytics ? (
                  <Link href="/dashboard/analytics" className="btn-ghost btn-sm">
                    <BarChart3 className="h-3.5 w-3.5" /> Mes statistiques
                  </Link>
                ) : null}
              </div>
              <ProgramOutline modules={outline} />
            </section>
          ) : (
            <section className="card overflow-hidden">
              <div className="card-head">
                <div>
                  <h2 className="section-title">Au programme</h2>
                  <p className="section-subtitle">
                    {moduleCount} modules · {lessonCount} leçons
                  </p>
                </div>
              </div>
              <ProgramOutline modules={outline} />
            </section>
          )}

          {/* ── Certificat ──────────────────────────────────────────────── */}
          {cert ? (
            <section className="card card-body flex flex-wrap items-center gap-4">
              <Award className="h-6 w-6 text-amber-400" />
              <div className="min-w-0 flex-1">
                <h2 className="section-title">Certificat obtenu</h2>
                <p className="section-subtitle">
                  Code {cert.code} · émis le{' '}
                  {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Link href={`/certificate/${cert.code}`} className="btn-secondary">
                Voir la page publique
              </Link>
            </section>
          ) : null}

          {/* ── Offre quand pas d'accès ────────────────────────────────── */}
          {!access.granted ? (
            <section className="card card-body">
              <div className="flex flex-wrap items-center gap-4">
                <Sparkles className="h-5 w-5 text-nuvra-400" />
                <div className="min-w-0 flex-1">
                  <h2 className="section-title">
                    Débloquer les {lessonCount} leçons
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-500">
                    Un accès à vie, mis à jour avec chaque nouveau module. Vous
                    construisez votre produit, votre tunnel, votre système
                    d&apos;acquisition et vos automations directement dans Nuvra.
                  </p>
                </div>
                <Link href="/academy" className="btn-primary shrink-0">
                  Voir l&apos;offre — {formatCents(price)}
                </Link>
              </div>
            </section>
          ) : null}

          {/* ── Mes autres formations ──────────────────────────────────── */}
          <section>
            <h2 className="section-title mb-3">Mes autres formations</h2>
            {myEnrollments.filter((e) => !e.course.isAcademy).length === 0 ? (
              <EmptyState
                title="Aucune autre formation"
                description="La marketplace Nuvra propose des formations créées par des créateurs. Elles s’ajoutent à votre parcours sans le remplacer."
                action={
                  <Link href="/dashboard/marketplace" className="btn-secondary">
                    Parcourir la marketplace
                  </Link>
                }
              />
            ) : (
              <div className="grid-cards">
                {myEnrollments
                  .filter((e) => !e.course.isAcademy)
                  .map(({ enrollment: e, course: c }) => (
                    <article
                      key={e.id}
                      className="card card-hover card-body flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold leading-snug text-zinc-200">
                          {c.title}
                        </h3>
                        {e.completedAt ? (
                          <Badge tone="green">
                            <CheckCircle2 className="h-3 w-3" /> Terminé
                          </Badge>
                        ) : (
                          <Badge>{e.progressPct} %</Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-zinc-600">
                        Inscrit le{' '}
                        {new Date(e.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="mt-4 flex-1" />
                      <Link
                        href={`/dashboard/learn/${c.id}`}
                        className="btn-secondary btn-sm w-full justify-center"
                      >
                        {e.completedAt ? 'Revoir' : 'Continuer'}
                      </Link>
                    </article>
                  ))}
              </div>
            )}
          </section>
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

          <div className="card card-body flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-zinc-200">
                <Sparkles className="h-4 w-4 text-nuvra-400" />
                <span className="section-title">La plateforme reste gratuite</span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-500">
                L&apos;Académie est un produit payant distinct de la plateforme
                Nuvra. L&apos;acheter ouvre en plus le programme revendeur : vous
                conservez <strong className="text-zinc-300">{bps / 100} %</strong>{' '}
                des ventes attribuées. Un compte Nuvra seul ne donne aucun droit
                de revente.
              </p>
            </div>
            <Link href="/academy" className="btn-secondary shrink-0">
              Voir le programme
            </Link>
          </div>

          {!reseller || reseller.status !== 'ACTIVE' ? (
            <section className="card card-body">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-nuvra-400" />
                <h2 className="section-title">Programme revendeur</h2>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                {access.granted
                  ? 'Votre achat est enregistré. L’activation est validée par l’administration Nuvra — votre lien et vos statistiques apparaîtront ici.'
                  : 'Achetez l’Académie pour devenir éligible au programme revendeur.'}
              </p>
              <div className="mt-5">
                {!access.granted ? (
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
                  de paiement restent affichés séparément, jamais fusionnés
                  avec votre commission.
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
                        <td colSpan={6} className="py-10 text-center text-zinc-600">
                          Aucune vente attribuée — partagez votre lien.
                        </td>
                      </tr>
                    ) : (
                      resellerSales.map((o) => (
                        <tr key={o.id}>
                          <td className="font-medium text-zinc-200">{o.number}</td>
                          <td className="text-zinc-400">{o.buyerEmail}</td>
                          <td className="tabular-nums">{formatCents(o.totalCents)}</td>
                          <td className="tabular-nums text-emerald-300">
                            {formatCents(o.totalCents - o.platformFeeCents)}
                          </td>
                          <td className="tabular-nums text-zinc-500">
                            {formatCents(o.platformFeeCents)}
                          </td>
                          <td>
                            <Target className="h-3.5 w-3.5 text-zinc-600" />
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
