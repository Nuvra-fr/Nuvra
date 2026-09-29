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

export const metadata: Metadata = { title: 'Paramètres de la formation' };

export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireUser();
  const { id } = await params;
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .get();
  if (!course || course.workspaceId !== ctx.workspace.id) notFound();

  const students = (
    await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(eq(enrollments.courseId, id))
      .all()
  ).length;

  return (
    <div>
      <PageHeader
        title={course.title}
        description="Prix, publication et réglages marketing."
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={course.status} />
            <Link
              href={`/dashboard/courses/${id}/curriculum`}
              className="btn-secondary"
            >
              Curriculum
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Stat
          label="Prix"
          value={formatCents(course.priceCents, course.currency)}
        />
        <Stat label="Élèves" value={String(students)} />
        <Stat
          label="Publiées"
          value={course.publishedAt ? 'Yes' : 'No'}
          hint={course.publishedAt?.toISOString().slice(0, 10)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
          <div className="card card-body">
            <h3 className="section-title">Public link</h3>
            <p className="mt-1 text-xs text-zinc-600">
              {course.status === 'PUBLISHED' ? (
                <>
                  Your course is live at{' '}
                  <a
                    href={`/c/${course.slug}`}
                    target="_blank"
                    className="text-nuvra-400 hover:underline"
                  >
                    /c/{course.slug}
                  </a>
                </>
              ) : (
                'Publiez la formation pour activer /c/' +
                course.slug +
                ' accessible.'
              )}
            </p>
          </div>
          <InlineAlert tone="info">
            Rappel des frais plateforme : avec le <strong>Gratuit</strong> plan
            Gratuit, Nuvra prélève <strong>10 %</strong> de chaque vente. Avec{' '}
            <strong>Pro</strong> c&apos;est <strong>0 %</strong> (les frais de
            paiement restent séparés). Votre plan :{' '}
            <strong>{ctx.workspace.plan}</strong>.
          </InlineAlert>
        </div>
      </div>
    </div>
  );
}
