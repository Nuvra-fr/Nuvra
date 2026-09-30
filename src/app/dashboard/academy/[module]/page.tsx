import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  ListChecks,
  PlayCircle,
  Target,
} from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseModules, quizAttempts, quizzes } from '@/db/schema';
import {
  completedLessonIds,
  computeModuleProgress,
  getAcademyAccess,
  getCourseLessons,
  getModuleBySlug,
  getModuleVideo,
} from '@/lib/academy';
import { Badge, InlineAlert, ProgressBar, Section } from '@/components/ui';
import { safeJson, cn } from '@/lib/utils';
import AcademyCurriculum from '@/components/academy/AcademyCurriculum';
import AcademyVideo from '@/components/academy/AcademyVideo';

export const metadata: Metadata = { title: 'Module — Académie Nuvra' };
export const dynamic = 'force-dynamic';

export default async function AcademyModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const ctx = await requireUser();
  const { module: moduleSlug } = await params;

  const access = await getAcademyAccess(ctx.user.id);
  if (!access.granted) redirect('/dashboard/academy?locked=1');
  const course = access.course!;
  const enrollment = access.enrollment!;

  const mod = await getModuleBySlug(course.id, moduleSlug);
  if (!mod) notFound();

  const all = await getCourseLessons(course.id, { publishedOnly: true });
  const lessons = all.filter((l) => l.moduleId === mod.id);
  if (lessons.length === 0) notFound();

  const done = await completedLessonIds(enrollment.id);
  const [progress, modules, moduleVideo] = await Promise.all([
    computeModuleProgress(enrollment.id, mod.id),
    db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, course.id))
      .all(),
    getModuleVideo(mod.id),
  ]);

  const quizLessonIds = lessons.map((l) => l.id);
  const quizzesRows = quizLessonIds.length
    ? await db
        .select()
        .from(quizzes)
        .where(inArray(quizzes.lessonId, quizLessonIds))
        .all()
    : [];
  const quizMap = new Map(quizzesRows.map((q) => [q.lessonId, q]));
  const attempts = quizzesRows.length
    ? await db
        .select()
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.enrollmentId, enrollment.id),
          ),
        )
        .all()
    : [];
  const attemptByQuiz = new Map<string, number>();
  for (const a of attempts) {
    attemptByQuiz.set(a.quizId, Math.max(attemptByQuiz.get(a.quizId) ?? 0, a.scorePct));
  }

  const orderedModules = [...modules].sort((a, b) => a.position - b.position);
  const idx = orderedModules.findIndex((m) => m.id === mod.id);
  const prevModule = idx > 0 ? orderedModules[idx - 1]! : null;
  const nextModule = idx >= 0 && idx < orderedModules.length - 1 ? orderedModules[idx + 1]! : null;

  const curriculum = orderedModules.map((m, mi) => {
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
        current: false,
        hasVideo: true,
        hasQuiz: !!quizMap.get(l.id),
        hasAction: !!l.nuvraAction,
      })),
    };
  });

  const firstOpen = lessons.find((l) => !done.has(l.id)) ?? lessons[0]!;
  const objectives = safeJson<string[]>(mod.objectives, []);

  return (
    <div className="min-h-[70vh]">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href="/dashboard/academy" className="btn-ghost btn-sm">
          <ArrowLeft className="h-3.5 w-3.5" /> Mon parcours
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-32">
            <ProgressBar value={progress.pct} />
          </span>
          <Badge tone={progress.complete ? 'green' : 'blue'}>
            {progress.done}/{progress.total} leçons
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[288px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-20 xl:h-fit">
          <AcademyCurriculum
            modules={curriculum}
            totalDone={done.size}
            totalAll={all.length}
            courseTitle={course.title}
          />
        </aside>

        <div className="min-w-0 space-y-5">
          <header>
            <div className="eyebrow">Module {idx + 1} sur {orderedModules.length}</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-zinc-50 md:text-[28px]">
              {mod.title}
            </h1>
            {mod.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
                {mod.description}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/academy/${mod.slug}/lecon/${firstOpen.slug}`}
                className="btn-primary"
              >
                {progress.done > 0 ? 'Reprendre ce module' : 'Commencer ce module'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Badge>
                <Clock className="h-3 w-3" />
                {lessons.reduce((s, l) => s + l.durationMin, 0)} min au total
              </Badge>
            </div>
          </header>

          {objectives.length > 0 ? (
            <Section title="Ce que vous allez apprendre">
              <ul className="grid gap-2 sm:grid-cols-2">
                {objectives.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300"
                  >
                    <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nuvra-400" />
                    {o}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {moduleVideo ? (
            <AcademyVideo assetId={moduleVideo.id} lessonId={firstOpen.id} title={mod.title} />
          ) : null}

          <Section
            title="Leçons du module"
            description="COMPRENDRE → APPRENDRE → VOIR → FAIRE → VALIDER → PASSER À LA SUITE"
          >
            <ol className="space-y-2">
              {lessons.map((l, i) => {
                const q = quizMap.get(l.id);
                const best = q ? attemptByQuiz.get(q.id) : undefined;
                return (
                  <li key={l.id}>
                    <Link
                      href={`/dashboard/academy/${mod.slug}/lecon/${l.slug}`}
                      className={cn(
                        'flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 transition duration-200 hover:border-white/15 hover:bg-white/[0.04]',
                        done.has(l.id) && 'border-emerald-500/20',
                      )}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-[11px] font-semibold text-zinc-500">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-zinc-200">
                          {l.title}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                          <span>{l.durationMin} min</span>
                          {l.type === 'lab' || l.type === 'workshop' ? (
                            <span className="text-nuvra-400">· atelier pratique</span>
                          ) : null}
                          {q ? <span>· quiz</span> : null}
                          {typeof best === 'number' ? (
                            <span className="text-zinc-600">· meilleur score {best} %</span>
                          ) : null}
                        </span>
                      </span>
                      {done.has(l.id) ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <span className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
                          {l.nuvraAction ? (
                            <PlayCircle className="h-4 w-4 text-nuvra-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-zinc-700" />
                          )}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {prevModule ? (
              <Link href={`/dashboard/academy/${prevModule.slug}`} className="btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Module précédent
              </Link>
            ) : (
              <span />
            )}
            {nextModule ? (
              <Link href={`/dashboard/academy/${nextModule.slug}`} className="btn-secondary">
                Module suivant <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/academy/completion" className="btn-secondary">
                Voir la fin de parcours <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <InlineAlert tone="info">
            <ListChecks className="mr-1 inline h-3.5 w-3.5" />
            Chaque leçon se termine par une application dans Nuvra. Sans objet
            réellement créé, la leçon n&apos;est pas terminée.
          </InlineAlert>
        </div>
      </div>
    </div>
  );
}
