'use server';

import { revalidatePath } from 'next/cache';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  academySubmissions,
  courseModules,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  quizzes,
  quizAttempts,
  videoAssets,
  videoProgress,
  users,
} from '@/db/schema';
import { requireUser, requireAdmin, type AuthContext } from '@/lib/auth';
import {
  ACADEMY_ENTITLEMENT_KEY,
  computeCourseProgress,
  getAcademyAccess,
  getLesson,
  issueCertificate,
  revokeAcademyAccess,
  grantAcademyAccess,
  scoreQuiz,
  syncEnrollmentProgress,
} from '@/lib/academy';
import { safeJson, slugify } from '@/lib/utils';
import { emitEvent } from '@/lib/events';
import { audit } from '@/lib/audit';
import { sendAcademyEmail } from '@/lib/academy-emails';

type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Every learner-facing Academy action re-checks the entitlement server-side.
 * A hidden button is not a protection: the action itself is the guard.
 */
async function requireAcademyAccess(ctx: AuthContext) {
  const access = await getAcademyAccess(ctx.user.id);
  if (!access.granted) {
    throw new Error('Accès Académie requis pour cette action.');
  }
  if (!access.course || !access.enrollment) {
    throw new Error('Inscription introuvable pour cette formation');
  }
  return { course: access.course, enrollment: access.enrollment };
}

async function academyEnrollments(ctx: AuthContext) {
  const access = await getAcademyAccess(ctx.user.id);
  if (!access.granted || !access.course) return null;
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, ctx.user.id),
        eq(enrollments.courseId, access.course.id),
      ),
    )
    .get();
  if (!enrollment) return null;
  return { course: access.course, enrollment };
}

function revalidateAcademy(courseId: string) {
  revalidatePath('/dashboard/academy');
  revalidatePath(`/dashboard/learn/${courseId}`);
}

// ── Learner actions ────────────────────────────────────────────────

export async function markLessonCompleteAction(
  lessonId: string,
): Promise<Result<{ progress: number; completed: boolean; certificate: string | null }>> {
  try {
    const ctx = await requireUser();
    const found = await academyEnrollments(ctx);
    if (!found) return { ok: false, error: 'Accès Académie requis' };
    const { course, enrollment } = found;

    const lesson = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.courseId, course.id)))
      .get();
    if (!lesson) return { ok: false, error: 'Leçon introuvable' };

    const existing = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollment.id),
          eq(lessonProgress.lessonId, lessonId),
        ),
      )
      .get();
    if (existing?.completedAt) {
      const progress = await computeCourseProgress(enrollment.id);
      return { ok: true, data: { progress: progress.pct, completed: progress.completed, certificate: null } };
    }

    await db
      .insert(lessonProgress)
      .values({
        enrollmentId: enrollment.id,
        lessonId,
        completedAt: new Date(),
        secondsSpent: existing?.secondsSpent ?? 0,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [lessonProgress.enrollmentId, lessonProgress.lessonId],
        set: { completedAt: new Date(), updatedAt: new Date() },
      })
      .run();

    const progress = await syncEnrollmentProgress(enrollment.id);
    await emitEvent({
      name: progress.completed ? 'course.completed' : 'lesson.completed',
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      payload: { courseId: course.id, lessonId, email: ctx.user.email, name: ctx.user.name },
    });

    if (progress.completed) {
      const cert = await issueCertificate(enrollment.id, ctx.user.id);
      await sendAcademyEmail({
        to: ctx.user.email,
        userId: ctx.user.id,
        key: 'certificate',
      });
      revalidateAcademy(course.id);
      return {
        ok: true,
        data: { progress: progress.pct, completed: true, certificate: cert.code },
      };
    }

    revalidateAcademy(course.id);
    return { ok: true, data: { progress: progress.pct, completed: false, certificate: null } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Action impossible' };
  }
}

export async function unmarkLessonCompleteAction(lessonId: string): Promise<Result> {
  try {
    const ctx = await requireUser();
    const found = await academyEnrollments(ctx);
    if (!found) return { ok: false, error: 'Accès Académie requis' };
    const { course, enrollment } = found;
    await db
      .delete(lessonProgress)
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollment.id),
          eq(lessonProgress.lessonId, lessonId),
        ),
      )
      .run();
    await syncEnrollmentProgress(enrollment.id);
    revalidateAcademy(course.id);
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Action impossible' };
  }
}

export async function saveVideoProgressAction(
  lessonId: string,
  positionSec: number,
  durationSec: number,
): Promise<Result<{ percent: number }>> {
  try {
    const ctx = await requireUser();
    const found = await academyEnrollments(ctx);
    if (!found) return { ok: false, error: 'Accès Académie requis' };
    const { enrollment } = found;
    const pos = Math.max(0, Math.floor(positionSec || 0));
    const dur = Math.max(0, Math.floor(durationSec || 0));
    const percent = dur > 0 ? Math.min(100, Math.round((pos / dur) * 100)) : 0;
    const completed = dur > 0 && percent >= 90;

    await db
      .insert(videoProgress)
      .values({
        enrollmentId: enrollment.id,
        lessonId,
        positionSec: pos,
        durationSec: dur,
        percent,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [videoProgress.enrollmentId, videoProgress.lessonId],
        set: {
          positionSec: pos,
          durationSec: dur,
          percent,
          completedAt: completed ? new Date() : undefined,
          updatedAt: new Date(),
        },
      })
      .run();

    // Watching counts as study time on the lesson row.
    if (dur > 0) {
      await db
        .insert(lessonProgress)
        .values({ enrollmentId: enrollment.id, lessonId, secondsSpent: Math.round(dur) })
        .onConflictDoUpdate({
          target: [lessonProgress.enrollmentId, lessonProgress.lessonId],
          set: { secondsSpent: dur },
        })
        .run();
    }
    return { ok: true, data: { percent } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Enregistrement impossible' };
  }
}

const quizSchema = z.object({
  quizId: z.string().min(1),
  answers: z.array(z.number().int().min(-1)).min(1).max(50),
});

export async function submitAcademyQuizAction(
  input: z.infer<typeof quizSchema>,
): Promise<
  Result<{
    score: number;
    passed: boolean;
    passingScore: number;
    details: { question: string; given: number; expected: number; ok: boolean; explanation: string }[];
  }>
> {
  try {
    const ctx = await requireUser();
    const parsed = quizSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Réponses invalides' };
    const found = await academyEnrollments(ctx);
    if (!found) return { ok: false, error: 'Accès Académie requis' };
    const { course, enrollment } = found;

    const quiz = await db.select().from(quizzes).where(eq(quizzes.id, parsed.data.quizId)).get();
    if (!quiz) return { ok: false, error: 'Quiz introuvable' };
    const lesson = await db.select().from(lessons).where(eq(lessons.id, quiz.lessonId)).get();
    if (!lesson || lesson.courseId !== course.id)
      return { ok: false, error: 'Quiz hors programme' };

    const questions = safeJson<{ question: string; options: string[]; answerIndex: number; explanation?: string }[]>(
      quiz.questions,
      [],
    );
    if (questions.length === 0) return { ok: false, error: 'Quiz vide' };

    const result = scoreQuiz(questions, parsed.data.answers, quiz.passingScore);
    await db.insert(quizAttempts).values({
      enrollmentId: enrollment.id,
      quizId: quiz.id,
      userId: ctx.user.id,
      scorePct: result.score,
      answers: JSON.stringify(parsed.data.answers),
    }).run();

    // A passed quiz is a completion signal: it unlocks the lesson the same way
    // "Mark as complete" does, so progress stays honest.
    if (result.passed) {
      const existing = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.enrollmentId, enrollment.id),
            eq(lessonProgress.lessonId, quiz.lessonId),
          ),
        )
        .get();
      if (!existing?.completedAt) {
        await db
          .insert(lessonProgress)
          .values({
            enrollmentId: enrollment.id,
            lessonId: quiz.lessonId,
            completedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [lessonProgress.enrollmentId, lessonProgress.lessonId],
            set: { completedAt: new Date(), updatedAt: new Date() },
          })
          .run();
        const progress = await syncEnrollmentProgress(enrollment.id);
        if (progress.completed) {
          await issueCertificate(enrollment.id, ctx.user.id);
          await sendAcademyEmail({ to: ctx.user.email, userId: ctx.user.id, key: 'certificate' });
        }
      }
    }

    revalidateAcademy(course.id);
    return {
      ok: true,
      data: { ...result, passingScore: quiz.passingScore },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Quiz impossible' };
  }
}

const submissionSchema = z.object({
  kind: z.enum(['WORKSHOP', 'EXERCISE', 'NOTE']),
  lessonId: z.string().min(1).nullable(),
  title: z.string().max(160).optional(),
  payload: z.record(z.string(), z.unknown()),
});

export async function saveSubmissionAction(
  input: z.infer<typeof submissionSchema>,
): Promise<Result<{ id: string; updatedAt: string }>> {
  try {
    const ctx = await requireUser();
    const parsed = submissionSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Données invalides' };
    const found = await academyEnrollments(ctx);
    if (!found) return { ok: false, error: 'Accès Académie requis' };
    const { enrollment } = found;
    const { kind, lessonId, title, payload } = parsed.data;

    const row = await db
      .insert(academySubmissions)
      .values({
        enrollmentId: enrollment.id,
        userId: ctx.user.id,
        lessonId,
        kind,
        title: title ?? null,
        payload: JSON.stringify(payload).slice(0, 60_000),
      })
      .onConflictDoUpdate({
        target: [academySubmissions.enrollmentId, academySubmissions.kind, academySubmissions.lessonId],
        set: { payload: JSON.stringify(payload).slice(0, 60_000), title: title ?? null, updatedAt: new Date() },
      })
      .returning({ id: academySubmissions.id, updatedAt: academySubmissions.updatedAt })
      .get();

    revalidatePath('/dashboard/academy');
    return { ok: true, data: { id: row!.id, updatedAt: row!.updatedAt.toISOString() } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Enregistrement impossible' };
  }
}

// ── Admin actions ──────────────────────────────────────────────────

async function requireAcademyCourse() {
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.isAcademy, true))
    .get();
  if (!course) throw new Error('Formation Académie introuvable');
  return course;
}

function revalidateAdmin() {
  revalidatePath('/admin/academy');
  revalidatePath('/dashboard/academy');
  revalidatePath('/academy');
}

const moduleSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  objectives: z.array(z.string().max(200)).max(12).optional(),
});

export async function adminCreateModuleAction(
  input: z.infer<typeof moduleSchema>,
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireAdmin();
    const parsed = moduleSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Module invalide' };
    const course = await requireAcademyCourse();
    const count = (
      await db.select({ id: courseModules.id }).from(courseModules).where(eq(courseModules.courseId, course.id)).all()
    ).length;
    const base = slugify(parsed.data.title) || `module-${count + 1}`;
    let slug = base;
    for (let i = 0; i < 20; i++) {
      const clash = await db
        .select({ id: courseModules.id })
        .from(courseModules)
        .where(and(eq(courseModules.courseId, course.id), eq(courseModules.slug, slug)))
        .get();
      if (!clash) break;
      slug = `${base}-${i + 2}`;
    }
    const row = await db
      .insert(courseModules)
      .values({
        courseId: course.id,
        title: parsed.data.title,
        slug,
        description: parsed.data.description ?? null,
        objectives: JSON.stringify(parsed.data.objectives ?? []),
        position: count,
        published: true,
      })
      .returning({ id: courseModules.id })
      .get();
    await audit('academy.module_created', { actorUserId: ctx.user.id, target: row!.id });
    revalidateAdmin();
    return { ok: true, data: { id: row!.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Création impossible' };
  }
}

export async function adminUpdateModuleAction(
  moduleId: string,
  input: Partial<z.infer<typeof moduleSchema>> & { published?: boolean; position?: number },
): Promise<Result> {
  try {
    const ctx = await requireAdmin();
    const mod = await db.select().from(courseModules).where(eq(courseModules.id, moduleId)).get();
    if (!mod) return { ok: false, error: 'Module introuvable' };
    const course = await requireAcademyCourse();
    if (mod.courseId !== course.id) return { ok: false, error: 'Module hors Académie' };
    const patch: Partial<typeof courseModules.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) patch.title = input.title.slice(0, 160);
    if (input.description !== undefined) patch.description = input.description.slice(0, 2000);
    if (input.objectives !== undefined) patch.objectives = JSON.stringify(input.objectives);
    if (input.published !== undefined) patch.published = input.published;
    if (input.position !== undefined) patch.position = input.position;
    await db.update(courseModules).set(patch).where(eq(courseModules.id, moduleId)).run();
    await audit('academy.module_updated', { actorUserId: ctx.user.id, target: moduleId });
    revalidateAdmin();
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Mise à jour impossible' };
  }
}

export async function adminDeleteModuleAction(moduleId: string): Promise<Result> {
  try {
    const ctx = await requireAdmin();
    const course = await requireAcademyCourse();
    const mod = await db.select().from(courseModules).where(eq(courseModules.id, moduleId)).get();
    if (!mod || mod.courseId !== course.id) return { ok: false, error: 'Module introuvable' };
    await db.delete(courseModules).where(eq(courseModules.id, moduleId)).run();
    await audit('academy.module_deleted', { actorUserId: ctx.user.id, target: moduleId, meta: { title: mod.title } });
    revalidateAdmin();
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Suppression impossible' };
  }
}

export async function adminMoveModuleAction(moduleId: string, direction: 'up' | 'down'): Promise<Result> {
  try {
    await requireAdmin();
    const course = await requireAcademyCourse();
    const mods = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, course.id))
      .orderBy(asc(courseModules.position))
      .all();
    const index = mods.findIndex((m) => m.id === moduleId);
    if (index < 0) return { ok: false, error: 'Module introuvable' };
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= mods.length) return { ok: true, data: null };
    const a = mods[index]!;
    const b = mods[swapWith]!;
    await db.update(courseModules).set({ position: b.position, updatedAt: new Date() }).where(eq(courseModules.id, a.id)).run();
    await db.update(courseModules).set({ position: a.position, updatedAt: new Date() }).where(eq(courseModules.id, b.id)).run();
    revalidateAdmin();
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Réorganisation impossible' };
  }
}

const resourceSchema = z.object({
  title: z.string().min(2).max(160),
  kind: z.enum(['CHECKLIST', 'TEMPLATE', 'WORKBOOK', 'LINK', 'SCRIPT']),
  description: z.string().min(4).max(400),
  href: z
    .string()
    .max(300)
    .refine((v) => v === '' || v.startsWith('/') || /^https:\/\//.test(v), {
      message: 'Lien interne (/…) ou https uniquement',
    })
    .optional(),
});

const lessonSchema = z.object({
  moduleId: z.string().min(1).nullable(),
  resources: z.array(resourceSchema).max(12).optional(),
  title: z.string().min(2).max(160),
  type: z.string().max(20).optional(),
  shortDescription: z.string().max(400).optional(),
  content: z.string().max(60_000).optional(),
  objectives: z.array(z.string().max(240)).max(10).optional(),
  exercise: z.string().max(10_000).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  durationMin: z.number().int().min(0).max(600).optional(),
  isPreview: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function adminCreateLessonAction(
  input: z.infer<typeof lessonSchema>,
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireAdmin();
    const parsed = lessonSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Leçon invalide' };
    const course = await requireAcademyCourse();
    const count = (
      await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, course.id)).all()
    ).length;
    const base = slugify(parsed.data.title) || `lecon-${count + 1}`;
    let slug = base;
    for (let i = 0; i < 20; i++) {
      const clash = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.courseId, course.id), eq(lessons.slug, slug)))
        .get();
      if (!clash) break;
      slug = `${base}-${i + 2}`;
    }
    const row = await db
      .insert(lessons)
      .values({
        courseId: course.id,
        moduleId: parsed.data.moduleId,
        title: parsed.data.title,
        slug,
        shortDescription: parsed.data.shortDescription ?? null,
        type: parsed.data.type ?? 'text',
        content: parsed.data.content ?? '',
        objectives: JSON.stringify(parsed.data.objectives ?? []),
        exercise: parsed.data.exercise ?? null,
        difficulty: parsed.data.difficulty ?? 'beginner',
        durationMin: parsed.data.durationMin ?? 8,
        position: count * 100,
        isPreview: parsed.data.isPreview ?? false,
        published: parsed.data.published ?? true,
      })
      .returning({ id: lessons.id })
      .get();
    await audit('academy.lesson_created', { actorUserId: ctx.user.id, target: row!.id });
    revalidateAdmin();
    return { ok: true, data: { id: row!.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Création impossible' };
  }
}

export async function adminUpdateLessonAction(
  lessonId: string,
  input: Partial<z.infer<typeof lessonSchema>> & { position?: number },
): Promise<Result> {
  try {
    const ctx = await requireAdmin();
    const course = await requireAcademyCourse();
    const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
    if (!lesson || lesson.courseId !== course.id) return { ok: false, error: 'Leçon introuvable' };
    const patch: Partial<typeof lessons.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) patch.title = input.title.slice(0, 160);
    if (input.moduleId !== undefined) patch.moduleId = input.moduleId;
    if (input.type !== undefined) patch.type = input.type;
    if (input.shortDescription !== undefined) patch.shortDescription = input.shortDescription;
    if (input.content !== undefined) patch.content = input.content;
    if (input.objectives !== undefined) patch.objectives = JSON.stringify(input.objectives);
    if (input.resources !== undefined) {
      patch.resources = JSON.stringify(
        input.resources.map((r) => ({
          title: r.title,
          kind: r.kind,
          description: r.description,
          href: r.href?.trim() ? r.href.trim() : null,
        })),
      );
    }
    if (input.exercise !== undefined) patch.exercise = input.exercise;
    if (input.difficulty !== undefined) patch.difficulty = input.difficulty;
    if (input.durationMin !== undefined) patch.durationMin = input.durationMin;
    if (input.isPreview !== undefined) patch.isPreview = input.isPreview;
    if (input.published !== undefined) patch.published = input.published;
    if (input.position !== undefined) patch.position = input.position;
    await db.update(lessons).set(patch).where(eq(lessons.id, lessonId)).run();
    await audit('academy.lesson_updated', { actorUserId: ctx.user.id, target: lessonId });
    revalidateAdmin();
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Mise à jour impossible' };
  }
}

/**
 * Full editable draft of a lesson, loaded on demand by the curriculum editor
 * (the list itself stays light: 118 lessons must not be sent with the page).
 */
export async function adminGetLessonDraftAction(lessonId: string): Promise<
  Result<{
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    objectives: string[];
    resources: { title: string; kind: string; description: string; href: string | null }[];
    exercise: string;
    difficulty: string;
    durationMin: number;
    type: string;
    isPreview: boolean;
    published: boolean;
  }>
> {
  try {
    await requireAdmin();
    const course = await requireAcademyCourse();
    const row = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
    if (!row || row.courseId !== course.id) {
      return { ok: false, error: 'Leçon introuvable' };
    }
    const parse = <T,>(raw: string | null, fallback: T): T => {
      try {
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        return fallback;
      }
    };
    return {
      ok: true,
      data: {
        id: row.id,
        title: row.title,
        shortDescription: row.shortDescription ?? '',
        content: row.content ?? '',
        objectives: parse<string[]>(row.objectives, []),
        resources: parse<{ title: string; kind: string; description: string; href: string | null }[]>(
          row.resources,
          [],
        ),
        exercise: row.exercise ?? '',
        difficulty: row.difficulty,
        durationMin: row.durationMin ?? 0,
        type: row.type,
        isPreview: row.isPreview,
        published: row.published,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Lecture impossible' };
  }
}

export async function adminDeleteLessonAction(lessonId: string): Promise<Result> {
  try {
    const ctx = await requireAdmin();
    const course = await requireAcademyCourse();
    const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
    if (!lesson || lesson.courseId !== course.id) return { ok: false, error: 'Leçon introuvable' };
    await db.delete(lessons).where(eq(lessons.id, lessonId)).run();
    await audit('academy.lesson_deleted', { actorUserId: ctx.user.id, target: lessonId, meta: { title: lesson.title } });
    revalidateAdmin();
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Suppression impossible' };
  }
}

const videoSchema = z.object({
  status: z.enum(['SCRIPTED', 'UPLOADED']).optional(),
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  playbackUrl: z.string().max(1000).nullable().optional(),
  storageKey: z.string().max(500).nullable().optional(),
  thumbnailUrl: z.string().max(1000).nullable().optional(),
  subtitlesUrl: z.string().max(1000).nullable().optional(),
  script: z.string().max(120_000).nullable().optional(),
  transcript: z.string().max(200_000).nullable().optional(),
  storyboard: z.array(z.object({ time: z.string(), visual: z.string(), narration: z.string(), onScreenText: z.string() })).max(40).optional(),
  chapters: z.array(z.object({ title: z.string(), time: z.number().int().min(0) })).max(40).optional(),
  durationSec: z.number().int().min(0).max(60_000).nullable().optional(),
  lessonId: z.string().nullable().optional(),
  moduleId: z.string().nullable().optional(),
});

export async function adminSaveVideoAction(
  assetId: string | 'new',
  input: z.infer<typeof videoSchema>,
): Promise<Result<{ id: string; status: string }>> {
  try {
    const ctx = await requireAdmin();
    const parsed = videoSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Données vidéo invalides' };
    const data = parsed.data;
    const payload = {
      title: data.title ?? 'Vidéo de leçon',
      description: data.description ?? null,
      status: data.status ?? 'SCRIPTED',
      durationSec: data.durationSec ?? 0,
      playbackUrl: data.playbackUrl ?? null,
      storageKey: data.storageKey ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      subtitlesUrl: data.subtitlesUrl ?? null,
      script: data.script ?? null,
      transcript: data.transcript ?? null,
      storyboard: JSON.stringify(data.storyboard ?? []),
      chapters: JSON.stringify(data.chapters ?? []),
      updatedAt: new Date(),
    };
    // A video marked UPLOADED must have a real file to play.
    if (payload.status === 'UPLOADED' && !payload.playbackUrl) {
      return { ok: false, error: 'Un fichier vidéo réel est requis pour le statut Uploaded' };
    }

    if (assetId === 'new') {
      if (!data.lessonId && !data.moduleId) {
        return { ok: false, error: 'Vidéo rattachée à une leçon ou un module' };
      }
      const row = await db
        .insert(videoAssets)
        .values({ ...payload, lessonId: data.lessonId ?? null, moduleId: data.moduleId ?? null })
        .returning({ id: videoAssets.id, status: videoAssets.status })
        .get();
      await audit('academy.video_created', { actorUserId: ctx.user.id, target: row!.id });
      revalidateAdmin();
      return { ok: true, data: { id: row!.id, status: row!.status } };
    }

    const existing = await db.select().from(videoAssets).where(eq(videoAssets.id, assetId)).get();
    if (!existing) return { ok: false, error: 'Vidéo introuvable' };
    await db.update(videoAssets).set(payload).where(eq(videoAssets.id, assetId)).run();
    await audit('academy.video_updated', { actorUserId: ctx.user.id, target: assetId, meta: { status: payload.status } });
    revalidateAdmin();
    return { ok: true, data: { id: assetId, status: payload.status } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Enregistrement impossible' };
  }
}

const quizAdminSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(2).max(160),
  passingScore: z.number().int().min(0).max(100),
  questions: z
    .array(
      z.object({
        question: z.string().min(3).max(500),
        options: z.array(z.string().min(1).max(300)).min(2).max(6),
        answerIndex: z.number().int().min(0).max(5),
        explanation: z.string().max(1000).optional(),
      }),
    )
    .min(1)
    .max(20),
});

export async function adminSaveQuizAction(
  quizId: string | 'new',
  input: z.infer<typeof quizAdminSchema>,
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireAdmin();
    const parsed = quizAdminSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Quiz invalide' };
    const data = parsed.data;
    data.questions.forEach((q) => {
      if (q.answerIndex >= q.options.length) throw new Error('Réponse hors des propositions');
    });
    const payload = {
      title: data.title,
      passingScore: data.passingScore,
      questions: JSON.stringify(data.questions),
    };
    if (quizId === 'new') {
      const existing = await db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.lessonId, data.lessonId)).get();
      if (existing) {
        await db.update(quizzes).set(payload).where(eq(quizzes.id, existing.id)).run();
        await audit('academy.quiz_updated', { actorUserId: ctx.user.id, target: existing.id });
        revalidateAdmin();
        return { ok: true, data: { id: existing.id } };
      }
      const row = await db
        .insert(quizzes)
        .values({ lessonId: data.lessonId, ...payload })
        .returning({ id: quizzes.id })
        .get();
      await audit('academy.quiz_created', { actorUserId: ctx.user.id, target: row!.id });
      revalidateAdmin();
      return { ok: true, data: { id: row!.id } };
    }
    await db.update(quizzes).set(payload).where(eq(quizzes.id, quizId)).run();
    await audit('academy.quiz_updated', { actorUserId: ctx.user.id, target: quizId });
    revalidateAdmin();
    return { ok: true, data: { id: quizId } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Enregistrement impossible' };
  }
}

export async function adminGrantAccessAction(
  email: string,
  note?: string,
): Promise<Result<{ userId: string }>> {
  try {
    const ctx = await requireAdmin();
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .get();
    if (!user) return { ok: false, error: 'Aucun compte avec cet email' };
    await grantAcademyAccess(user.id, { source: 'ADMIN', note: note ?? null });
    await audit('academy.access_granted', { actorUserId: ctx.user.id, target: user.id, meta: { email } });
    revalidateAdmin();
    return { ok: true, data: { userId: user.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Attribution impossible' };
  }
}

export async function adminRevokeAccessAction(
  userId: string,
  reason: string,
): Promise<Result> {
  try {
    const ctx = await requireAdmin();
    await revokeAcademyAccess(userId, reason.slice(0, 200));
    await audit('academy.access_revoked', {
      actorUserId: ctx.user.id,
      target: userId,
      meta: { reason: reason.slice(0, 200) },
    });
    revalidateAdmin();
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Révocation impossible' };
  }
}

export async function adminEnrollUserAction(
  email: string,
): Promise<Result<{ userId: string }>> {
  try {
    const ctx = await requireAdmin();
    const course = await requireAcademyCourse();
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .get();
    if (!user) return { ok: false, error: 'Aucun compte avec cet email' };
    const existing = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)),
      )
      .get();
    if (!existing) {
      await db
        .insert(enrollments)
        .values({ userId: user.id, courseId: course.id, source: 'ADMIN' })
        .run();
    }
    await grantAcademyAccess(user.id, { source: 'ADMIN', note: 'Inscription administrateur' });
    await audit('academy.enrollment_created', { actorUserId: ctx.user.id, target: user.id, meta: { email } });
    revalidateAdmin();
    return { ok: true, data: { userId: user.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Inscription impossible' };
  }
}

export { ACADEMY_ENTITLEMENT_KEY, getAcademyAccess, requireAcademyAccess, getLesson };
