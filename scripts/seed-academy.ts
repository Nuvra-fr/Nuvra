#!/usr/bin/env tsx
/**
 * Nuvra Academy — content seed.
 *
 * Projects the typed programme (src/content/academy) into the database:
 * course → modules → lessons → videos → quizzes → resources.
 *
 * Idempotent, and safe to re-run:
 *   • rows are matched by slug;
 *   • a lesson that already exists keeps its *edited* fields (content,
 *     objectives, resources, exercise, quiz, video) — only its structure
 *     (title, position, module, duration, visibility) is refreshed, so an
 *     administrator's work is never overwritten by a deploy;
 *   • pass --force to overwrite lesson content with the authored version.
 *
 * Run with: npm run db:seed  (or: tsx scripts/seed-academy.ts --force)
 */
import { and, eq, isNull, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  courseModules,
  courses,
  enrollments,
  lessons,
  quizzes,
  users,
  videoAssets,
  workspaces,
} from '@/db/schema';
import { ACADEMY } from '@/content/academy';
import { buildLesson, buildModule } from '@/content/academy/builder';
import { academyPriceCents, setConfig } from '@/lib/config';
import { pathToFileURL } from 'node:url';
import { slugify } from '@/lib/utils';
import { bootstrapDatabase } from '@/lib/startup';

export const FORCE = process.argv.includes('--force');

/** Legacy curriculum created by the first seed run (no slugs). */
async function clearLegacyCurriculum(courseId: string): Promise<number> {
  const legacyLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), isNull(lessons.slug)))
    .all();
  if (legacyLessons.length === 0) return 0;
  for (const l of legacyLessons) {
    await db.delete(lessons).where(eq(lessons.id, l.id)).run();
  }
  await db
    .delete(courseModules)
    .where(and(eq(courseModules.courseId, courseId), isNull(courseModules.slug)))
    .run();
  return legacyLessons.length;
}

export async function seedAcademyContent(opts: { force?: boolean } = {}): Promise<void> {
  const force = opts.force ?? process.argv.includes('--force');
  await setConfig('academy.name', 'Nuvra Academy');

  const platform =
    (await db.select().from(workspaces).where(eq(workspaces.isPlatform, true)).get()) ??
    (await db.select().from(workspaces).where(eq(workspaces.slug, 'nuvra')).get());
  if (!platform) {
    throw new Error(
      'Plateforme Nuvra introuvable — lancez d’abord `npm run db:migrate` avec ADMIN_EMAIL / ADMIN_PASSWORD.',
    );
  }
  const admin = await db.select({ id: users.id }).from(users).where(eq(users.role, 'ADMIN')).get();
  if (!admin) {
    throw new Error('Aucun administrateur — lancez `npm run db:migrate` avec ADMIN_EMAIL / ADMIN_PASSWORD.');
  }

  const priceCents = await academyPriceCents();

  // Lookup first: `courses.slug` is not unique in the schema, so an
  // insert-first seed would create a second Academy on every run.
  const allAcademyCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.isAcademy, true))
    .all();
  let academy = allAcademyCourses.find((c) => c.slug === ACADEMY.slug) ?? null;

  if (!academy) {
    academy =
      (await db.select().from(courses).where(eq(courses.slug, ACADEMY.slug)).get()) ??
      (await db
        .insert(courses)
        .values({
          workspaceId: platform.id,
          title: ACADEMY.title,
          slug: ACADEMY.slug,
          description: ACADEMY.description,
          priceCents,
          currency: 'usd',
          status: 'PUBLISHED',
          level: ACADEMY.level,
          category: ACADEMY.category,
          isAcademy: true,
          publishedAt: new Date(),
          syllabus: JSON.stringify(ACADEMY.modules.map((m) => m.title)),
        })
        .returning()
        .get());
  }
  if (!academy) throw new Error('Impossible de créer la formation Académie');

  // Safety net: several Academy courses (e.g. a seed that ran before the slug
  // was enforced). The oldest wins; the others are removed only when nobody is
  // enrolled in them, so learner history is never destroyed.
  const duplicates = allAcademyCourses.filter(
    (c) => c.id !== academy!.id && c.isAcademy && c.slug === ACADEMY.slug,
  );
  for (const dup of duplicates) {
    const enrolled = (
      await db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.courseId, dup.id)).all()
    ).length;
    if (enrolled > 0) {
      console.warn(
        `  ⚠️ Une seconde formation Académie (${dup.id}) a ${enrolled} inscription(s) — laissée intacte, intervention manuelle requise.`,
      );
      continue;
    }
    const dupLessons = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.courseId, dup.id))
      .all();
    for (const l of dupLessons) await db.delete(lessons).where(eq(lessons.id, l.id)).run();
    await db.delete(courseModules).where(eq(courseModules.courseId, dup.id)).run();
    await db.delete(courses).where(eq(courses.id, dup.id)).run();
    console.log(`  · doublon Académie ${dup.id} supprimé (aucune inscription)`);
  }

  // Metadata always refreshed (admin may tune title/description/price in Admin).
  await db
    .update(courses)
    .set({
      title: ACADEMY.title,
      description: ACADEMY.description,
      level: ACADEMY.level,
      category: ACADEMY.category,
      isAcademy: true,
      status: 'PUBLISHED',
      updatedAt: new Date(),
    })
    .where(eq(courses.id, academy.id))
    .run();

  const removed = await clearLegacyCurriculum(academy.id);
  if (removed > 0) console.log(`  · ${removed} leçons héritées supprimées`);

  let quizCount = 0;
  let videoCount = 0;

  for (const [mi, moduleInput] of ACADEMY.modules.entries()) {
    const built = buildModule(moduleInput);
    const existingModule = await db
      .select()
      .from(courseModules)
      .where(
        and(eq(courseModules.courseId, academy.id), eq(courseModules.slug, built.slug)),
      )
      .get();

    const moduleRow =
      existingModule ??
      (await db
        .insert(courseModules)
        .values({
          courseId: academy.id,
          title: built.title,
          slug: built.slug,
          description: built.description,
          objectives: JSON.stringify(built.objectives),
          position: mi,
          published: true,
        })
        .returning()
        .get());

    if (existingModule) {
      await db
        .update(courseModules)
        .set({ title: built.title, position: mi, updatedAt: new Date() })
        .where(eq(courseModules.id, moduleRow!.id))
        .run();
    }

    // Module video (script, storyboard, chapters, transcript)
    const moduleVideo = {
      title: built.video.title,
      slug: `${built.slug}-video`,
      description: built.video.description,
      status: 'SCRIPTED',
      durationSec: built.video.durationSec,
      script: built.video.script,
      storyboard: JSON.stringify(built.video.storyboard),
      chapters: JSON.stringify(built.video.chapters),
      transcript: built.video.transcript,
      brand: 'nuvra-dark-blue',
    };
    const existingModuleVideo = await db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.moduleId, moduleRow!.id))
      .get();
    if (!existingModuleVideo) {
      await db.insert(videoAssets).values({ moduleId: moduleRow!.id, ...moduleVideo }).run();
      videoCount++;
    }

    for (const [li, lessonInput] of built.lessons.entries()) {
      const rawLesson = moduleInput.lessons[li]!;
      const position = mi * 100 + li;
      const existing = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.courseId, academy.id), eq(lessons.slug, lessonInput.slug)))
        .get();

      const base = {
        courseId: academy.id,
        moduleId: moduleRow!.id,
        title: lessonInput.title,
        type: lessonInput.type,
        position,
        isPreview: lessonInput.isPreview,
        durationMin: lessonInput.durationMin,
        published: true,
        updatedAt: new Date(),
      };

      if (!existing) {
        await db
          .insert(lessons)
          .values({
            ...base,
            slug: lessonInput.slug,
            shortDescription: lessonInput.shortDescription,
            content: lessonInput.content,
            objectives: JSON.stringify(lessonInput.objectives),
            resources: JSON.stringify(buildLesson(rawLesson).resources),
            exercise: lessonInput.exercise,
            nuvraAction: lessonInput.nuvraAction
              ? JSON.stringify(lessonInput.nuvraAction)
              : null,
            completionCriteria: JSON.stringify(lessonInput.completionCriteria),
            difficulty: lessonInput.difficulty,
            durationSec: lessonInput.durationSec,
          })
          .run();
      } else if (force) {
        await db
          .update(lessons)
          .set({
            ...base,
            shortDescription: lessonInput.shortDescription,
            content: lessonInput.content,
            objectives: JSON.stringify(lessonInput.objectives),
            resources: JSON.stringify(buildLesson(rawLesson).resources),
            exercise: lessonInput.exercise,
            nuvraAction: lessonInput.nuvraAction
              ? JSON.stringify(lessonInput.nuvraAction)
              : null,
            completionCriteria: JSON.stringify(lessonInput.completionCriteria),
            difficulty: lessonInput.difficulty,
            durationSec: lessonInput.durationSec,
          })
          .where(eq(lessons.id, existing.id))
          .run();
      } else {
        await db.update(lessons).set(base).where(eq(lessons.id, existing.id)).run();
      }

      const lessonRow = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.courseId, academy.id), eq(lessons.slug, lessonInput.slug)))
        .get();
      if (!lessonRow) continue;

      // Lesson video package
      if (lessonInput.video) {
        const existingVideo = await db
          .select({ id: videoAssets.id })
          .from(videoAssets)
          .where(eq(videoAssets.lessonId, lessonRow.id))
          .get();
        if (!existingVideo) {
          await db
            .insert(videoAssets)
            .values({
              lessonId: lessonRow.id,
              title: lessonInput.video.title,
              slug: `${lessonInput.slug}-video`,
              description: lessonInput.video.description,
              status: 'SCRIPTED',
              durationSec: lessonInput.video.durationSec,
              script: lessonInput.video.script,
              storyboard: JSON.stringify(lessonInput.video.storyboard),
              chapters: JSON.stringify(lessonInput.video.chapters),
              transcript: lessonInput.video.transcript,
              brand: 'nuvra-dark-blue',
            })
            .run();
          videoCount++;
        }
      }

      // Quiz
      if (lessonInput.quiz) {
        const existingQuiz = await db
          .select({ id: quizzes.id })
          .from(quizzes)
          .where(eq(quizzes.lessonId, lessonRow.id))
          .get();
        if (!existingQuiz) {
          await db
            .insert(quizzes)
            .values({
              lessonId: lessonRow.id,
              title: lessonInput.quiz.title,
              passingScore: lessonInput.quiz.passingScore,
              questions: JSON.stringify(lessonInput.quiz.questions),
            })
            .run();
          quizCount++;
        } else if (force) {
          await db
            .update(quizzes)
            .set({
              title: lessonInput.quiz.title,
              passingScore: lessonInput.quiz.passingScore,
              questions: JSON.stringify(lessonInput.quiz.questions),
            })
            .where(eq(quizzes.id, existingQuiz.id))
            .run();
        }
      }
    }
  }

  const totalModules = (
    await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, academy.id))
      .orderBy(asc(courseModules.position))
      .all()
  ).length;
  const totalLessons = (
    await db.select().from(lessons).where(eq(lessons.courseId, academy.id)).all()
  ).length;

  console.log(
    `✅ Académie Nuvra : ${totalModules} modules, ${totalLessons} leçons, ${videoCount} vidéos, ${quizCount} quiz${force ? ' (contenu réécrit — --force)' : ''}`,
  );
  console.log(`   slug: ${slugify(ACADEMY.title)} · prix: ${priceCents / 100} €`);
}

// CLI entry point only — importing this file (npm run db:seed) just exports
// seedAcademyContent().
const invokedDirectly =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  bootstrapDatabase()
    .then(() => seedAcademyContent())
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('Échec du seed Académie :', e);
      process.exit(1);
    });
}
