import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { lessons, courses } from '@/db/schema';
import { getSession } from '@/lib/auth';

/** Lesson content fetch (owner of the course workspace). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const ctx = await getSession();
  if (!ctx) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const { id } = await params;
  const lesson = db.select().from(lessons).where(eq(lessons.id, id)).get();
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const course = db.select().from(courses).where(eq(courses.id, lesson.courseId)).get();
  if (!course || course.workspaceId !== ctx.workspace.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
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
