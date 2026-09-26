import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, asc, eq } from 'drizzle-orm';
import { ArrowLeft, CheckCircle2, Circle, Award } from 'lucide-react';
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

export const metadata: Metadata = { title: 'Learning' };
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

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  if (!course) notFound();

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, ctx.user.id), eq(enrollments.courseId, courseId)))
    .get();
  if (!enrollment) notFound();

  const mods = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(asc(courseModules.position))
    .all();
  const ls = await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.position)).all();
  const completed = new Set(
    (await db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(eq(lessonProgress.enrollmentId, enrollment.id))
      .all())
      .map((p) => p.lessonId),
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
          <div className="flex items-center gap-2">
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

      <div className="mb-5">
        <ProgressBar value={enrollment.progressPct} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Curriculum sidebar */}
        <aside className="card h-fit overflow-hidden">
          <div className="border-b border-white/[0.07] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Curriculum
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {mods.map((m, mi) => {
              const modLessons = ls.filter((l) => l.moduleId === m.id);
              return (
                <div key={m.id} className="mb-2">
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                    {mi + 1}. {m.title}
                  </div>
                  {modLessons.map((l) => (
                    <Link
                      key={l.id}
                      href={`/dashboard/learn/${courseId}?lesson=${l.id}`}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs transition',
                        current?.id === l.id ? 'bg-nuvra-600/15 text-nuvra-200' : 'text-zinc-400 hover:bg-white/[0.05]',
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
        <div className="card min-h-[60vh] p-6">
          {current ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-zinc-600">{current.type} lesson</div>
                  <h2 className="mt-1 text-xl font-semibold text-zinc-100">{current.title}</h2>
                </div>
                <CompleteLessonButton
                  courseId={courseId}
                  lessonId={current.id}
                  done={completed.has(current.id)}
                />
              </div>

              <div className="mt-6 whitespace-pre-wrap leading-relaxed text-zinc-300">
                {current.type === 'video' && current.content ? (
                  <div className="mb-4">
                    <a
                      href={current.content}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2 rounded-lg border border-nuvra-500/40 bg-nuvra-500/10 px-4 py-2.5 text-sm text-nuvra-200 hover:bg-nuvra-500/20"
                    >
                      ▶ Watch video
                    </a>
                  </div>
                ) : null}
                {current.content ?? 'This lesson has no written content yet.'}
              </div>

              {current.resourceUrl ? (
                <a
                  href={current.resourceUrl}
                  target="_blank"
                  rel="noopener"
                  className="mt-6 inline-block rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-white/25"
                >
                  ⬇ Download resource
                </a>
              ) : null}

              <div className="mt-8 flex justify-between border-t border-white/[0.07] pt-5 text-sm">
                {(() => {
                  const idx = ls.findIndex((l) => l.id === current.id);
                  const prev = idx > 0 ? ls[idx - 1] : null;
                  const next = idx < ls.length - 1 ? ls[idx + 1] : null;
                  return (
                    <>
                      {prev ? (
                        <Link href={`/dashboard/learn/${courseId}?lesson=${prev.id}`} className="btn-ghost">
                          ← {prev.title}
                        </Link>
                      ) : (
                        <span />
                      )}
                      {next ? (
                        <Link href={`/dashboard/learn/${courseId}?lesson=${next.id}`} className="btn-secondary">
                          {next.title} →
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
            <p className="text-sm text-zinc-600">This course has no lessons yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
