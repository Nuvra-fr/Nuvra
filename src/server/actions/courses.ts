'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  courseModules,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  quizzes,
  quizAttempts,
  certificates,
  marketplaceListings,
  type Course,
} from '@/db/schema';
import { requireUser, type AuthContext } from '@/lib/auth';
import { slugify, randomCode } from '@/lib/utils';
import { emitEvent } from '@/lib/events';
import { audit } from '@/lib/audit';
import { CERTIFICATE_ALPHABET } from '@/lib/constants';

async function ownedCourse(ctx: AuthContext, id: string): Promise<Course> {
  const c = await db.select().from(courses).where(eq(courses.id, id)).get();
  if (!c) throw new Error('Course not found');
  if (c.workspaceId !== ctx.workspace.id) throw new Error('Not authorized');
  return c;
}

async function uniqueCourseSlug(ctx: AuthContext, base: string): Promise<string> {
  const root = slugify(base) || 'course';
  let slug = root;
  for (let i = 0; i < 30; i++) {
    const exists = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.workspaceId, ctx.workspace.id), eq(courses.slug, slug)))
      .get();
    if (!exists) return slug;
    slug = `${root}-${randomCode(3)}`;
  }
  return `${root}-${Date.now()}`;
}

export async function createCourseAction(input: {
  title: string;
  price?: number;
  description?: string;
  level?: string;
  category?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const title = input.title.trim().slice(0, 120);
    if (title.length < 2) return { ok: false, error: 'Title is required' };
    const created = await db
      .insert(courses)
      .values({
        workspaceId: ctx.workspace.id,
        title,
        slug: await uniqueCourseSlug(ctx, title),
        description: input.description?.slice(0, 4000) ?? null,
        priceCents: Math.max(0, Math.round((input.price ?? 4900) * 100)),
        level: input.level ?? 'beginner',
        category: input.category ?? null,
        status: 'DRAFT',
      })
      .returning({ id: courses.id })
      .get();
    // default first module
    await db.insert(courseModules).values({ courseId: created.id, title: 'Getting started', position: 0 }).run();
    await audit('course.created', { actorUserId: ctx.user.id, target: created.id, meta: { title } });
    revalidatePath('/dashboard/courses');
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function updateCourseAction(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    priceCents: number;
    status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
    level: string;
    category: string;
    coverUrl: string;
    syllabus: string;
  }>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    await ownedCourse(ctx, id);
    const updates: Partial<typeof courses.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) updates.title = input.title.slice(0, 120);
    if (input.description !== undefined) updates.description = input.description.slice(0, 4000);
    if (input.priceCents !== undefined) {
      if (!Number.isInteger(input.priceCents) || input.priceCents < 0) return { ok: false, error: 'Invalid price' };
      updates.priceCents = input.priceCents;
    }
    if (input.status !== undefined) {
      updates.status = input.status;
      if (input.status === 'PUBLISHED') updates.publishedAt = new Date();
    }
    if (input.level !== undefined) updates.level = input.level;
    if (input.category !== undefined) updates.category = input.category;
    if (input.coverUrl !== undefined) updates.coverUrl = input.coverUrl;
    if (input.syllabus !== undefined) updates.syllabus = input.syllabus;
    await db.update(courses).set(updates).where(eq(courses.id, id)).run();

    // Keep marketplace listing in sync
    const listing = await db.select().from(marketplaceListings).where(eq(marketplaceListings.courseId, id)).get();
    if (listing) {
      await db.update(marketplaceListings)
        .set({
          title: updates.title ?? listing.title,
          priceCents: updates.priceCents ?? listing.priceCents,
          updatedAt: new Date(),
        })
        .where(eq(marketplaceListings.id, listing.id))
        .run();
    }

    revalidatePath('/dashboard/courses');
    revalidatePath(`/dashboard/courses/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteCourseAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    await ownedCourse(ctx, id);
    await db.delete(courses).where(eq(courses.id, id)).run();
    await audit('course.deleted', { actorUserId: ctx.user.id, target: id });
    revalidatePath('/dashboard/courses');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function addModuleAction(
  courseId: string,
  title: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    await ownedCourse(ctx, courseId);
    const count = (await db.select({ id: courseModules.id }).from(courseModules).where(eq(courseModules.courseId, courseId)).all()).length;
    const row = await db
      .insert(courseModules)
      .values({ courseId, title: title.trim().slice(0, 120) || `Module ${count + 1}`, position: count })
      .returning({ id: courseModules.id })
      .get();
    revalidatePath(`/dashboard/courses/${courseId}`);
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function renameModuleAction(
  moduleId: string,
  title: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const mod = await db.select().from(courseModules).where(eq(courseModules.id, moduleId)).get();
    if (!mod) throw new Error('Module not found');
    await ownedCourse(ctx, mod.courseId);
    await db.update(courseModules).set({ title: title.slice(0, 120) }).where(eq(courseModules.id, moduleId)).run();
    revalidatePath(`/dashboard/courses/${mod.courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteModuleAction(
  moduleId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const mod = await db.select().from(courseModules).where(eq(courseModules.id, moduleId)).get();
    if (!mod) throw new Error('Module not found');
    await ownedCourse(ctx, mod.courseId);
    await db.delete(courseModules).where(eq(courseModules.id, moduleId)).run();
    revalidatePath(`/dashboard/courses/${mod.courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function addLessonAction(
  courseId: string,
  moduleId: string | null,
  input: { title: string; type?: string; content?: string; resourceUrl?: string },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    await ownedCourse(ctx, courseId);
    const count = (await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, courseId)).all()).length;
    const row = await db
      .insert(lessons)
      .values({
        courseId,
        moduleId,
        title: input.title.trim().slice(0, 160) || `Lesson ${count + 1}`,
        type: input.type ?? 'text',
        content: input.content ?? null,
        resourceUrl: input.resourceUrl ?? null,
        position: count,
      })
      .returning({ id: lessons.id })
      .get();
    revalidatePath(`/dashboard/courses/${courseId}`);
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function updateLessonAction(
  lessonId: string,
  input: Partial<{ title: string; type: string; content: string; resourceUrl: string; moduleId: string | null; isPreview: boolean }>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
    if (!lesson) throw new Error('Lesson not found');
    await ownedCourse(ctx, lesson.courseId);
    const updates: Partial<typeof lessons.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) updates.title = input.title.slice(0, 160);
    if (input.type !== undefined) updates.type = input.type;
    if (input.content !== undefined) updates.content = input.content;
    if (input.resourceUrl !== undefined) updates.resourceUrl = input.resourceUrl;
    if (input.moduleId !== undefined) updates.moduleId = input.moduleId;
    if (input.isPreview !== undefined) updates.isPreview = input.isPreview;
    await db.update(lessons).set(updates).where(eq(lessons.id, lessonId)).run();
    revalidatePath(`/dashboard/courses/${lesson.courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteLessonAction(
  lessonId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
    if (!lesson) throw new Error('Lesson not found');
    await ownedCourse(ctx, lesson.courseId);
    await db.delete(lessons).where(eq(lessons.id, lessonId)).run();
    revalidatePath(`/dashboard/courses/${lesson.courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

// ── LMS (learner side) ─────────────────────────────────

export async function markLessonCompleteAction(
  courseId: string,
  lessonId: string,
): Promise<{ ok: true; progress: number } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const enrollment = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, ctx.user.id), eq(enrollments.courseId, courseId)))
      .get();
    if (!enrollment) return { ok: false, error: 'Not enrolled in this course' };

    await db.insert(lessonProgress)
      .values({ enrollmentId: enrollment.id, lessonId, completedAt: new Date() })
      .onConflictDoUpdate({
        target: [lessonProgress.enrollmentId, lessonProgress.lessonId],
        set: { completedAt: new Date() },
      })
      .run();

    const total = (await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, courseId)).all()).length;
    const done = (await db
      .select({ id: lessonProgress.id })
      .from(lessonProgress)
      .where(eq(lessonProgress.enrollmentId, enrollment.id))
      .all()).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const completedAt = pct >= 100 ? new Date() : null;
    await db.update(enrollments)
      .set({ progressPct: pct, completedAt, updatedAt: new Date() })
      .where(eq(enrollments.id, enrollment.id))
      .run();

    if (completedAt) {
      // issue certificate once
      const existingCert = await db
        .select({ id: certificates.id })
        .from(certificates)
        .where(eq(certificates.enrollmentId, enrollment.id))
        .get();
      if (!existingCert) {
        let code = '';
        for (let i = 0; i < 10; i++) {
          code += CERTIFICATE_ALPHABET[Math.floor(Math.random() * CERTIFICATE_ALPHABET.length)];
        }
        await db.insert(certificates)
          .values({ enrollmentId: enrollment.id, userId: ctx.user.id, code: `NV-${code}` })
          .onConflictDoNothing()
          .run();
      }
      await emitEvent({
        name: 'course.completed',
        workspaceId: ctx.workspace.id,
        userId: ctx.user.id,
        payload: { courseId, email: ctx.user.email, name: ctx.user.name },
      });
    } else {
      await emitEvent({
        name: 'lesson.completed',
        workspaceId: ctx.workspace.id,
        userId: ctx.user.id,
        payload: { courseId, lessonId, email: ctx.user.email },
      });
    }

    revalidatePath(`/dashboard/learn/${courseId}`);
    return { ok: true, progress: pct };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function submitQuizAction(
  courseId: string,
  quizId: string,
  answers: number[],
): Promise<{ ok: true; score: number; passed: boolean } | { ok: false; error: string }> {
  try {
    const ctx = await requireUser();
    const enrollment = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, ctx.user.id), eq(enrollments.courseId, courseId)))
      .get();
    if (!enrollment) return { ok: false, error: 'Not enrolled' };
    const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).get();
    if (!quiz) return { ok: false, error: 'Quiz not found' };
    const questions = JSON.parse(quiz.questions) as { answerIndex: number }[];
    if (!Array.isArray(questions) || questions.length === 0) return { ok: false, error: 'Empty quiz' };
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answerIndex) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    await db.insert(quizAttempts)
      .values({
        enrollmentId: enrollment.id,
        quizId,
        userId: ctx.user.id,
        scorePct: score,
        answers: JSON.stringify(answers),
      })
      .run();
    return { ok: true, score, passed: score >= quiz.passingScore };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
}
