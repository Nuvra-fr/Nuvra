import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, asc, eq } from 'drizzle-orm';
import { CheckCircle2, Play, Users, Star, GraduationCap } from 'lucide-react';
import { db } from '@/lib/db';
import { courseModules, courses, enrollments, lessons, workspaces } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { formatCents } from '@/lib/money';
import { Logo } from '@/components/auth';
import { Badge, InlineAlert } from '@/components/ui';
import EnrollButton from './EnrollButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function load(slug: string) {
  const course = db.select().from(courses).where(eq(courses.slug, slug)).get();
  if (!course || course.status !== 'PUBLISHED') return null;
  const ws = db.select().from(workspaces).where(eq(workspaces.id, course.workspaceId)).get();
  const mods = db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, course.id))
    .orderBy(asc(courseModules.position))
    .all();
  const ls = db.select().from(lessons).where(eq(lessons.courseId, course.id)).orderBy(asc(lessons.position)).all();
  return { course, ws, mods, ls };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) return { title: 'Course' };
  return {
    title: found.course.title,
    description: found.course.description ?? undefined,
    openGraph: { title: found.course.title, type: 'article' },
  };
}

export default async function PublicCoursePage({ params }: Props) {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) notFound();
  const { course, ws, mods, ls } = found;

  const ctx = await getSession();
  const enrolled = ctx
    ? db
        .select({ id: enrollments.id, progressPct: enrollments.progressPct })
        .from(enrollments)
        .where(and(eq(enrollments.userId, ctx.user.id), eq(enrollments.courseId, course.id)))
        .get()
    : null;

  const studentCount = db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.courseId, course.id)).all().length;
  const previewLessons = ls.filter((l) => l.isPreview);
  const isFree = course.priceCents === 0;

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="btn-ghost text-sm">Marketplace</Link>
            {ctx ? (
              <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
            ) : (
              <Link href="/login" className="btn-secondary">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{course.level}</Badge>
              {course.category ? <Badge>{course.category}</Badge> : null}
              {isFree ? <Badge tone="green">Free</Badge> : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl whitespace-pre-wrap text-zinc-400">{course.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {studentCount} students
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" /> {mods.length} modules · {ls.length} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400" /> Taught by {ws?.name ?? 'Creator'}
              </span>
            </div>

            {previewLessons.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Free preview</h2>
                <div className="mt-3 space-y-2">
                  {previewLessons.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-ink-900 px-4 py-3 text-sm text-zinc-300"
                    >
                      <Play className="h-4 w-4 text-nuvra-400" />
                      {l.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Curriculum</h2>
              <div className="mt-3 space-y-3">
                {mods.map((m, mi) => {
                  const modLessons = ls.filter((l) => l.moduleId === m.id);
                  return (
                    <div key={m.id} className="rounded-xl border border-white/[0.07] bg-ink-900/70">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-semibold text-zinc-200">
                          {mi + 1}. {m.title}
                        </span>
                        <span className="text-xs text-zinc-600">{modLessons.length} lessons</span>
                      </div>
                      <div className="border-t border-white/[0.05] px-4 py-2">
                        {modLessons.map((l) => (
                          <div key={l.id} className="flex items-center justify-between py-1.5 text-xs text-zinc-500">
                            <span>{l.title}</span>
                            {l.isPreview ? <Badge tone="blue">Preview</Badge> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Buy card */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="card p-6">
              <div className="text-3xl font-semibold text-white">{formatCents(course.priceCents, course.currency)}</div>
              <div className="mt-1 text-xs text-zinc-600">
                One-time · lifetime access
              </div>

              <div className="mt-5">
                {enrolled ? (
                  <Link href={`/dashboard/learn/${course.id}`} className="btn-primary w-full">
                    Continue learning — {enrolled.progressPct}%
                  </Link>
                ) : ctx && isFree ? (
                  <EnrollButton courseId={course.id} />
                ) : ctx ? (
                  <Link href={`/checkout?item=course:${course.id}`} className="btn-primary w-full">
                    Enroll now
                  </Link>
                ) : (
                  <Link href={`/checkout?item=course:${course.id}`} className="btn-primary w-full">
                    Sign in & enroll — {formatCents(course.priceCents)}
                  </Link>
                )}
              </div>

              <ul className="mt-5 space-y-2 text-xs text-zinc-500">
                {[
                  'Full lifetime access',
                  'Progress tracking & certificate',
                  'Quizzes with instant feedback',
                  isFree ? 'Free — no card needed' : 'Secure checkout',
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              {!ctx && !isFree ? (
                <div className="mt-4">
                  <InlineAlert tone="info">
                    An account is required so your progress is saved after purchase.
                  </InlineAlert>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
