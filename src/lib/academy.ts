import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  certificates,
  contacts,
  courseModules,
  courses,
  emailCampaigns,
  enrollments,
  lessonProgress,
  lessons,
  orders,
  automations,
  affiliatePrograms,
  entitlements,
  funnels,
  marketplaceListings,
  notifications,
  pages,
  products,
  quizAttempts,
  users,
  videoAssets,
  videoProgress,
  type Course,
  type Enrollment,
  type Lesson,
} from '@/db/schema';
import { CERTIFICATE_ALPHABET } from '@/lib/constants';
import { safeJson, slugify } from '@/lib/utils';

/**
 * Nuvra Academy — domain layer.
 *
 * Everything the learner sees is derived from the database here: access
 * (paid entitlement), progression, "continue where you left off", quiz
 * scoring, Nuvra Action completion checks and certificates.
 *
 * Security model: the *entitlement* is the source of truth for premium
 * content. An enrollment alone is not enough — a refunded Academy sale
 * revokes the entitlement and immediately locks every Academy route and API.
 */

export const ACADEMY_ENTITLEMENT_KEY = 'academy';

export interface AcademyCourse extends Course {
  moduleCount: number;
  lessonCount: number;
  totalMinutes: number;
}

export interface AcademyLessonNode extends Lesson {
  moduleSlug: string | null;
  moduleTitle: string | null;
  modulePosition: number;
}

export interface ModuleProgress {
  moduleId: string;
  total: number;
  done: number;
  pct: number;
  complete: boolean;
}

export interface CourseProgress {
  total: number;
  done: number;
  pct: number;
  completed: boolean;
  completedAt: Date | null;
}

/** The published Academy course (there is exactly one). */
export async function getAcademyCourse(): Promise<Course | null> {
  return (
    (await db
      .select()
      .from(courses)
      .where(and(eq(courses.isAcademy, true), eq(courses.status, 'PUBLISHED')))
      .get()) ?? null
  );
}

export async function getAcademyCourseBySlug(
  slug: string,
): Promise<Course | null> {
  return (
    (await db.select().from(courses).where(eq(courses.slug, slug)).get()) ?? null
  );
}

export async function getAcademyModules(
  courseId: string,
): Promise<(typeof courseModules.$inferSelect)[]> {
  return db
    .select()
    .from(courseModules)
    .where(
      and(eq(courseModules.courseId, courseId), eq(courseModules.published, true)),
    )
    .orderBy(asc(courseModules.position))
    .all();
}

export async function getModuleBySlug(
  courseId: string,
  slug: string,
): Promise<(typeof courseModules.$inferSelect) | null> {
  return (
    (await db
      .select()
      .from(courseModules)
      .where(
        and(eq(courseModules.courseId, courseId), eq(courseModules.slug, slug)),
      )
      .get()) ?? null
  );
}

export async function getModule(
  id: string,
): Promise<(typeof courseModules.$inferSelect) | null> {
  return (await db.select().from(courseModules).where(eq(courseModules.id, id)).get()) ?? null;
}

/** Lessons of a course, ordered module by module, then by position. */
export async function getCourseLessons(
  courseId: string,
  opts: { publishedOnly?: boolean } = {},
): Promise<AcademyLessonNode[]> {
  const rows = await db
    .select({ lesson: lessons, module: courseModules })
    .from(lessons)
    .leftJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(eq(lessons.courseId, courseId))
    .orderBy(asc(courseModules.position), asc(lessons.position))
    .all();

  return rows
    .filter((r) => !opts.publishedOnly || r.lesson.published)
    .map((r) => ({
      ...r.lesson,
      moduleSlug: r.module?.slug ?? null,
      moduleTitle: r.module?.title ?? null,
      modulePosition: r.module?.position ?? 0,
    }));
}

export async function getLessonBySlug(
  courseId: string,
  slug: string,
): Promise<AcademyLessonNode | null> {
  const all = await getCourseLessons(courseId);
  return all.find((l) => l.slug === slug) ?? null;
}

export async function getLesson(id: string): Promise<AcademyLessonNode | null> {
  const row = await db
    .select({ lesson: lessons, module: courseModules })
    .from(lessons)
    .leftJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(eq(lessons.id, id))
    .get();
  if (!row) return null;
  return {
    ...row.lesson,
    moduleSlug: row.module?.slug ?? null,
    moduleTitle: row.module?.title ?? null,
    modulePosition: row.module?.position ?? 0,
  };
}

/** Flat ordered list of lessons with their previous/next neighbour. */
export function withNeighbours<T extends { id: string }>(
  list: T[],
  currentId: string,
): { previous: T | null; next: T | null; index: number; total: number } {
  const index = list.findIndex((l) => l.id === currentId);
  return {
    index,
    total: list.length,
    previous: index > 0 ? list[index - 1]! : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1]! : null,
  };
}

// ── Access & entitlement ───────────────────────────────────────────

export type AcademyAccessReason =
  | 'ENTITLEMENT'
  | 'ADMIN'
  | 'ENROLLMENT_ONLY'
  | 'NO_ENROLLMENT'
  | 'REVOKED';

export interface AcademyAccess {
  granted: boolean;
  reason: AcademyAccessReason;
  course: Course | null;
  enrollment: Enrollment | null;
  entitlement: (typeof entitlements.$inferSelect) | null;
  hasEnrollment: boolean;
}

/**
 * Server-side access decision. Used by every Academy page, server action and
 * API route. The learner keeps access as long as the entitlement is ACTIVE.
 */
export async function getAcademyAccess(userId: string): Promise<AcademyAccess> {
  const course = await getAcademyCourse();
  const entitlement = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        eq(entitlements.key, ACADEMY_ENTITLEMENT_KEY),
      ),
    )
    .get();
  const enrollment = course
    ? ((await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.userId, userId),
            eq(enrollments.courseId, course.id),
          ),
        )
        .get()) ?? null)
    : null;
  const user = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!course) {
    return {
      granted: false,
      reason: 'NO_ENROLLMENT',
      course: null,
      enrollment: null,
      entitlement: entitlement ?? null,
      hasEnrollment: false,
    };
  }

  if (entitlement?.status === 'ACTIVE') {
    return {
      granted: true,
      reason: 'ENTITLEMENT',
      course,
      enrollment,
      entitlement,
      hasEnrollment: !!enrollment,
    };
  }

  // Administrators always keep access so the programme can be maintained.
  if (user?.role === 'ADMIN') {
    return {
      granted: true,
      reason: 'ADMIN',
      course,
      enrollment,
      entitlement: entitlement ?? null,
      hasEnrollment: !!enrollment,
    };
  }

  if (entitlement?.status === 'REVOKED' || entitlement?.status === 'SUSPENDED') {
    return {
      granted: false,
      reason: 'REVOKED',
      course,
      enrollment,
      entitlement,
      hasEnrollment: !!enrollment,
    };
  }

  return {
    granted: false,
    reason: 'NO_ENROLLMENT',
    course,
    enrollment,
    entitlement: entitlement ?? null,
    hasEnrollment: !!enrollment,
  };
}

export async function grantAcademyAccess(
  userId: string,
  opts: { orderId?: string | null; source?: string; note?: string | null } = {},
): Promise<void> {
  const existing = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        eq(entitlements.key, ACADEMY_ENTITLEMENT_KEY),
      ),
    )
    .get();
  if (existing) {
    await db
      .update(entitlements)
      .set({
        status: 'ACTIVE',
        orderId: opts.orderId ?? existing.orderId,
        source: opts.source ?? existing.source,
        note: opts.note ?? existing.note,
        revokedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(entitlements.id, existing.id))
      .run();
    return;
  }
  await db
    .insert(entitlements)
    .values({
      userId,
      key: ACADEMY_ENTITLEMENT_KEY,
      status: 'ACTIVE',
      source: opts.source ?? 'PURCHASE',
      orderId: opts.orderId ?? null,
      note: opts.note ?? null,
    })
    .run();
}

export async function revokeAcademyAccess(
  userId: string,
  note: string,
): Promise<void> {
  const existing = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        eq(entitlements.key, ACADEMY_ENTITLEMENT_KEY),
      ),
    )
    .get();
  if (!existing) return;
  await db
    .update(entitlements)
    .set({ status: 'REVOKED', revokedAt: new Date(), note, updatedAt: new Date() })
    .where(eq(entitlements.id, existing.id))
    .run();
}

// ── Progress ───────────────────────────────────────────────────────

export async function computeCourseProgress(
  enrollmentId: string,
): Promise<CourseProgress> {
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .get();
  if (!enrollment) return { total: 0, done: 0, pct: 0, completed: false, completedAt: null };

  const total = (
    await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.courseId, enrollment.courseId), eq(lessons.published, true)))
      .all()
  ).length;
  const done = (
    await db
      .select({ id: lessonProgress.id })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollmentId),
          sql`${lessonProgress.completedAt} is not null`,
        ),
      )
      .all()
  ).length;
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return {
    total,
    done,
    pct,
    completed: total > 0 && done >= total,
    completedAt: enrollment.completedAt,
  };
}

export async function computeModuleProgress(
  enrollmentId: string,
  moduleId: string,
): Promise<ModuleProgress> {
  const all = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(and(eq(lessons.moduleId, moduleId), eq(lessons.published, true)))
    .all();
  const done = all.length
    ? (
        await db
          .select({ id: lessonProgress.id })
          .from(lessonProgress)
          .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
          .where(
            and(
              eq(lessonProgress.enrollmentId, enrollmentId),
              eq(lessons.moduleId, moduleId),
              sql`${lessonProgress.completedAt} is not null`,
            ),
          )
          .all()
      ).length
    : 0;
  return {
    moduleId,
    total: all.length,
    done,
    pct: all.length > 0 ? Math.round((done / all.length) * 100) : 0,
    complete: all.length > 0 && done >= all.length,
  };
}

/**
 * Lessons actually *completed* by this learner.
 *
 * A lesson_progress row is also created by the video player (study time), so
 * the completion timestamp is mandatory here: a watched-but-not-finished
 * lesson must not disappear from the "next lesson to do".
 */
export async function completedLessonIds(
  enrollmentId: string,
): Promise<Set<string>> {
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.enrollmentId, enrollmentId),
        sql`${lessonProgress.completedAt} is not null`,
      ),
    )
    .all();
  return new Set(rows.map((r) => r.lessonId));
}

export interface ResumeTarget {
  moduleId: string | null;
  moduleSlug: string | null;
  moduleTitle: string | null;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  pct: number;
  videoPositionSec: number;
  lessonIndex: number;
  totalLessons: number;
}

/**
 * "Continue where you left off": the first lesson not yet completed, in
 * programme order, plus the video timestamp when we have one.
 */
export async function getResumeTarget(
  enrollmentId: string,
): Promise<ResumeTarget | null> {
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .get();
  if (!enrollment) return null;
  const list = await getCourseLessons(enrollment.courseId, { publishedOnly: true });
  if (list.length === 0) return null;
  const done = await completedLessonIds(enrollmentId);
  const target =
    list.find((l) => !done.has(l.id)) ??
    // Everything done: restart from the first lesson so the link still works.
    list[0]!;
  const video = await db
    .select()
    .from(videoProgress)
    .where(
      and(
        eq(videoProgress.enrollmentId, enrollmentId),
        eq(videoProgress.lessonId, target.id),
      ),
    )
    .get();
  const progress = await computeCourseProgress(enrollmentId);
  return {
    moduleId: target.moduleId,
    moduleSlug: target.moduleSlug,
    moduleTitle: target.moduleTitle,
    lessonId: target.id,
    lessonSlug: target.slug ?? target.id,
    lessonTitle: target.title,
    pct: progress.pct,
    videoPositionSec: video?.positionSec ?? 0,
    lessonIndex: list.findIndex((l) => l.id === target.id) + 1,
    totalLessons: list.length,
  };
}

/** Recompute + persist the enrollment progress, issue the certificate. */
export async function syncEnrollmentProgress(
  enrollmentId: string,
): Promise<CourseProgress> {
  const progress = await computeCourseProgress(enrollmentId);
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .get();
  if (!enrollment) return progress;

  const justCompleted = progress.completed && !enrollment.completedAt;
  await db
    .update(enrollments)
    .set({
      progressPct: progress.pct,
      completedAt: progress.completed ? (enrollment.completedAt ?? new Date()) : null,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, enrollmentId))
    .run();

  if (justCompleted) {
    const certificate = await issueCertificate(
      enrollmentId,
      enrollment.userId,
    );
    await db
      .insert(notifications)
      .values({
        userId: enrollment.userId,
        type: 'academy.certificate',
        title: 'Votre certificat Nuvra Academy est disponible',
        body: `Félicitations, vous avez terminé la formation. Code : ${certificate.code}.`,
        link: `/certificate/${certificate.code}`,
      })
      .run();
  }
  return progress;
}

export async function issueCertificate(
  enrollmentId: string,
  userId: string,
): Promise<{ code: string; id: string; issuedAt: Date }> {
  const existing = await db
    .select()
    .from(certificates)
    .where(eq(certificates.enrollmentId, enrollmentId))
    .get();
  if (existing) {
    return {
      code: existing.code,
      id: existing.id,
      issuedAt: existing.issuedAt,
    };
  }
  for (let attempt = 0; attempt < 12; attempt++) {
    let code = 'NV-';
    for (let i = 0; i < 10; i++) {
      code += CERTIFICATE_ALPHABET[Math.floor(Math.random() * CERTIFICATE_ALPHABET.length)];
    }
    const row = await db
      .insert(certificates)
      .values({ enrollmentId, userId, code })
      .onConflictDoNothing()
      .returning({ id: certificates.id, code: certificates.code, issuedAt: certificates.issuedAt })
      .get();
    if (row) return row;
  }
  throw new Error('Impossible de générer un certificat unique');
}

export async function getCertificateByCode(code: string) {
  return (
    (await db.select().from(certificates).where(eq(certificates.code, code)).get()) ??
    (await db.select().from(certificates).where(eq(certificates.id, code)).get()) ??
    null
  );
}

// ── Quiz ───────────────────────────────────────────────────────────

export interface QuizQuestionLike {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface QuizResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  details: { question: string; given: number; expected: number; ok: boolean; explanation: string }[];
}

export function scoreQuiz(
  questions: QuizQuestionLike[],
  answers: number[],
  passingScore: number,
): QuizResult {
  let correct = 0;
  const details = questions.map((q, i) => {
    const given = answers[i] ?? -1;
    const ok = given === q.answerIndex;
    if (ok) correct++;
    return {
      question: q.question,
      given,
      expected: q.answerIndex,
      ok,
      explanation: q.explanation ?? '',
    };
  });
  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { score, correct, total, passed: score >= passingScore, details };
}

export async function recordQuizAttempt(
  enrollmentId: string,
  userId: string,
  quizId: string,
  answers: number[],
) {
  const row = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.id, quizId))
    .get()
    .catch(() => null);
  void row;
  return db
    .insert(quizAttempts)
    .values({
      enrollmentId,
      quizId,
      userId,
      scorePct: 0,
      answers: JSON.stringify(answers),
    })
    .returning({ id: quizAttempts.id })
    .get();
}

// ── Nuvra Actions ──────────────────────────────────────────────────

export interface NuvraActionState {
  check: string;
  done: boolean;
  detail: string;
}

/**
 * Completion checks for the "Lab Nuvra" buttons. Each one is evaluated
 * against the learner's *real* workspace data — the button turns green only
 * when the object actually exists in the database.
 */
export async function evaluateNuvraAction(
  workspaceId: string,
  userId: string,
  check: string,
  enrollmentId?: string,
): Promise<NuvraActionState> {
  const done = async (
    value: boolean,
    detail: string,
  ): Promise<NuvraActionState> => ({ check, done: value, detail });

  switch (check) {
    case 'product_created': {
      const row = await db
        .select({ name: products.name })
        .from(products)
        .where(eq(products.workspaceId, workspaceId))
        .get();
      return done(!!row, row ? `Produit : ${row.name}` : 'Aucun produit pour le moment');
    }
    case 'product_published': {
      const row = await db
        .select({ name: products.name })
        .from(products)
        .where(and(eq(products.workspaceId, workspaceId), eq(products.status, 'PUBLISHED')))
        .get();
      return done(!!row, row ? `Publié : ${row.name}` : 'Aucun produit publié');
    }
    case 'funnel_created':
    case 'funnel_published': {
      const rows = await db
        .select({ name: funnels.name, status: funnels.status })
        .from(funnels)
        .where(eq(funnels.workspaceId, workspaceId))
        .all();
      const published = rows.find((r) => r.status === 'PUBLISHED');
      const any = rows[0];
      if (check === 'funnel_published') {
        return done(!!published, published ? `Publié : ${published.name}` : 'Aucun funnel publié');
      }
      return done(!!any, any ? `Funnel : ${any.name}` : 'Aucun funnel créé');
    }
    case 'page_created':
    case 'page_published': {
      const rows = await db
        .select({ title: pages.title, status: pages.status })
        .from(pages)
        .where(eq(pages.workspaceId, workspaceId))
        .all();
      const published = rows.find((r) => r.status === 'PUBLISHED');
      if (check === 'page_published') {
        return done(!!published, published ? `Publiée : ${published.title}` : 'Aucune page publiée');
      }
      return done(rows.length > 0, rows[0] ? `Page : ${rows[0].title}` : 'Aucune page créée');
    }
    case 'course_created': {
      const row = await db
        .select({ title: courses.title })
        .from(courses)
        .where(
          and(
            eq(courses.workspaceId, workspaceId),
            sql`${courses.isAcademy} = 0`,
          ),
        )
        .get();
      return done(!!row, row ? `Formation : ${row.title}` : 'Aucune formation créée');
    }
    case 'email_campaign_created': {
      const row = await db
        .select({ name: emailCampaigns.name })
        .from(emailCampaigns)
        .where(eq(emailCampaigns.workspaceId, workspaceId))
        .get();
      return done(!!row, row ? `Campagne : ${row.name}` : 'Aucune campagne créée');
    }
    case 'automation_created': {
      const row = await db
        .select({ name: automations.name })
        .from(automations)
        .where(eq(automations.workspaceId, workspaceId))
        .get();
      return done(!!row, row ? `Automatisation : ${row.name}` : 'Aucune automatisation créée');
    }
    case 'crm_contact_created': {
      const row = await db
        .select({ email: contacts.email })
        .from(contacts)
        .where(eq(contacts.workspaceId, workspaceId))
        .get();
      return done(!!row, row ? `Contact : ${row.email}` : 'Aucun contact enregistré');
    }
    case 'affiliate_program_created': {
      const row = await db
        .select({ name: affiliatePrograms.name })
        .from(affiliatePrograms)
        .where(eq(affiliatePrograms.workspaceId, workspaceId))
        .get();
      return done(!!row, row ? `Programme : ${row.name}` : 'Aucun programme d’affiliation');
    }
    case 'marketplace_consulted': {
      const row = await db
        .select({ title: marketplaceListings.title })
        .from(marketplaceListings)
        .where(eq(marketplaceListings.workspaceId, workspaceId))
        .get();
      return done(!!row, row ? `Fiche : ${row.title}` : 'Aucune fiche soumise');
    }
    case 'order_paid': {
      const rows = await db
        .select({ totalCents: orders.totalCents })
        .from(orders)
        .where(and(eq(orders.buyerUserId, userId), eq(orders.status, 'PAID')))
        .all();
      return done(rows.length > 0, `${rows.length} commande(s) payante(s)`);
    }
    case 'analytics_consulted': {
      const view = await db
        .select({ id: pages.id })
        .from(pages)
        .where(eq(pages.workspaceId, workspaceId))
        .get();
      return done(!!view, view ? 'Statistiques disponibles' : 'Créez une page pour suivre les visites');
    }
    case 'business_defined': {
      if (!enrollmentId) return done(false, 'Aucune inscription');
      const row = await db
        .select({ id: sql<string>`id` })
        .from(sql`academy_submissions`)
        .where(
          sql`enrollment_id = ${enrollmentId} and kind = 'WORKSHOP'`,
        )
        .get()
        .catch(() => null);
      return done(!!row, row ? 'Fiche business enregistrée' : 'Atelier non renseigné');
    }
    default:
      return done(false, 'Vérification inconnue');
  }
}

export async function evaluateNuvraActions(
  workspaceId: string,
  userId: string,
  checks: string[],
  enrollmentId?: string,
): Promise<Record<string, NuvraActionState>> {
  const entries = await Promise.all(
    [...new Set(checks.filter(Boolean))].map(
      async (c) => [c, await evaluateNuvraAction(workspaceId, userId, c, enrollmentId)] as const,
    ),
  );
  return Object.fromEntries(entries);
}

// ── Video assets & progress ────────────────────────────────────────

export async function getLessonVideo(lessonId: string) {
  return (
    (await db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.lessonId, lessonId))
      .get()) ?? null
  );
}

export async function getModuleVideo(moduleId: string) {
  return (
    (await db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.moduleId, moduleId))
      .get()) ?? null
  );
}

export async function getVideoForLesson(lessonId: string) {
  const lesson = await getLesson(lessonId);
  if (!lesson) return null;
  const own = await getLessonVideo(lessonId);
  if (own) return { asset: own, scope: 'LESSON' as const };
  if (lesson.moduleId) {
    const mod = await getModuleVideo(lesson.moduleId);
    if (mod) return { asset: mod, scope: 'MODULE' as const };
  }
  return null;
}

export async function getVideoProgressRow(enrollmentId: string, lessonId: string) {
  return (
    (await db
      .select()
      .from(videoProgress)
      .where(
        and(
          eq(videoProgress.enrollmentId, enrollmentId),
          eq(videoProgress.lessonId, lessonId),
        ),
      )
      .get()) ?? null
  );
}

/** Academy analytics: real aggregates, never invented numbers. */
export async function getAcademyAnalytics() {
  const course = await getAcademyCourse();
  if (!course) {
    return {
      course: null,
      enrollments: 0,
      activeStudents: 0,
      completed: 0,
      averageProgress: 0,
      quizSuccessRate: null as number | null,
      averageLearningMinutes: 0,
      videoCompletions: 0,
      revenueCents: 0,
      refundsCents: 0,
      resellerSales: 0,
      moduleStats: [] as {
        moduleId: string;
        title: string;
        total: number;
        done: number;
        pct: number;
      }[],
      lessonStats: [] as {
        lessonId: string;
        title: string;
        total: number;
        done: number;
        pct: number;
      }[],
      dropOff: [] as { lessonId: string; title: string; total: number; done: number; pct: number }[],
    };
  }

  const enrol = await db.select().from(enrollments).where(eq(enrollments.courseId, course.id)).all();
  const mods = await getAcademyModules(course.id);
  const allLessons = await getCourseLessons(course.id, { publishedOnly: true });
  const lessonIds = allLessons.map((l) => l.id);
  const progressRows = lessonIds.length
    ? await db
        .select()
        .from(lessonProgress)
        .where(inArray(lessonProgress.lessonId, lessonIds))
        .all()
    : [];

  const doneByLesson = new Map<string, number>();
  for (const r of progressRows) {
    if (r.completedAt) doneByLesson.set(r.lessonId, (doneByLesson.get(r.lessonId) ?? 0) + 1);
  }

  const enrolledIds = new Set(enrol.map((e) => e.id));
  const scoped = progressRows.filter((r) => enrolledIds.has(r.enrollmentId));
  const timeSeconds = scoped.reduce((s, r) => s + (r.secondsSpent ?? 0), 0);

  const quizRows = await db
    .select()
    .from(quizAttempts)
    .where(inArray(quizAttempts.enrollmentId, enrol.length ? enrol.map((e) => e.id) : ['none']))
    .all();
  const quizPct = quizRows.length
    ? Math.round(quizRows.reduce((s, q) => s + q.scorePct, 0) / quizRows.length)
    : null;

  const paidOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.kind, 'ACADEMY_SALE'), eq(orders.status, 'PAID')))
    .all();
  const refunded = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.kind, 'ACADEMY_SALE'),
        sql`${orders.status} in ('REFUNDED','PARTIALLY_REFUNDED')`,
      ),
    )
    .all();

  const videosDone = await db
    .select({ id: videoProgress.id })
    .from(videoProgress)
    .where(sql`${videoProgress.completedAt} is not null`)
    .all();

  return {
    course,
    enrollments: enrol.length,
    activeStudents: enrol.filter((e) => !e.completedAt).length,
    completed: enrol.filter((e) => e.completedAt).length,
    averageProgress: enrol.length
      ? Math.round(enrol.reduce((s, e) => s + e.progressPct, 0) / enrol.length)
      : 0,
    quizSuccessRate: quizPct,
    averageLearningMinutes: enrol.length
      ? Math.round(timeSeconds / 60 / enrol.length)
      : 0,
    videoCompletions: videosDone.length,
    revenueCents: paidOrders.reduce((s, o) => s + o.totalCents, 0),
    refundsCents: refunded.reduce((s, o) => s + o.totalCents, 0),
    resellerSales: paidOrders.filter((o) => o.resellerId).length,
    moduleStats: mods.map((m) => {
      const ids = allLessons.filter((l) => l.moduleId === m.id).map((l) => l.id);
      const done = ids.reduce((s, id) => s + (doneByLesson.get(id) ?? 0), 0);
      return {
        moduleId: m.id,
        title: m.title,
        total: ids.length,
        done,
        pct: ids.length ? Math.round((done / ids.length) * 100) : 0,
      };
    }),
    lessonStats: allLessons.map((l) => {
      const done = doneByLesson.get(l.id) ?? 0;
      return {
        lessonId: l.id,
        title: l.title,
        total: enrol.length,
        done,
        pct: enrol.length ? Math.round((done / enrol.length) * 100) : 0,
      };
    }),
    dropOff: allLessons
      .map((l) => {
        const done = doneByLesson.get(l.id) ?? 0;
        return {
          lessonId: l.id,
          title: l.title,
          total: enrol.length,
          done,
          pct: enrol.length ? Math.round((done / enrol.length) * 100) : 0,
        };
      })
      .filter((l) => l.total > 0)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 5),
  };
}

/** Public preview lessons (never premium-only data). */
export async function getPreviewLessons(courseId: string) {
  return db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), eq(lessons.isPreview, true)))
    .orderBy(asc(lessons.position))
    .all();
}

export function academyLessonHref(lesson: {
  moduleSlug: string | null;
  slug: string | null;
  id: string;
}): string {
  return `/dashboard/academy/${lesson.moduleSlug ?? 'module'}/lecon/${lesson.slug ?? lesson.id}`;
}

export { safeJson, slugify };
