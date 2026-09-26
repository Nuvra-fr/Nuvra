import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, enrollments } from '@/db/schema';
import { PageHeader, StatusBadge, Stat, InlineAlert } from '@/components/ui';
import { formatCents } from '@/lib/money';
import CourseSettingsForm from './CourseSettingsForm';

export const metadata: Metadata = { title: 'Course settings' };

export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireUser();
  const { id } = await params;
  const course = await db.select().from(courses).where(eq(courses.id, id)).get();
  if (!course || course.workspaceId !== ctx.workspace.id) notFound();

  const students = (await db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.courseId, id)).all()).length;

  return (
    <div>
      <PageHeader
        title={course.title}
        description="Pricing, publication and marketing settings."
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={course.status} />
            <Link href={`/dashboard/courses/${id}/curriculum`} className="btn-secondary">
              Curriculum
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Stat label="Price" value={formatCents(course.priceCents, course.currency)} />
        <Stat label="Students" value={String(students)} />
        <Stat label="Published" value={course.publishedAt ? 'Yes' : 'No'} hint={course.publishedAt?.toISOString().slice(0, 10)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CourseSettingsForm
          courseId={id}
          initial={{
            title: course.title,
            description: course.description ?? '',
            price: (course.priceCents / 100).toString(),
            status: course.status,
            level: course.level,
            category: course.category ?? '',
            coverUrl: course.coverUrl ?? '',
          }}
        />

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-zinc-200">Public link</h3>
            <p className="mt-1 text-xs text-zinc-600">
              {course.status === 'PUBLISHED' ? (
                <>
                  Your course is live at{' '}
                  <a href={`/c/${course.slug}`} target="_blank" className="text-nuvra-400 hover:underline">
                    /c/{course.slug}
                  </a>
                </>
              ) : (
                'Publish the course to make /c/' + course.slug + ' accessible.'
              )}
            </p>
          </div>
          <InlineAlert tone="info">
            Platform fee reminder: on the <strong>Free</strong> plan Nuvra takes{' '}
            <strong>10 %</strong> of each sale. On <strong>Pro</strong> it&apos;s{' '}
            <strong>0 %</strong> (payment-processing fees stay separate). Your plan:{' '}
            <strong>{ctx.workspace.plan}</strong>.
          </InlineAlert>
        </div>
      </div>
    </div>
  );
}
