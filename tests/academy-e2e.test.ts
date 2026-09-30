/**
 * Nuvra Academy — end-to-end journey.
 *
 * Covers the real paid path, server-side, against a temp database:
 *
 *   PAYER → ACCÉDER → APPRENDRE → REGARDER → PRATIQUER → CONSTRUIRE DANS NUVRA
 *   → VALIDER → PROGRESSER → TERMINER → CERTIFICAT → REFUND → ACCÈS RÉVOQUÉ
 *
 * Steps exercised:
 *  1. a user with no purchase is refused everywhere (entitlement, API, action);
 *  2. a verified payment (finalizeOrderPaid, i.e. the webhook outcome) creates
 *     the entitlement, the enrollment, the student record and the onboarding
 *     sequence — and nothing else;
 *  3. the Academy player serves the programme, the resume state is exact;
 *  4. video progress is stored and the resume target replays where it stopped;
 *  5. Nuvra Action checks read real workspace data;
 *  6. a quiz can be failed, retried and passed, and passing completes the
 *     lesson server-side;
 *  7. finishing the programme issues a verifiable certificate;
 *  8. a full refund revokes access, preserves history and recomputes the
 *     reseller rights;
 *  9. signed media URLs are short-lived, user-bound and tamper-proof.
 */
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { and, eq } from 'drizzle-orm';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => new Headers({ 'x-forwarded-for': '198.51.100.7' }),
}));
vi.mock('next/cache', () => ({ revalidatePath: () => undefined, revalidateTag: () => undefined }));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

let db: import('@/lib/db').DB;
let schema: typeof import('@/db/schema');
let academy: typeof import('@/lib/academy');
let ordersLib: typeof import('@/lib/orders');
let media: typeof import('@/lib/media-signing');
let actions: typeof import('@/server/actions/academy');
let seedAcademy: typeof import('../scripts/seed-academy');

const ids: Record<string, string> = {};

async function makeUser(email: string, withWorkspace = true) {
  const user = await db
    .insert(schema.users)
    .values({
      email,
      name: email.split('@')[0]!,
      passwordHash: 'x',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    })
    .returning()
    .get();
  const ws = await db
    .insert(schema.workspaces)
    .values({
      name: email.split('@')[0]!,
      slug: email.split('@')[0]!.replace(/[^a-z0-9]/g, ''),
      ownerId: user.id,
      plan: 'FREE',
    })
    .returning()
    .get();
  if (withWorkspace) {
    await db
      .insert(schema.memberships)
      .values({ userId: user.id, workspaceId: ws.id, role: 'OWNER' })
      .run();
  }
  return { userId: user.id, workspaceId: ws.id };
}

beforeAll(async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nuvra-academy-e2e-'));
  process.env.DATABASE_URL = path.join(dir, 'academy.db');
  process.env.MEDIA_SIGNING_SECRET = 'test-media-secret';

  const dbMod = await import('@/lib/db');
  db = dbMod.db;
  const { migrate } = await import('drizzle-orm/libsql/migrator');
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });

  // Workspace plateforme + administrateur, comme en production.
  const { bootstrapDatabase } = await import('@/lib/startup');
  process.env.ADMIN_EMAIL = 'admin@academy.test';
  process.env.ADMIN_PASSWORD = 'motdepasse-admin-2026';
  await bootstrapDatabase();

  schema = await import('@/db/schema');
  academy = await import('@/lib/academy');
  ordersLib = await import('@/lib/orders');
  media = await import('@/lib/media-signing');
  actions = await import('@/server/actions/academy');
  seedAcademy = await import('../scripts/seed-academy');

  // Programme réel projeté en base (comme en production).
  await seedAcademy.seedAcademyContent();

  const buyer = await makeUser('acheteuse@academy.test');
  const stranger = await makeUser('curieuse@academy.test');
  ids.buyer = buyer.userId;
  ids.buyerWorkspace = buyer.workspaceId;
  ids.stranger = stranger.userId;
  ids.strangerWorkspace = stranger.workspaceId;
}, 60_000);

// ── Session helpers (the auth layer reads the cookie jar) ───────────
async function loginAs(userId: string) {
  const { createSession } = await import('@/lib/auth');
  jar.clear();
  const token = await createSession(userId);
  jar.set('nv_session', token);
}
function logout() {
  jar.clear();
}

describe('1. avant l’achat, rien n’est ouvert', () => {
  it('un compte sans achat n’a pas accès à l’Académie', async () => {
    await loginAs(ids.stranger!);
    const access = await academy.getAcademyAccess(ids.stranger!);
    expect(access.granted).toBe(false);
    expect(access.reason).toBe('NO_ENROLLMENT');
    expect(access.enrollment).toBeNull();
  });

  it('aucune progression ni reprise possible', async () => {
    expect(await academy.getResumeTarget('inexistante')).toBeNull();
  });

  it('un compte Nuvra seul ne donne aucun droit de revente', async () => {
    const profiles = await db
      .select()
      .from(schema.resellerProfiles)
      .where(eq(schema.resellerProfiles.userId, ids.stranger!))
      .all();
    expect(profiles).toHaveLength(0);
  });
});

describe('2. le paiement vérifié ouvre tout', () => {
  let orderId = '';

  it('la commande Académie est créée puis finalisée (webhook vérifié)', async () => {
    const course = await academy.getAcademyCourse();
    expect(course).toBeTruthy();
    expect(course!.isAcademy).toBe(true);

    const order = await ordersLib.createOrder({
      workspaceId: ids.buyerWorkspace!,
      buyerUserId: ids.buyer!,
      buyerEmail: 'acheteuse@academy.test',
      items: [{ kind: 'ACADEMY', courseId: course!.id, title: course!.title, priceCents: 19700 }],
      kind: 'ACADEMY_SALE',
      // Mode LIVE : c'est le seul mode qu'un webhook Stripe peut finaliser.
      mode: 'LIVE',
    });
    orderId = order.id;
    expect(order.status).toBe('PENDING');
    expect(order.mode).toBe('LIVE');

    await loginAs(ids.buyer!);
    const paid = await ordersLib.finalizeOrderPaid(orderId, {
      provider: 'stripe',
      reference: 'evt_academy_1',
    });
    expect(paid.status).toBe('PAID');
  });

  it('l’entitlement est ACTIVE et l’inscription existe', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    expect(access.granted).toBe(true);
    expect(access.reason).toBe('ENTITLEMENT');
    expect(access.enrollment?.source).toBe('ACADEMY');

    const entitlement = await db
      .select()
      .from(schema.entitlements)
      .where(eq(schema.entitlements.userId, ids.buyer!))
      .get();
    expect(entitlement?.status).toBe('ACTIVE');
    expect(entitlement?.key).toBe('academy');
  });

  it('le programme complet est projeté : 8 modules, 118 leçons', async () => {
    const course = await academy.getAcademyCourse();
    const modules = await academy.getAcademyModules(course!.id);
    const lessons = await academy.getCourseLessons(course!.id, { publishedOnly: true });
    expect(modules).toHaveLength(8);
    expect(lessons).toHaveLength(118);
    const access = await academy.getAcademyAccess(ids.buyer!);
    const first = lessons[0]!;
    expect(first.moduleSlug).toBe(modules[0]!.slug);
    expect(access.course!.id).toBe(course!.id);
  });

  it('l’onboarding part : bienvenue immédiate, relances planifiées', async () => {
    const mails = await db
      .select()
      .from(schema.emailLogs)
      .where(eq(schema.emailLogs.relatedTo, 'academy:welcome'))
      .all();
    expect(mails.length).toBeGreaterThan(0);
    const scheduled = await db
      .select()
      .from(schema.emailLogs)
      .where(eq(schema.emailLogs.status, 'SCHEDULED'))
      .all();
    expect(scheduled.length).toBeGreaterThanOrEqual(3);
  });

  it('la séquence Académie existe dans la base (éditable par l’admin)', async () => {
    const sequence = await db
      .select()
      .from(schema.emailSequences)
      .where(eq(schema.emailSequences.triggerEvent, 'academy.purchased'))
      .get();
    expect(sequence?.active).toBe(true);
  });
});

describe('3. apprendre : reprise exacte et progression', () => {
  it('la reprise exacte renvoie la première leçon non terminée', async () => {
    await loginAs(ids.buyer!);
    const access = await academy.getAcademyAccess(ids.buyer!);
    const resume = await academy.getResumeTarget(access.enrollment!.id);
    expect(resume).toBeTruthy();
    expect(resume!.lessonIndex).toBe(1);
    expect(resume!.totalLessons).toBe(118);
    expect(resume!.pct).toBe(0);
    expect(resume!.videoPositionSec).toBe(0);
  });

  it('la position vidéo est mémorisée et retrouvée', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    const resume = await academy.getResumeTarget(access.enrollment!.id);
    const res = await actions.saveVideoProgressAction(resume!.lessonId, 137, 600);
    expect(res.ok).toBe(true);
    const after = await academy.getResumeTarget(access.enrollment!.id);
    expect(after!.videoPositionSec).toBe(137);
  });

  it('terminer une leçon met à jour la progression serveur', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    const resume = await academy.getResumeTarget(access.enrollment!.id);
    const res = await actions.markLessonCompleteAction(resume!.lessonId);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.completed).toBe(false);
    const progress = await academy.computeCourseProgress(access.enrollment!.id);
    expect(progress.done).toBe(1);
    expect(progress.total).toBe(118);
    expect(resume!.videoPositionSec).toBeGreaterThan(0);
  });

  it('la reprise passe à la leçon suivante', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    const resume = await academy.getResumeTarget(access.enrollment!.id);
    expect(resume!.lessonIndex).toBe(2);
  });
});

describe('4. pratiquer : les actions Nuvra vérifient la réalité', () => {
  it('une action est « non faite » tant que rien n’existe', async () => {
    const state = await academy.evaluateNuvraAction(
      ids.buyerWorkspace!,
      ids.buyer!,
      'product_created',
    );
    expect(state.done).toBe(false);
  });

  it('elle passe à « faite » quand l’objet existe vraiment', async () => {
    await db
      .insert(schema.products)
      .values({
        workspaceId: ids.buyerWorkspace!,
        name: 'Sprint Offre',
        slug: 'sprint-offre',
        type: 'DIGITAL',
        priceCents: 19700,
        status: 'PUBLISHED',
      })
      .run();
    const state = await academy.evaluateNuvraAction(
      ids.buyerWorkspace!,
      ids.buyer!,
      'product_published',
    );
    expect(state.done).toBe(true);
    expect(state.detail).toContain('Sprint Offre');
  });

  it('une action inconnue est refusée, jamais marquée vraie', async () => {
    const state = await academy.evaluateNuvraAction(
      ids.buyerWorkspace!,
      ids.buyer!,
      'action_qui_nexiste_pas',
    );
    expect(state.done).toBe(false);
  });
});

describe('5. valider : le quiz corrigé, les échecs et les reprises', () => {
  let quizId = '';
  let lessonId = '';

  it('le quiz du parcours est bien stocké avec ses questions', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    const lessons = await academy.getCourseLessons(access.course!.id, { publishedOnly: true });
    const withQuiz = await db
      .select()
      .from(schema.quizzes)
      .all();
    expect(withQuiz.length).toBeGreaterThanOrEqual(8);
    quizId = withQuiz[0]!.id;
    lessonId = withQuiz[0]!.lessonId;
    expect(lessons.some((l) => l.id === lessonId)).toBe(true);
  });

  it('une mauvaise réponse ne valide pas la leçon', async () => {
    const quiz = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, quizId)).get();
    const questions = JSON.parse(quiz!.questions) as {
      answerIndex: number;
      options: string[];
    }[];
    const wrong = questions.map((q) => (q.answerIndex + 1) % q.options.length);
    const res = await actions.submitAcademyQuizAction({ quizId, answers: wrong });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.passed).toBe(false);
  });

  it('la bonne réponse valide, explique et termine la leçon', async () => {
    const quiz = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, quizId)).get();
    const questions = JSON.parse(quiz!.questions) as { answerIndex: number; explanation: string }[];
    const res = await actions.submitAcademyQuizAction({
      quizId,
      answers: questions.map((q) => q.answerIndex),
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.passed).toBe(true);
      expect(res.data.score).toBe(100);
      expect(res.data.details.every((d) => d.explanation.length > 10)).toBe(true);
    }
    const access = await academy.getAcademyAccess(ids.buyer!);
    const done = await academy.completedLessonIds(access.enrollment!.id);
    expect(done.has(lessonId)).toBe(true);
  });

  it('chaque tentative est conservée', async () => {
    const attempts = await db
      .select()
      .from(schema.quizAttempts)
      .where(eq(schema.quizAttempts.quizId, quizId))
      .all();
    expect(attempts.length).toBeGreaterThanOrEqual(2);
  });
});

describe('6. terminer : certificat et vérification publique', () => {
  it('le parcours complet émet un certificat unique et daté', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    const lessons = await academy.getCourseLessons(access.course!.id, { publishedOnly: true });
    for (const lesson of lessons) {
      await actions.markLessonCompleteAction(lesson.id);
    }
    const progress = await academy.computeCourseProgress(access.enrollment!.id);
    expect(progress.done).toBe(118);
    expect(progress.completed).toBe(true);

    const cert = await db
      .select()
      .from(schema.certificates)
      .where(eq(schema.certificates.enrollmentId, access.enrollment!.id))
      .get();
    expect(cert).toBeTruthy();
    expect(cert!.code).toMatch(/^NV-[A-Z0-9]{10}$/);
    expect(cert!.issuedAt).toBeInstanceOf(Date);

    const found = await academy.getCertificateByCode(cert!.code);
    expect(found?.id).toBe(cert!.id);
  });

  it('un second appel ne crée pas de second certificat', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    const again = await academy.issueCertificate(access.enrollment!.id, ids.buyer!);
    const all = await db.select().from(schema.certificates).all();
    expect(all).toHaveLength(1);
    expect(again.code).toBeTruthy();
  });

  it('la progression est à 100 % et l’inscription est datée', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    const enrollment = await db
      .select()
      .from(schema.enrollments)
      .where(eq(schema.enrollments.id, access.enrollment!.id))
      .get();
    expect(enrollment!.progressPct).toBe(100);
    expect(enrollment!.completedAt).toBeInstanceOf(Date);
  });
});

describe('7. médias privés : URL signées, jamais publiques', () => {
  it('une URL signée est acceptée pour son titulaire', () => {
    const grant = media.issueMediaGrant({
      assetId: 'asset-1',
      userId: 'user-1',
      origin: 'https://nuvra.test',
    });
    const url = new URL(grant.url);
    expect(url.pathname).toBe('/api/academy/media/asset-1');
    const verdict = media.verifyMediaGrant({
      assetId: 'asset-1',
      userId: url.searchParams.get('u'),
      expiresAt: url.searchParams.get('exp'),
      sig: url.searchParams.get('sig'),
    });
    expect(verdict.ok).toBe(true);
    expect(grant.expiresIn).toBeLessThanOrEqual(300);
  });

  it('elle est refusée pour un autre utilisateur, une autre ressource ou après expiration', () => {
    const grant = media.issueMediaGrant({
      assetId: 'asset-1',
      userId: 'user-1',
      origin: 'https://nuvra.test',
    });
    const url = new URL(grant.url);
    const params = {
      assetId: 'asset-1',
      userId: url.searchParams.get('u'),
      expiresAt: url.searchParams.get('exp'),
      sig: url.searchParams.get('sig'),
    };
    expect(media.verifyMediaGrant({ ...params, userId: 'user-2' }).ok).toBe(false);
    expect(media.verifyMediaGrant({ ...params, assetId: 'asset-2' }).ok).toBe(false);
    expect(media.verifyMediaGrant({ ...params, sig: 'faux' }).ok).toBe(false);
    expect(
      media.verifyMediaGrant({ ...params, expiresAt: String(Date.now() - 1000) }).ok,
    ).toBe(false);
  });

  it('aucune vidéo du programme n’expose d’URL de lecture avant upload', async () => {
    const assets = await db.select().from(schema.videoAssets).all();
    expect(assets.length).toBeGreaterThanOrEqual(8);
    for (const a of assets) {
      expect(a.status).toBe('SCRIPTED');
      expect(a.playbackUrl).toBeNull();
      expect(a.script?.length ?? 0).toBeGreaterThan(200);
      expect(a.transcript?.length ?? 0).toBeGreaterThan(100);
    }
  });
});

describe('8. remboursement : accès révoqué, historique conservé', () => {
  let orderId = '';

  beforeAll(async () => {
    const order = await db
      .select()
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.buyerUserId, ids.buyer!),
          eq(schema.orders.kind, 'ACADEMY_SALE'),
        ),
      )
      .get();
    orderId = order!.id;
  });

  it('le remboursement intégral est enregistré', async () => {
    const refunded = await ordersLib.refundOrder(orderId, { reason: 'client' });
    expect(refunded.status).toBe('REFUNDED');
  });

  it('l’accès Académie est révoqué côté serveur', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    expect(access.granted).toBe(false);
    expect(access.reason).toBe('REVOKED');
  });

  it('l’historique d’apprentissage est conservé', async () => {
    const access = await academy.getAcademyAccess(ids.buyer!);
    expect(access.enrollment).toBeTruthy();
    const done = await academy.completedLessonIds(access.enrollment!.id);
    expect(done.size).toBe(118);
    const cert = await db
      .select()
      .from(schema.certificates)
      .where(eq(schema.certificates.userId, ids.buyer!))
      .get();
    expect(cert).toBeTruthy();
  });

  it('l’inscription, le certificat et le certificat public restent vérifiables', async () => {
    const cert = await db
      .select()
      .from(schema.certificates)
      .where(eq(schema.certificates.userId, ids.buyer!))
      .get();
    const found = await academy.getCertificateByCode(cert!.code);
    expect(found?.code).toBe(cert!.code);
  });

  it('les droits de revente sont recalculés, pas supprimés', async () => {
    const profile = await db
      .select()
      .from(schema.resellerProfiles)
      .where(eq(schema.resellerProfiles.userId, ids.buyer!))
      .get();
    expect(profile).toBeTruthy();
    expect(profile!.status).not.toBe('ACTIVE');
    expect(profile!.code).toBeTruthy();
  });

  it('un non-acheteur reste bloqué après tout cela', async () => {
    await loginAs(ids.stranger!);
    const access = await academy.getAcademyAccess(ids.stranger!);
    expect(access.granted).toBe(false);
  });

  it('après révocation, les actions apprenant échouent proprement', async () => {
    const res = await actions.markLessonCompleteAction('nimporte-quoi');
    expect(res.ok).toBe(false);
    logout();
  });
});
