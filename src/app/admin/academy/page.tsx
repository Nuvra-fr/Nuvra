import type { Metadata } from 'next';
import Link from 'next/link';
import { asc, desc, eq } from 'drizzle-orm';
import {
  AlertTriangle,
  BarChart3,
  GraduationCap,
  Users,
  Video,
  ListChecks,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  certificates,
  courseModules,
  courses,
  enrollments,
  entitlements,
  lessonProgress,
  lessons,
  quizzes,
  users,
  videoAssets,
} from '@/db/schema';
import { getAcademyAnalytics, ACADEMY_ENTITLEMENT_KEY } from '@/lib/academy';
import { formatCents } from '@/lib/money';
import { EmptyState, InlineAlert, ProgressBar, Section, Stat, Tabs } from '@/components/ui';
import CurriculumManager from './CurriculumManager';
import StudentsManager from './StudentsManager';
import MediaManager, { type MediaVideo } from './MediaManager';

export const metadata: Metadata = { title: 'Académie — Administration' };
export const dynamic = 'force-dynamic';

export default async function AdminAcademyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const { tab } = await searchParams;
  const active =
    tab === 'students'
      ? '/admin/academy?tab=students'
      : tab === 'media'
        ? '/admin/academy?tab=media'
        : tab === 'analytics'
          ? '/admin/academy?tab=analytics'
          : '/admin/academy';

  const course =
    (await db.select().from(courses).where(eq(courses.isAcademy, true)).get()) ?? null;

  if (!course) {
    return (
      <EmptyState
        title="Formation Académie absente"
        description="Lancez `npm run db:seed` pour publier le programme Nuvra Academy (8 modules, 118 leçons) dans la base."
        icon={<GraduationCap className="h-5 w-5" />}
        action={
          <Link href="/admin" className="btn-secondary">
            Retour à l’administration
          </Link>
        }
      />
    );
  }

  const modules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, course.id))
    .orderBy(asc(courseModules.position))
    .all();

  const allLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.position))
    .all();

  const quizRows = await db.select().from(quizzes).all();
  const quizByLesson = new Map(quizRows.map((q) => [q.lessonId, q]));
  const videos = await db.select().from(videoAssets).all();
  const videoByLesson = new Map(
    videos.filter((v) => v.lessonId).map((v) => [v.lessonId!, v]),
  );
  const videoByModule = new Map(
    videos.filter((v) => v.moduleId).map((v) => [v.moduleId!, v]),
  );

  const enrolments = await db
    .select({ enrollment: enrollments, user: users })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(eq(enrollments.courseId, course.id))
    .orderBy(desc(enrollments.updatedAt))
    .all();

  const entitlementRows = await db
    .select()
    .from(entitlements)
    .where(eq(entitlements.key, ACADEMY_ENTITLEMENT_KEY))
    .all();
  const entitlementByUser = new Map(entitlementRows.map((e) => [e.userId, e]));

  const progressRows = await db.select().from(lessonProgress).all();
  const progressByEnrollment = new Map<string, number>();
  for (const p of progressRows) {
    if (p.completedAt) {
      progressByEnrollment.set(
        p.enrollmentId,
        (progressByEnrollment.get(p.enrollmentId) ?? 0) + 1,
      );
    }
  }

  const certCount = (
    await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, enrolments[0]?.user.id ?? 'none'))
      .all()
  ).length;
  void certCount;

  const analytics = await getAcademyAnalytics();
  const scripted = videos.filter((v) => v.status === 'SCRIPTED').length;
  const uploaded = videos.filter((v) => v.status === 'UPLOADED').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Nuvra Academy</h1>
        <p className="page-subtitle">
          {modules.length} modules · {allLessons.length} leçons ·{' '}
          {formatCents(course.priceCents)} ·{' '}
          {videos.length} packages vidéo ({uploaded} publiés, {scripted} en attente
          de fichier)
        </p>
      </div>

      <Tabs
        active={active}
        items={[
          { href: '/admin/academy', label: 'Curriculum' },
          { href: '/admin/academy?tab=media', label: 'Médias' },
          { href: '/admin/academy?tab=students', label: 'Apprenants' },
          { href: '/admin/academy?tab=analytics', label: 'Statistiques' },
        ]}
      />

      {active === '/admin/academy' ? (
        <div className="space-y-5">
          <InlineAlert tone="info">
            Le seed <code className="text-nuvra-200">npm run db:seed</code>{' '}
            crée les modules et les leçons manquants sans écraser vos
            modifications. <code className="text-nuvra-200">--force</code>{' '}
            réécrit le contenu des leçons existantes.
          </InlineAlert>
          <CurriculumManager
            courseId={course.id}
            modules={modules.map((m, i) => ({
              id: m.id,
              title: m.title,
              slug: m.slug ?? m.id,
              description: m.description,
              published: m.published,
              position: i,
              lessons: allLessons
                .filter((l) => l.moduleId === m.id)
                .map((l) => ({
                  id: l.id,
                  title: l.title,
                  slug: l.slug ?? l.id,
                  published: l.published,
                  type: l.type,
                  durationMin: l.durationMin,
                  isPreview: l.isPreview,
                  hasQuiz: !!quizByLesson.get(l.id),
                  quizId: quizByLesson.get(l.id)?.id ?? null,
                  hasVideo: !!videoByLesson.get(l.id),
                  hasAction: !!l.nuvraAction,
                })),
            }))}
            totalLessons={allLessons.length}
          />
        </div>
      ) : null}

      {active === '/admin/academy?tab=media' ? (
        <MediaManager
          modules={modules.map((m) => ({
            id: m.id,
            title: m.title,
            video: videoByModule.get(m.id)
              ? {
                  id: videoByModule.get(m.id)!.id,
                  status: videoByModule.get(m.id)!.status as MediaVideo['status'],
                  title: videoByModule.get(m.id)!.title,
                  durationSec: videoByModule.get(m.id)!.durationSec,
                  hasScript: !!videoByModule.get(m.id)!.script,
                  hasStoryboard: !!videoByModule.get(m.id)!.storyboard,
                  hasTranscript: !!videoByModule.get(m.id)!.transcript,
                  playbackUrl: videoByModule.get(m.id)!.playbackUrl,
                }
              : null,
          }))}
          lessons={allLessons
            .filter((l) => videoByLesson.has(l.id))
            .map((l) => {
              const v = videoByLesson.get(l.id)!;
              return {
                id: l.id,
                title: l.title,
                video: {
                  id: v.id,
                  status: v.status as MediaVideo['status'],
                  title: v.title,
                  durationSec: v.durationSec,
                  hasScript: !!v.script,
                  hasStoryboard: !!v.storyboard,
                  hasTranscript: !!v.transcript,
                  playbackUrl: v.playbackUrl,
                },
              };
            })}
        />
      ) : null}

      {active === '/admin/academy?tab=students' ? (
        <div className="space-y-5">
          <div className="grid-stats">
            <Stat label="Inscrits" value={String(enrolments.length)} />
            <Stat
              label="Accès actif"
              value={String(
                enrolments.filter((e) => entitlementByUser.get(e.user.id)?.status === 'ACTIVE')
                  .length,
              )}
              tone="positive"
            />
            <Stat
              label="Accès révoqué"
              value={String(
                enrolments.filter((e) => entitlementByUser.get(e.user.id)?.status === 'REVOKED')
                  .length,
              )}
              tone="negative"
            />
            <Stat
              label="Terminés"
              value={String(enrolments.filter((e) => e.enrollment.completedAt).length)}
            />
          </div>

          <StudentsManager
            rows={enrolments.map(({ enrollment, user }) => ({
              enrollmentId: enrollment.id,
              userId: user.id,
              name: user.name,
              email: user.email,
              source: enrollment.source,
              progressPct: enrollment.progressPct,
              completed: !!enrollment.completedAt,
              completedAt: enrollment.completedAt?.toISOString() ?? null,
              lastActivity: enrollment.updatedAt.toISOString(),
              doneLessons: progressByEnrollment.get(enrollment.id) ?? 0,
              totalLessons: allLessons.length,
              entitlement: entitlementByUser.get(user.id)?.status ?? 'NONE',
              entitlementNote: entitlementByUser.get(user.id)?.note ?? null,
            }))}
          />
        </div>
      ) : null}

      {active === '/admin/academy?tab=analytics' ? (
        <div className="space-y-5">
          <div className="grid-stats">
            <Stat label="Inscriptions" value={String(analytics.enrollments)} />
            <Stat
              label="En cours"
              value={String(analytics.activeStudents)}
              hint={`${analytics.averageProgress} % de progression moyenne`}
            />
            <Stat
              label="Terminés"
              value={String(analytics.completed)}
              tone="positive"
            />
            <Stat
              label="Score moyen aux quiz"
              value={analytics.quizSuccessRate === null ? '—' : `${analytics.quizSuccessRate} %`}
              hint="Sur toutes les tentatives"
            />
          </div>
          <div className="grid-stats">
            <Stat
              label="Chiffre d'affaires encaissé"
              value={formatCents(analytics.revenueCents)}
              tone="positive"
            />
            <Stat
              label="Remboursé"
              value={formatCents(analytics.refundsCents)}
              tone="negative"
              hint="Reversé selon la ventilation 90/10 de la vente"
            />
            <Stat
              label="Ventes via revendeur"
              value={String(analytics.resellerSales)}
              hint="Le reste est en vente directe"
            />
            <Stat
              label="Temps d'étude moyen"
              value={`${analytics.averageLearningMinutes} min`}
              hint="Par apprenant"
            />
          </div>

          <Section
            title="Progression par module"
            description="Leçons terminées par les apprenants, module par module."
          >
            <ul className="space-y-3">
              {analytics.moduleStats.map((m) => (
                <li key={m.moduleId}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-zinc-300">{m.title}</span>
                    <span className="shrink-0 tabular-nums text-zinc-500">
                      {m.done}/{m.total}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={m.pct} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Où les apprenants décrochent"
            description="Leçons avec le taux de complétion le plus faible."
          >
            {analytics.dropOff.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Pas encore assez de données — les métriques apparaîtront dès la
                première progression.
              </p>
            ) : (
              <ul className="space-y-3">
                {analytics.dropOff.map((l) => (
                  <li key={l.lessonId}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-zinc-300">{l.title}</span>
                      <span className="shrink-0 tabular-nums text-amber-300">
                        {l.pct} %
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={l.pct} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="Vidéos"
            description="Packages vidéo déclarés dans le programme."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="card card-body">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Video className="h-4 w-4 text-nuvra-400" /> Packages
                </div>
                <div className="mt-2 text-2xl font-semibold text-zinc-100">
                  {videos.length}
                </div>
              </div>
              <div className="card card-body">
                <div className="flex items-center gap-2 text-zinc-300">
                  <ListChecks className="h-4 w-4 text-amber-400" /> En attente de
                  fichier
                </div>
                <div className="mt-2 text-2xl font-semibold text-amber-300">
                  {scripted}
                </div>
              </div>
              <div className="card card-body">
                <div className="flex items-center gap-2 text-zinc-300">
                  <BarChart3 className="h-4 w-4 text-emerald-400" /> Lectures
                  terminées
                </div>
                <div className="mt-2 text-2xl font-semibold text-emerald-300">
                  {analytics.videoCompletions}
                </div>
              </div>
            </div>
            {scripted > 0 ? (
              <InlineAlert tone="warning">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                {scripted} package(s) vidéo sont encore des scripts : les
                apprenants voient le storyboard, les chapitres et la
                transcription, mais aucun lecteur. Déposez le fichier dans
                l&apos;onglet Médias pour l&apos;activer.
              </InlineAlert>
            ) : null}
          </Section>
        </div>
      ) : null}

      <p className="mt-8 text-xs text-zinc-600">
        <Users className="mr-1 inline h-3 w-3" />
        L&apos;administration Nuvra ne peut pas s&apos;attribuer un accès
        payant : utilisez un autre compte pour tester le parcours apprenant.
      </p>
    </div>
  );
}
