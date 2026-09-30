import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { lessons, courses } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { getAcademyAccess } from '@/lib/academy';

/** Lesson content fetch (owner of the course workspace). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const ctx = await getSession();
  if (!ctx)
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const { id } = await params;
  const lesson = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .get();
  if (!lesson)
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, lesson.courseId))
    .get();
  if (!course) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  // Premium Academy content: the entitlement is the gate, checked server-side.
  // A lesson is served only if it is a public preview, or if the learner holds
  // an ACTIVE Academy entitlement (or is an administrator).
  if (course.isAcademy) {
    if (lesson.isPreview) {
      return NextResponse.json({
        ok: true,
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        shortDescription: lesson.shortDescription,
        content: lesson.content ?? '',
        isPreview: true,
      });
    }
    const access = await getAcademyAccess(ctx.user.id);
    if (!access.granted || access.course?.id !== course.id) {
      return NextResponse.json(
        { error: 'Accès Académie requis' },
        { status: 403 },
      );
    }
    return NextResponse.json({
      ok: true,
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      content: lesson.content ?? '',
      resourceUrl: lesson.resourceUrl,
      moduleId: lesson.moduleId,
      isPreview: false,
    });
  }

  if (!course || course.workspaceId !== ctx.workspace.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  return NextResponse.json({
    ok: true,
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    content: lesson.content ?? '',
    resourceUrl: lesson.resourceUrl,
    moduleId: lesson.moduleId,
    isPreview: lesson.isPreview,
  });
}
