import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  courses,
  emailSequenceSteps,
  emailSequences,
  enrollments,
  lessonProgress,
  users,
  workspaces,
} from '@/db/schema';
import { scheduleEmail, sendEmail } from '@/lib/email';
import { appUrl } from '@/lib/utils';

/**
 * Nuvra Academy — onboarding email sequence.
 *
 * Six real messages, written as a sequence on the platform workspace so an
 * administrator can read, edit and inspect them (Admin → Emails shows the
 * outbox, the sequence lives in the database).
 *
 * Messages are sent through the Nuvra email layer: with RESEND_API_KEY they
 * are delivered, without it they are queued in the outbox and clearly marked
 * as not delivered. Nothing is ever faked.
 */

export interface AcademyEmail {
  key: string;
  delayHours: number;
  subject: (name: string) => string;
  body: (name: string, link: string) => string;
}

const sign = (name: string) => `Bonjour ${name},\n\n`;

export const ACADEMY_EMAILS: AcademyEmail[] = [
  {
    key: 'welcome',
    delayHours: 0,
    subject: () => 'Bienvenue dans Nuvra Academy',
    body: (name, link) =>
      `${sign(name)}Votre accès à Nuvra Academy est ouvert.\n\nLe programme est en 8 modules. Chaque leçon suit la même logique : comprendre, appliquer dans Nuvra, faire l'exercice, valider, passer à la suite.\n\nCommencez ici : ${link}/dashboard/academy\n\nTake your time, but do not skip the labs : c'est en construisant dans Nuvra que le programme devient une activité.\n\n— L'équipe Nuvra`,
  },
  {
    key: 'start-module-1',
    delayHours: 2,
    subject: () => 'Commencez par le module 1',
    body: (name, link) =>
      `${sign(name)}Le module 1 — Comprendre l'écosystème digital — est le point de départ.\n\nIl se termine par un atelier : vous y écrivez votre niche, votre audience, votre problème et votre offre. Cette fiche devient le cahier des charges de tout le reste du programme.\n\n${link}/dashboard/academy/ecosysteme-digital\n\nÀ tout de suite,\n— L'équipe Nuvra`,
  },
  {
    key: 'no-progress',
    delayHours: 72,
    subject: () => 'Votre Académie vous attend',
    body: (name, link) =>
      `${sign(name)}Vous avez commencé Nuvra Academy, mais le parcours s'arrête souvent ici.\n\nLa règle qui fonctionne : une leçon par jour, puis l'exercice dans Nuvra avant de passer à la suivante. Quinze minutes suffisent.\n\nReprenez exactement où vous vous étiez arrêté : ${link}/dashboard/academy\n\n— L'équipe Nuvra`,
  },
  {
    key: 'encouragement',
    delayHours: 336,
    subject: () => 'Vous avez construit une vraie base',
    body: (name, link) =>
      `${sign(name)}Deux semaines après votre inscription, vous avez déjà un produit, un tunnel et une première page. C'est exactement là où la plupart des gens s'arrêtent.\n\nLe prochain bloc — acquisition, conversion, automatisation — transforme ce que vous avez construit en système qui tourne sans vous.\n\n${link}/dashboard/academy\n\nContinuez, vous êtes sur la bonne trajectoire.\n— L'équipe Nuvra`,
  },
  {
    key: 'completion',
    delayHours: 0, // déclenché à la complétion, pas planifié
    subject: () => 'Félicitations — Nuvra Academy est terminé',
    body: (name, link) =>
      `${sign(name)}Vous avez terminé les 8 modules.\n\nVous n'avez pas seulement followed une formation : vous avez construit un produit, un tunnel, un système d'acquisition, des automations et un plan de croissance dans Nuvra.\n\nVotre certificat est disponible, avec un lien de vérification publique que vous pouvez partager.\n\n${link}/dashboard/academy\n\n— L'équipe Nuvra`,
  },
  {
    key: 'certificate',
    delayHours: 0, // déclenché à l'émission du certificat
    subject: () => 'Votre certificat Nuvra Academy',
    body: (name, link) =>
      `${sign(name)}Votre certificat de fin de parcours est prêt.\n\nIl porte un identifiant unique et une page de vérification publique : gardez le lien, il vous suivra.\n\n${link}/dashboard/academy\n\n— L'équipe Nuvra`,
  },
];

async function platformWorkspaceId(): Promise<string | null> {
  const row =
    (await db.select().from(workspaces).where(eq(workspaces.isPlatform, true)).get()) ??
    (await db.select().from(workspaces).where(eq(workspaces.slug, 'nuvra')).get());
  return row?.id ?? null;
}

/**
 * Create (once) the Academy welcome sequence on the platform workspace.
 * Idempotent: re-running updates the steps instead of duplicating them.
 */
export async function ensureAcademySequence(): Promise<string | null> {
  const workspaceId = await platformWorkspaceId();
  if (!workspaceId) return null;
  const name = 'Nuvra Academy — parcours apprenant';
  const existing = await db
    .select()
    .from(emailSequences)
    .where(and(eq(emailSequences.workspaceId, workspaceId), eq(emailSequences.name, name)))
    .get();
  const sequence =
    existing ??
    (await db
      .insert(emailSequences)
      .values({
        workspaceId,
        name,
        triggerEvent: 'academy.purchased',
        active: true,
      })
      .returning()
      .get());
  if (!sequence) return null;

  for (const [i, email] of ACADEMY_EMAILS.filter((e) => e.delayHours > 0).entries()) {
    const step = await db
      .select()
      .from(emailSequenceSteps)
      .where(
        and(
          eq(emailSequenceSteps.sequenceId, sequence.id),
          eq(emailSequenceSteps.position, i),
        ),
      )
      .get();
    const payload = {
      subject: email.subject('apprenant'),
      body: email.body('{{name}}', '{{link}}'),
      delayHours: email.delayHours,
    };
    if (step) {
      await db.update(emailSequenceSteps).set(payload).where(eq(emailSequenceSteps.id, step.id)).run();
    } else {
      await db
        .insert(emailSequenceSteps)
        .values({ sequenceId: sequence.id, position: i, ...payload })
        .run();
    }
  }
  return sequence.id;
}

/** Immediate message (welcome, certificate, completion). */
export async function sendAcademyEmail(input: {
  to: string;
  userId?: string | null;
  key: string;
}): Promise<void> {
  const email = ACADEMY_EMAILS.find((e) => e.key === input.key);
  if (!email) return;
  const user = input.userId
    ? await db.select({ name: users.name }).from(users).where(eq(users.id, input.userId)).get()
    : null;
  const name = user?.name?.split(' ')[0] ?? 'et bienvenue';
  const link = appUrl('');
  await sendEmail({
    to: input.to,
    subject: email.subject(name),
    body: email.body(name, link),
    workspaceId: await platformWorkspaceId(),
    relatedTo: `academy:${input.key}`,
  });
}

/**
 * Start the onboarding sequence for a buyer: the welcome message goes out
 * immediately, the following messages are scheduled with their delays and
 * processed by the cron endpoint (`/api/cron/process`).
 */
export async function startAcademySequence(input: {
  userId: string;
  email: string;
}): Promise<void> {
  const workspaceId = await platformWorkspaceId();
  const user = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, input.userId))
    .get();
  const name = user?.name?.split(' ')[0] ?? 'et bienvenue';
  const link = appUrl('');
  const academy = await db.select().from(courses).where(eq(courses.isAcademy, true)).get();

  await sendAcademyEmail({ to: input.email, userId: input.userId, key: 'welcome' });

  for (const email of ACADEMY_EMAILS.filter((e) => e.delayHours > 0)) {
    await scheduleEmail({
      to: input.email,
      subject: email.subject(name),
      body: email.body(name, link),
      workspaceId,
      relatedTo: `academy:${email.key}`,
      runAt: new Date(Date.now() + email.delayHours * 3600_000),
    });
  }

  if (academy) {
    await emitAcademyEvent({
      userId: input.userId,
      email: input.email,
      name: user?.name ?? 'Apprenant',
      courseId: academy.id,
    });
  }
}

async function emitAcademyEvent(payload: {
  userId: string;
  email: string;
  name: string;
  courseId: string;
}): Promise<void> {
  const { emitEvent } = await import('@/lib/events');
  const workspaceId = await platformWorkspaceId();
  await emitEvent({
    name: 'academy.purchased',
    workspaceId,
    userId: payload.userId,
    payload,
  });
}

/** Has the learner started? Used to keep the "no progress" email relevant. */
export async function academyStartedAt(userId: string): Promise<number | null> {
  const row = await db
    .select({ createdAt: enrollments.createdAt })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(enrollments.userId, userId), eq(courses.isAcademy, true)))
    .get();
  return row?.createdAt.getTime() ?? null;
}

export async function academyCompletedLessonCount(userId: string): Promise<number> {
  const rows = await db
    .select({ id: lessonProgress.id })
    .from(lessonProgress)
    .innerJoin(enrollments, eq(lessonProgress.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(enrollments.userId, userId), eq(courses.isAcademy, true)))
    .all();
  return rows.length;
}
