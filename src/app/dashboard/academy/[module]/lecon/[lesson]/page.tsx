import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Clock,
  Download,
  FileText,
  Flag,
  ListChecks,
  Lock,
  Target,
  ExternalLink,
} from 'lucide-react';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { academySubmissions, certificates, quizAttempts, quizzes } from '@/db/schema';
import {
  completedLessonIds,
  getAcademyAccess,
  getAcademyModules,
  getCourseLessons,
  getModuleBySlug,
  getVideoForLesson,
  getVideoProgressRow,
} from '@/lib/academy';
import { Badge, InlineAlert, ProgressBar, Section } from '@/components/ui';
import { safeJson } from '@/lib/utils';
import AcademyCurriculum from '@/components/academy/AcademyCurriculum';
import AcademyVideo from '@/components/academy/AcademyVideo';
import LessonContent from '@/components/academy/LessonContent';
import LessonWorkspace from '@/components/academy/LessonWorkspace';
import MarkCompleteButton from '@/components/academy/MarkCompleteButton';
import NuvraActionButton from '@/components/academy/NuvraActionButton';
import QuizPanel from '@/components/academy/QuizPanel';

export const metadata: Metadata = { title: 'Leçon — Académie Nuvra' };
export const dynamic = 'force-dynamic';

interface ActionPayload {
  action: string;
  label: string;
  route: string;
  requiredEntity: string;
  completionCheck?: string;
  hint?: string;
}

export default async function AcademyLessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const ctx = await requireUser();
  const { module: moduleSlug, lesson: lessonSlug } = await params;

  // ── Access guard (server-side) ──────────────────────────────────────────
  const access = await getAcademyAccess(ctx.user.id);
  if (!access.granted) {
    redirect(`/dashboard/academy?locked=1&from=${moduleSlug}/${lessonSlug}`);
  }
  const course = access.course!;
  const enrollment = access.enrollment!;

  const mod = await getModuleBySlug(course.id, moduleSlug);
  if (!mod) notFound();

  const all = await getCourseLessons(course.id, { publishedOnly: true });
  const lesson = all.find((l) => l.slug === lessonSlug && l.moduleSlug === moduleSlug);
  if (!lesson) notFound();

  const [assetBundle, quiz, submission, videoProgress, cert] = await Promise.all([
    getVideoForLesson(lesson.id),
    db.select().from(quizzes).where(eq(quizzes.lessonId, lesson.id)).get(),
    db
      .select()
      .from(academySubmissions)
      .where(
        and(
          eq(academySubmissions.enrollmentId, enrollment.id),
          eq(academySubmissions.lessonId, lesson.id),
        ),
      )
      .get(),
    getVideoProgressRow(enrollment.id, lesson.id),
    db
      .select()
      .from(certificates)
      .where(eq(certificates.enrollmentId, enrollment.id))
      .get(),
  ]);

  const attempts = quiz
    ? await db
        .select()
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.enrollmentId, enrollment.id),
            eq(quizAttempts.quizId, quiz.id),
          ),
        )
        .all()
    : [];

  const done = await completedLessonIds(enrollment.id);
  const modules = await getAcademyModules(course.id);
  const index = all.findIndex((l) => l.id === lesson.id);
  const previous = index > 0 ? all[index - 1]! : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1]! : null;
  const pct = Math.round((done.size / Math.max(1, all.length)) * 100);

  const objectives = safeJson<string[]>(lesson.objectives, []);
  // Stored shape (see src/content/academy/types.ts → BuiltResource):
  // { title, kind, description, href? }. `href` is optional: most resources
  // are worksheets the learner completes inside the lesson, not downloads.
  const resources = safeJson<
    { title: string; kind: string; description: string; href?: string | null }[]
  >(lesson.resources, []);
  const criteria = safeJson<string[]>(lesson.completionCriteria, []);
  const action = lesson.nuvraAction
    ? (safeJson<ActionPayload | null>(lesson.nuvraAction, null) as ActionPayload | null)
    : null;

  const curriculum = modules.map((m, mi) => {
    const list = all.filter((l) => l.moduleId === m.id);
    return {
      id: m.id,
      slug: m.slug ?? m.id,
      title: m.title,
      position: mi,
      total: list.length,
      done: list.filter((l) => done.has(l.id)).length,
      lessons: list.map((l) => ({
        id: l.id,
        slug: l.slug ?? l.id,
        title: l.title,
        durationMin: l.durationMin,
        type: l.type,
        completed: done.has(l.id),
        current: l.id === lesson.id,
        hasVideo: true,
        hasQuiz: true,
        hasAction: !!l.nuvraAction,
      })),
    };
  });

  const returnTo = `/dashboard/academy/${moduleSlug}/lecon/${lessonSlug}`;
  const notesKey = `nuvra-academy:${ctx.user.id}:${lesson.id}:NOTE`;

  return (
    <div className="min-h-[70vh]">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href="/dashboard/academy" className="btn-ghost btn-sm">
          <ArrowLeft className="h-3.5 w-3.5" /> Mon parcours
        </Link>
        <span className="text-xs text-zinc-600">
          Module {lesson.modulePosition + 1} — {lesson.moduleTitle}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            Leçon {index + 1}/{all.length}
          </span>
          <span className="w-28">
            <ProgressBar value={pct} />
          </span>
          <Badge tone="blue">{pct} %</Badge>
          {cert ? (
            <Link href={`/certificate/${cert.code}`} className="btn-ghost btn-sm">
              <Award className="h-3.5 w-3.5 text-amber-400" /> Certificat
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[288px_minmax(0,1fr)_300px]">
        {/* ── Left: curriculum ───────────────────────────────────────────── */}
        <aside className="xl:sticky xl:top-20 xl:h-fit">
          <AcademyCurriculum
            modules={curriculum}
            totalDone={done.size}
            totalAll={all.length}
            courseTitle={course.title}
          />
        </aside>

        {/* ── Center: video, content, action, completion ──────────────────── */}
        <div className="min-w-0 space-y-5">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{lesson.type}</Badge>
              <Badge>
                <Clock className="h-3 w-3" /> {lesson.durationMin} min
              </Badge>
              {lesson.difficulty ? (
                <Badge>
                  {lesson.difficulty === 'beginner'
                    ? 'Débutant'
                    : lesson.difficulty === 'intermediate'
                      ? 'Intermédiaire'
                      : 'Avancé'}
                </Badge>
              ) : null}
              {done.has(lesson.id) ? <Badge tone="green">Terminée</Badge> : null}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-zinc-50 md:text-[28px]">
              {lesson.title}
            </h1>
            {lesson.shortDescription ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                {lesson.shortDescription}
              </p>
            ) : null}
          </header>

          {assetBundle?.asset ? (
            <AcademyVideo
              assetId={assetBundle.asset.id}
              lessonId={lesson.id}
              title={assetBundle.asset.title}
            />
          ) : (
            <InlineAlert tone="info">
              Cette leçon n&apos;a pas de package vidéo. Tout le contenu est
              disponible ci-dessous.
            </InlineAlert>
          )}

          {videoProgress && !videoProgress.completedAt && videoProgress.percent > 0 ? (
            <InlineAlert tone="warning">
              <Lock className="mr-1 inline h-3.5 w-3.5" />
              Reprise à {Math.floor(videoProgress.positionSec / 60)} min — votre
              position est mémorisée.
            </InlineAlert>
          ) : null}

          <section className="card card-body">
            <LessonContent content={lesson.content ?? ''} />
          </section>

          {lesson.exercise ? (
            <Section
              title="Exercice & atelier"
              description="Appliquez ce que vous venez de voir, puis validez."
            >
              <div className="mb-4 flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />
                <div className="whitespace-pre-wrap">{lesson.exercise}</div>
              </div>
              <LessonWorkspace
                storageKey={`nuvra-academy:${ctx.user.id}:${lesson.id}:EXERCISE`}
                lessonId={lesson.id}
                kind="EXERCISE"
                title="Mon travail"
                description="Vos réponses, vos liens, vos captures — conservées dans votre espace."
                initial={{
                  values: submission
                    ? safeJson<Record<string, string>>(submission.payload, {})
                    : {},
                  savedAt: submission?.updatedAt.toISOString() ?? null,
                }}
                fields={[
                  {
                    id: 'work',
                    label: 'Ce que j’ai réalisé',
                    hint: 'Décrivez l’objet créé, les réglages, les résultats obtenus.',
                    multiline: true,
                    placeholder:
                      'Ex. : j’ai créé le tunnel « Formation » avec 3 pages…',
                  },
                ]}
              />
            </Section>
          ) : null}

          {action ? (
            <NuvraActionButton action={action} returnTo={returnTo} />
          ) : null}

          {quiz ? (
            <QuizPanel
              quizId={quiz.id}
              title={quiz.title}
              passingScore={quiz.passingScore}
              bestScore={
                attempts.length
                  ? Math.max(...attempts.map((a) => a.scorePct))
                  : null
              }
              attempts={attempts.length}
              questions={safeJson<
                { question: string; options: string[]; explanation?: string }[]
              >(quiz.questions, [])}
            />
          ) : null}

          <LessonWorkspace
            storageKey={notesKey}
            lessonId={lesson.id}
            kind="NOTE"
            title="Mes notes"
            description="Une idée à tester, une phrase à retenir, une question à creuser."
            initial={{
              values: {},
              savedAt: null,
            }}
            fields={[
              {
                id: 'notes',
                label: 'Notes de la leçon',
                multiline: true,
                placeholder: 'Vos annotations…',
              },
            ]}
          />

          <div className="card card-body flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {previous ? (
              <Link
                href={`/dashboard/academy/${previous.moduleSlug}/lecon/${previous.slug}`}
                className="btn-ghost"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wide text-zinc-600">
                    Précédente
                  </span>
                  <span className="block truncate text-xs text-zinc-300">
                    {previous.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}

            <MarkCompleteButton
              lessonId={lesson.id}
              completed={done.has(lesson.id)}
              nextHref={
                next
                  ? `/dashboard/academy/${next.moduleSlug}/lecon/${next.slug}`
                  : '/academy/completion'
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {next ? (
              <Link
                href={`/dashboard/academy/${next.moduleSlug}/lecon/${next.slug}`}
                className="btn-secondary"
              >
                <span className="min-w-0 text-left">
                  <span className="block text-[10px] uppercase tracking-wide text-zinc-600">
                    Leçon suivante
                  </span>
                  <span className="block truncate text-xs text-zinc-300">
                    {next.title}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/academy/completion" className="btn-primary">
                Terminer le programme <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* ── Right: objectives, criteria, resources ─────────────────────── */}
        <aside className="space-y-4 xl:sticky xl:top-20 xl:h-fit">
          {objectives.length > 0 ? (
            <Section title="Objectifs" description="À la fin de cette leçon, vous saurez…">
              <ul className="space-y-2">
                {objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
                    <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nuvra-400" />
                    {o}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {criteria.length > 0 ? (
            <Section title="Critères de réussite">
              <ul className="space-y-2">
                {criteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-400">
                    <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {resources.length > 0 ? (
            <Section title="Ressources">
              <ul className="space-y-2">
                {resources.map((r, i) => {
                  const external = typeof r.href === 'string' && r.href.startsWith('http');
                  const inner = (
                    <>
                      {external ? (
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nuvra-400" />
                      ) : (
                        <Download className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nuvra-400" />
                      )}
                      <span className="min-w-0">
                        <span className="block font-medium">{r.title}</span>
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          {r.description}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={i}>
                      {r.href ? (
                        <a
                          href={r.href}
                          {...(external
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                          className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-300 transition duration-200 hover:border-white/15 hover:text-zinc-100"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-300">
                          {inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>
          ) : null}

          {lesson.type === 'lab' || lesson.type === 'workshop' ? (
            <InlineAlert tone="success">
              <FileText className="mr-1 inline h-3.5 w-3.5" />
              Atelier pratique : c&apos;est ici que se construit votre système.
              Ne passez pas à la suite sans avoir créé l&apos;objet dans Nuvra.
            </InlineAlert>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
