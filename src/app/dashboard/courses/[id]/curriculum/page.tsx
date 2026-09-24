import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq, asc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseModules, courses, lessons, quizzes } from '@/db/schema';
import { PageHeader, StatusBadge } from '@/components/ui';
import CurriculumEditor from './CurriculumEditor';

export const metadata: Metadata = { title: 'Curriculum' };

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireUser();
  const { id } = await params;
  const course = db.select().from(courses).where(eq(courses.id, id)).get();
  if (!course || course.workspaceId !== ctx.workspace.id) notFound();

  const mods = db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, id))
    .orderBy(asc(courseModules.position))
    .all();

  const lessonRows = db.select().from(lessons).where(eq(lessons.courseId, id)).orderBy(asc(lessons.position)).all();
  const quizRows = db.select().from(quizzes).all();

  const data = mods.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: lessonRows
      .filter((l) => l.moduleId === m.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        isPreview: l.isPreview,
        hasQuiz: quizRows.some((q) => q.lessonId === l.id),
      })),
  }));
  const orphans = lessonRows.filter((l) => !l.moduleId);

  return (
    <div>
      <PageHeader
        title={course.title}
        description="Curriculum — modules and lessons. Learners progress through them in order."
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={course.status} />
            <Link href={`/dashboard/courses/${id}`} className="btn-secondary">
              Course settings
            </Link>
          </div>
        }
      />
      <CurriculumEditor courseId={id} modules={data} orphanLessons={orphans.map((l) => ({ id: l.id, title: l.title, type: l.type }))} />
    </div>
  );
}
