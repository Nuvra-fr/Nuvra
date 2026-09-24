import Link from 'next/link';
import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { GraduationCap } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, courseModules, enrollments, lessons } from '@/db/schema';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { formatCents } from '@/lib/money';
import { timeAgo } from '@/lib/utils';
import NewCourseButton from './NewCourseButton';

export const metadata: Metadata = { title: 'Courses' };

export default async function CoursesPage() {
  const ctx = await requireUser();
  const rows = db
    .select()
    .from(courses)
    .where(eq(courses.workspaceId, ctx.workspace.id))
    .orderBy(desc(courses.updatedAt))
    .all();

  const details = rows.map((c) => ({
    ...c,
    moduleCount: db.select({ id: courseModules.id }).from(courseModules).where(eq(courseModules.courseId, c.id)).all().length,
    lessonCount: db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, c.id)).all().length,
    studentCount: db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.courseId, c.id)).all().length,
  }));

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Build courses with modules, lessons, quizzes and certificates — then sell them anywhere."
        actions={<NewCourseButton />}
      />

      {details.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-8 w-8" />}
          title="No courses yet"
          description="Create your first course. You can sell it on your pages, funnels and the marketplace."
          action={<NewCourseButton />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((c) => (
            <div key={c.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/dashboard/courses/${c.id}`} className="text-sm font-semibold text-zinc-200 hover:text-nuvra-300">
                  {c.title}
                </Link>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-2 text-xs text-zinc-600">
                {c.moduleCount} modules · {c.lessonCount} lessons · {c.studentCount} students
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-zinc-100">{formatCents(c.priceCents, c.currency)}</span>
                <span className="text-xs text-zinc-600">{timeAgo(c.updatedAt)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/dashboard/courses/${c.id}`} className="btn-secondary flex-1 !py-2 !text-xs">
                  Edit
                </Link>
                <Link href={`/dashboard/courses/${c.id}/curriculum`} className="btn-ghost !py-2 !text-xs">
                  Curriculum
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
