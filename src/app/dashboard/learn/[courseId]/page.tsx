import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, asc, eq } from 'drizzle-orm';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Download,
  Play,
} from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  certificates,
  courseModules,
  courses,
  enrollments,
  lessonProgress,
  lessons,
} from '@/db/schema';
import { Badge, ProgressBar, PageHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import CompleteLessonButton from './CompleteLessonButton';

export const metadata: Metadata = { title: 'Apprentissage' };
export const dynamic = 'force-dynamic';

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const ctx = await requireUser();
  const { courseId } = await params;
  const sp = await searchParams;

  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .get();
  if (!course) notFound();

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, ctx.user.id),
        eq(enrollments.courseId, courseId),
      ),
    )
    .get();
  if (!enrollment) notFound();

  const mods = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(asc(courseModules.position))
    .all();
  const ls = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(asc(lessons.position))
    .all();
  const completed = new Set(
    (
      await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(eq(lessonProgress.enrollmentId, enrollment.id))
        .all()
    ).map((p) => p.lessonId),
  );

  const current = ls.find((l) => l.id === sp.lesson) ?? ls[0] ?? null;
  const cert = await db
    .select()
    .from(certificates)
    .where(eq(certificates.enrollmentId, enrollment.id))
    .get();

  return (
    <div>
      <PageHeader
        title={course.title}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {cert ? (
              <Badge tone="amber">
                <Award className="h-3 w-3" /> Certificate {cert.code}
              </Badge>
            ) : null}
            <Badge tone="blue">{enrollment.progressPct}% complete</Badge>
            <Link href="/dashboard/academy" className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> My learning
            </Link>
          </div>
        }
      />

      <div className="mb-6">
        <ProgressBar value={enrollment.progressPct} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Curriculum sidebar */}
        <aside className="card h-fit overflow-hidden">
          <div className="card-head eyebrow">Curriculum</div>
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {mods.map((m, mi) => {
              const modLessons = ls.filter((l) => l.moduleId === m.id);
              return (
                <div key={m.id} className="mb-2">
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-600">
                    {mi + 1}. {m.title}
                  </div>
                  {modLessons.map((l) => (
                    <Link
                      key={l.id}
                      href={`/dashboard/learn/${courseId}?lesson=${l.id}`}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition duration-200 ease-smooth',
                        current?.id === l.id
                          ? 'bg-nuvra-600/15 text-nuvra-200'
                          : 'text-zinc-400 hover:bg-white/[0.05]',
                      )}
                    >
                      {completed.has(l.id) ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                      )}
                      <span className="truncate">{l.title}</span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Lesson content */}
        <div className="card card-body min-h-[60vh]">
          {current ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="eyebrow">{current.type} lesson</div>
                  <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.01em] text-zinc-100">
                    {current.title}
                  </h2>
                </div>
                <CompleteLessonButton
                  courseId={courseId}
                  lessonId={current.id}
                  done={completed.has(current.id)}
                />
              </div>

              <div className="mt-6 max-w-3xl whitespace-pre-wrap leading-relaxed text-zinc-300">
                {current.type === 'video' && current.content ? (
                  <div className="mb-4">
                    <a
                      href={current.content}
                      target="_blank"
                      rel="noopener"
                      className="btn-secondary border-nuvra-500/35 bg-nuvra-500/10 text-nuvra-200 hover:bg-nuvra-500/15"
                    >
                      <Play className="h-4 w-4" /> Watch video
                    </a>
                  </div>
                ) : null}
                {current.content ??
                  'Cette leçon n’a pas encore de contenu écrit.'}
              </div>

              {current.resourceUrl ? (
                <a
                  href={current.resourceUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn-secondary btn-sm mt-6"
                >
                  <Download className="h-3.5 w-3.5" /> Télécharger la ressource
                </a>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
                {(() => {
                  const idx = ls.findIndex((l) => l.id === current.id);
                  const prev = idx > 0 ? ls[idx - 1] : null;
                  const next = idx < ls.length - 1 ? ls[idx + 1] : null;
                  return (
                    <>
                      {prev ? (
                        <Link
                          href={`/dashboard/learn/${courseId}?lesson=${prev.id}`}
                          className="btn-ghost min-w-0"
                        >
                          <ArrowLeft className="h-4 w-4 shrink-0" />
                          <span className="truncate">{prev.title}</span>
                        </Link>
                      ) : (
                        <span />
                      )}
                      {next ? (
                        <Link
                          href={`/dashboard/learn/${courseId}?lesson=${next.id}`}
                          className="btn-secondary min-w-0"
                        >
                          <span className="truncate">{next.title}</span>
                          <ArrowRight className="h-4 w-4 shrink-0" />
                        </Link>
                      ) : (
                        <span />
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-600">
              Cette formation n&apos;a pas encore de leçon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
