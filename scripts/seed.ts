/**
 * Nuvra seed — demo data, clearly separated from real user data.
 * Idempotent: re-running skips existing accounts (matched by email) and
 * only tops up what's missing. Run with: npm run db:seed
 */
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { affiliates, affiliatePrograms, automationActions, automations, contacts, courseModules, courses, emailSequenceSteps, emailSequences, funnels, funnelSteps, lessons, marketplaceListings, memberships, pages, products, profiles, orders, resellerProfiles, templates, users, workspaces } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { createOrder, finalizeOrderPaid } from '@/lib/orders';
import { ensurePlans } from '@/lib/billing';
import { setConfig } from '@/lib/config';
import { bootstrapDatabase } from '@/lib/startup';
import { emitEvent } from '@/lib/events';
import { randomCode } from '@/lib/utils';
import { PAGE_BLOCK_TEMPLATES } from '@/lib/constants';

async function main() {
  console.log('🌱 Seeding Nuvra demo data…');

  // Safe on a brand-new file/database: applies pending migrations first.
  await bootstrapDatabase();

  // Config defaults (only if never set)
  await setConfig('academy.name', 'Nuvra Academy');

  await ensurePlans();

  // ── Users ──────────────────────────────────────────
  const adminHash = await hashPassword('admin2026!');
  const creatorHash = await hashPassword('creator2026!');
  const resellerHash = await hashPassword('reseller2026!');
  const studentHash = await hashPassword('student2026!');

  async function upsertUser(email: string, name: string, passwordHash: string, role: 'USER' | 'ADMIN') {
    const existing = await db.select().from(users).where(eq(users.email, email)).get();
    if (existing) return existing;
    const u = await db
      .insert(users)
      .values({ email, name, passwordHash, role, status: 'ACTIVE', emailVerifiedAt: new Date() })
      .returning()
      .get();
    await db.insert(profiles)
      .values({ userId: u.id, username: email.split('@')[0]!.replace(/[^a-z0-9]/g, ''), onboardingStep: 5 })
      .onConflictDoNothing()
      .run();
    return u;
  }

  const admin = await upsertUser('admin@nuvra.app', 'Nuvra Admin', adminHash, 'ADMIN');
  const creator = await upsertUser('creator@nuvra.app', 'Camille Creator', creatorHash, 'USER');
  const resellerUser = await upsertUser('reseller@nuvra.app', 'Rita Reseller', resellerHash, 'USER');
  const student = await upsertUser('student@nuvra.app', 'Sam Student', studentHash, 'USER');

  // ── Workspaces ─────────────────────────────────────
  async function upsertWorkspace(slug: string, name: string, ownerId: string, plan: string, isPlatform = false) {
    const existing = await db.select().from(workspaces).where(eq(workspaces.slug, slug)).get();
    const ws =
      existing ??
      (await db
        .insert(workspaces)
        .values({ slug, name, ownerId, plan, isPlatform })
        .returning()
        .get());
    // Always (re)assert the OWNER membership: the workspace may already exist
    // — e.g. the platform one, created by the admin bootstrap — while this
    // demo account is not a member yet.
    await db
      .insert(memberships)
      .values({ userId: ownerId, workspaceId: ws.id, role: 'OWNER' })
      .onConflictDoNothing()
      .run();
    return ws;
  }

  const platformWs = await upsertWorkspace('nuvra', 'Nuvra (Platform)', admin.id, 'PRO', true);
  const creatorWs = await upsertWorkspace('camille-studio', 'Camille Studio', creator.id, 'FREE');
  await upsertWorkspace('rita-resells', 'Rita Resells', resellerUser.id, 'FREE');
  await upsertWorkspace('sam-space', "Sam's space", student.id, 'FREE');

  // ── Nuvra Academy (platform course) ────────────────
  const ACADEMY_MODULES = [
    'Business digital', 'Offre', 'Positionnement', 'Funnel', 'Landing pages',
    'Copywriting', 'Acquisition', 'Email marketing', 'Automations', 'Création de formation',
    'Vente', 'Analytics', 'Scaling', 'Reseller system', 'Nuvra avancé',
  ];
  let academy = await db.select().from(courses).where(eq(courses.slug, 'nuvra-academy')).get();
  if (!academy) {
    academy = await db
      .insert(courses)
      .values({
        workspaceId: platformWs.id,
        title: 'Nuvra Academy',
        slug: 'nuvra-academy',
        description:
          'The complete 15-module program to design, launch and scale a digital business — plus the reseller system.',
        priceCents: 19700,
        status: 'PUBLISHED',
        isAcademy: true,
        level: 'intermediate',
        category: 'Business',
        publishedAt: new Date(),
        syllabus: JSON.stringify(ACADEMY_MODULES),
      })
      .returning()
      .get();
    for (const [i, title] of ACADEMY_MODULES.entries()) {
      const mod = await db
        .insert(courseModules)
        .values({ courseId: academy!.id, title, position: i })
        .returning()
        .get();
      await db.insert(lessons)
        .values({
          courseId: academy!.id,
          moduleId: mod.id,
          title: `Intro — ${title}`,
          type: 'text',
          content: `Welcome to the "${title}" module.\n\nIn this module you'll learn the principles, the frameworks and the exact steps to implement them inside Nuvra.\n\nObjectives:\n• Understand the strategy\n• Apply it to your own business\n• Measure the result`,
          position: i * 2,
          isPreview: i === 0,
          durationMin: 15,
        })
        .run();
      await db.insert(lessons)
        .values({
          courseId: academy!.id,
          moduleId: mod.id,
          title: `Workshop — ${title} in practice`,
          type: 'video',
          content: 'https://example.com/videos/academy-workshop',
          position: i * 2 + 1,
          durationMin: 25,
        })
        .run();
    };
  }

  // ── Creator products & courses ─────────────────────
  if ((await db.select({ id: products.id }).from(products).where(eq(products.workspaceId, creatorWs.id)).all()).length === 0) {
    await db.insert(products)
      .values({
        workspaceId: creatorWs.id,
        name: 'Content OS — Notion template',
        slug: 'content-os',
        description: 'Plan, draft and schedule 30 days of content in one workspace.',
        type: 'TEMPLATE',
        priceCents: 1900,
        status: 'PUBLISHED',
        downloadUrl: 'https://example.com/download/content-os',
      })
      .run();
    await db.insert(products)
      .values({
        workspaceId: creatorWs.id,
        name: 'Audit express (30 min)',
        slug: 'audit-express',
        description: 'A live 30-minute review of your funnel with actionable fixes.',
        type: 'SERVICE',
        priceCents: 14900,
        status: 'PUBLISHED',
      })
      .run();
  }

  let paidCourse = await db.select().from(courses).where(eq(courses.slug, 'email-marketing-that-converts')).get();
  if (!paidCourse) {
    paidCourse = await db
      .insert(courses)
      .values({
        workspaceId: creatorWs.id,
        title: 'Email marketing that converts',
        slug: 'email-marketing-that-converts',
        description: 'Build sequences that sell without being sleazy. 4 modules, templates included.',
        priceCents: 4900,
        status: 'PUBLISHED',
        level: 'intermediate',
        category: 'Marketing',
        publishedAt: new Date(),
      })
      .returning()
      .get();
    for (const [i, t] of ['Foundations', 'List building', 'Sequences', 'Broadcasts'].entries()) {
      const mod = await db
        .insert(courseModules)
        .values({ courseId: paidCourse!.id, title: t, position: i })
        .returning()
        .get();
      await db.insert(lessons)
        .values({
          courseId: paidCourse!.id,
          moduleId: mod.id,
          title: `${t} — lesson 1`,
          type: 'text',
          content: `Everything you need to know about ${t.toLowerCase()}.`,
          position: i,
          isPreview: i === 0,
        })
        .run();
    };
  }

  let freeCourse = await db.select().from(courses).where(eq(courses.slug, 'launch-in-a-weekend')).get();
  if (!freeCourse) {
    const insertedFree = await db
      .insert(courses)
      .values({
        workspaceId: creatorWs.id,
        title: 'Launch in a weekend',
        slug: 'launch-in-a-weekend',
        description: 'A free crash course: idea → offer → page → first sales.',
        priceCents: 0,
        status: 'PUBLISHED',
        level: 'beginner',
        category: 'Business',
        publishedAt: new Date(),
      })
      .returning()
      .get();
    if (!insertedFree) throw new Error('Failed to insert free demo course');
    freeCourse = insertedFree;
    const mod = await db
      .insert(courseModules)
      .values({ courseId: insertedFree.id, title: 'Weekend sprint', position: 0 })
      .returning()
      .get();
    for (const [i, t] of ['Pick the offer', 'Build the page', 'Open the cart'].entries()) {
      await db.insert(lessons)
        .values({ courseId: insertedFree.id, moduleId: mod.id, title: t, type: 'text', content: `${t}.`, position: i, isPreview: true })
        .run();
    };
  }

  // ── Page & funnel ──────────────────────────────────
  if ((await db.select({ id: pages.id }).from(pages).where(eq(pages.workspaceId, creatorWs.id)).all()).length === 0) {
    const landing = await db
      .insert(pages)
      .values({
        workspaceId: creatorWs.id,
        title: 'Email marketing course — Landing',
        slug: 'email-course',
        type: 'LANDING',
        status: 'PUBLISHED',
        content: JSON.stringify({
          blocks: [
            { id: randomCode(8), type: 'hero', data: { heading: 'Emails that actually sell', subheading: 'The 4-module system Camille uses with her clients.', ctaLabel: 'Enroll now', ctaHref: `/checkout?item=course:${paidCourse!.id}`, align: 'center' } },
            { id: randomCode(8), type: 'features', data: { title: 'What you get', items: [{ title: '4 modules', body: 'Zero fluff' }, { title: 'Templates', body: 'Copy-paste sequences' }, { title: 'Lifetime access', body: 'All future updates' }] } },
            { id: randomCode(8), type: 'checkout', data: { courseId: paidCourse!.id, productId: '', ctaLabel: 'Buy the course' } },
            { id: randomCode(8), type: 'faq', data: { items: [{ q: 'Is there a refund policy?', a: 'Yes — 14 days, no questions asked.' }] } },
          ],
        }),
        seoTitle: 'Email marketing that converts — Nuvra demo',
        seoDescription: 'A 4-module course on ethical email selling.',
      })
      .returning()
      .get();
    await db.update(pages).set({ views: 128 }).where(eq(pages.id, landing.id)).run();

    const funnel = await db
      .insert(funnels)
      .values({ workspaceId: creatorWs.id, name: 'Course launch funnel', status: 'PUBLISHED' })
      .returning()
      .get();
    await db.insert(funnelSteps)
      .values({ funnelId: funnel.id, pageId: landing.id, stepType: 'LANDING', position: 0 })
      .run();

    const thanks = await db
      .insert(pages)
      .values({
        workspaceId: creatorWs.id,
        funnelId: funnel.id,
        title: 'Thank you',
        slug: 'email-course-thanks',
        type: 'THANKYOU',
        status: 'PUBLISHED',
        position: 1,
        content: JSON.stringify({
          blocks: [
            { id: randomCode(8), type: 'hero', data: { heading: "You're in! 🎉", subheading: 'Check your inbox for access details.', ctaLabel: 'Go to dashboard', ctaHref: '/dashboard', align: 'center' } },
          ],
        }),
      })
      .returning()
      .get();
    await db.insert(funnelSteps)
      .values({ funnelId: funnel.id, pageId: thanks.id, stepType: 'THANKYOU', position: 1 })
      .run();
  }

  // ── Reseller activation (demo: Rita bought Academy) ─
  const academyOrder = (await db
    .select()
    .from(orders)
    .all())
    .find((o) => o.kind === 'ACADEMY_SALE' && o.buyerEmail === resellerUser.email);
  if (!academyOrder) {
    // Real pipeline: order → paid → finalize activates the reseller profile (90/10 onward)
    const order = await createOrder({
      workspaceId: platformWs.id,
      kind: 'ACADEMY_SALE',
      items: [{ kind: 'ACADEMY', courseId: academy.id, title: 'Nuvra Academy', priceCents: 19700 }],
      buyerEmail: resellerUser.email,
      buyerName: resellerUser.name,
      buyerUserId: resellerUser.id,
      mode: 'TEST',
    });
    await finalizeOrderPaid(order.id, { provider: 'test', reference: 'seed_academy' });
    console.log('  + Academy sale → reseller ACTIVE:', order.number);
  }

  // ── Academy sale attributed to the reseller (real 90/10 split) ──
  const resellerSale = (await db
    .select()
    .from(orders)
    .all())
    .find((o) => o.kind === 'ACADEMY_SALE' && !!o.resellerId);
  if (!resellerSale) {
    const rp = await db
      .select()
      .from(resellerProfiles)
      .where(eq(resellerProfiles.userId, resellerUser.id))
      .get();
    if (rp && rp.status === 'ACTIVE') {
      const o = await createOrder({
        workspaceId: platformWs.id,
        kind: 'ACADEMY_SALE',
        items: [{ kind: 'ACADEMY', courseId: academy.id, title: 'Nuvra Academy', priceCents: academy.priceCents }],
        buyerEmail: student.email,
        buyerName: student.name,
        buyerUserId: student.id,
        resellerId: rp.id,
        mode: 'TEST',
      });
      await finalizeOrderPaid(o.id, { provider: 'test', reference: 'seed_academy_reseller' });
      console.log('  + Academy sale via reseller (90/10):', o.number);
    }
  }

  // ── Creator sale (Free plan → 10 % commission) ─────
  const existingCreatorSale = (await db
    .select()
    .from(orders)
    .all())
    .find((o) => o.workspaceId === creatorWs.id && o.status === 'PAID');
  if (!existingCreatorSale) {
    const o1 = await createOrder({
      workspaceId: creatorWs.id,
      items: [{ kind: 'COURSE', courseId: paidCourse.id, title: paidCourse.title, priceCents: 4900 }],
      buyerEmail: student.email,
      buyerName: student.name,
      buyerUserId: student.id,
      mode: 'TEST',
    });
    await finalizeOrderPaid(o1.id, { provider: 'test', reference: 'seed_c1' });
    console.log('  + Creator sale 49.00 (Free: 10% fee):', o1.number);

    const product = await db.select().from(products).where(eq(products.slug, 'content-os')).get();
    if (product) {
      const o2 = await createOrder({
        workspaceId: creatorWs.id,
        items: [{ kind: 'PRODUCT', productId: product.id, title: product.name, priceCents: product.priceCents }],
        buyerEmail: 'buyer@example.com',
        buyerName: 'Demo Buyer',
        mode: 'TEST',
      });
      await finalizeOrderPaid(o2.id, { provider: 'test', reference: 'seed_c2' });
      console.log('  + Creator sale 19.00 (product):', o2.number);
    }
  }

  // ── CRM contacts ───────────────────────────────────
  const contactCount = (await db.select({ id: contacts.id }).from(contacts).where(eq(contacts.workspaceId, creatorWs.id)).all()).length;
  if (contactCount === 0) {
    const leads: [string, string, string[]][] = [
      ['lea@example.com', 'Lea', ['newsletter']],
      ['tom@example.com', 'Tom', []],
      ['nina@example.com', 'Nina', ['webinar']],
      ['oz@example.com', 'Oz', []],
      ['marie@example.com', 'Marie', ['newsletter', 'vip']],
    ];
    for (const [email, name, tags] of leads) {
      await db.insert(contacts)
        .values({ workspaceId: creatorWs.id, email, name, status: 'LEAD', source: 'funnel', tags: JSON.stringify(tags) })
        .onConflictDoNothing()
        .run();
    }
    await db.insert(contacts)
      .values({ workspaceId: creatorWs.id, email: student.email, name: student.name, status: 'CUSTOMER', source: 'purchase', userId: student.id })
      .onConflictDoNothing()
      .run();
    console.log('  + 5 leads / 1 customer');
  }

  // ── Active automation (welcome) ────────────────────
  const autoCount = (await db.select({ id: automations.id }).from(automations).where(eq(automations.workspaceId, creatorWs.id)).all()).length;
  if (autoCount === 0) {
    const auto = await db
      .insert(automations)
      .values({
        workspaceId: creatorWs.id,
        name: 'Welcome new leads',
        triggerEvent: 'lead.created',
        active: true,
        runCount: 0,
      })
      .returning({ id: automations.id })
      .get();
    await db.insert(automationActions)
      .values({
        automationId: auto.id,
        type: 'send_email',
        position: 0,
        config: JSON.stringify({
          subject: 'Welcome 👋',
          body: "Thanks for subscribing! Here's the free guide: /c/launch-in-a-weekend",
        }),
      })
      .run();
    console.log('  + Active automation: lead.created → welcome email');
  }

  // ── Active sequence (purchase follow-up) ───────────
  const seqCount = (await db.select({ id: emailSequences.id }).from(emailSequences).where(eq(emailSequences.workspaceId, creatorWs.id)).all()).length;
  if (seqCount === 0) {
    const seq = await db
      .insert(emailSequences)
      .values({ workspaceId: creatorWs.id, name: 'Post-purchase drip', triggerEvent: 'purchase.completed', active: true })
      .returning({ id: emailSequences.id })
      .get();
    await db.insert(emailSequenceSteps)
      .values({ sequenceId: seq.id, delayHours: 0, subject: 'Your purchase is confirmed 🎉', body: 'Thanks! Start with module 1.', position: 0 })
      .run();
    await db.insert(emailSequenceSteps)
      .values({ sequenceId: seq.id, delayHours: 24, subject: 'How is it going?', body: 'A quick check-in — reply to this email with questions.', position: 1 })
      .run();
    console.log('  + Active sequence: purchase.completed (0h + 24h)');
  }

  // ── Marketplace listing (approved + one pending) ───
  const listingCount = (await db.select({ id: marketplaceListings.id }).from(marketplaceListings).all()).length;
  if (listingCount === 0) {
    await db.insert(marketplaceListings)
      .values({
        courseId: paidCourse.id,
        workspaceId: creatorWs.id,
        targetType: 'COURSE',
        targetId: paidCourse.id,
        title: paidCourse.title,
        description: paidCourse.description,
        priceCents: paidCourse.priceCents,
        category: 'Marketing',
        level: 'intermediate',
        creatorName: 'Camille Studio',
        status: 'APPROVED',
        views: 64,
      })
      .onConflictDoNothing()
      .run();
    await db.insert(marketplaceListings)
      .values({
        courseId: academy.id,
        workspaceId: platformWs.id,
        targetType: 'COURSE',
        targetId: academy.id,
        title: 'Nuvra Academy',
        description: 'The flagship Nuvra program.',
        priceCents: 19700,
        category: 'Business',
        level: 'intermediate',
        creatorName: 'Nuvra',
        status: 'APPROVED',
        featured: true,
        views: 210,
      })
      .onConflictDoNothing()
      .run();
    console.log('  + Marketplace listings');
  }

  // ── Affiliate program (demo) ───────────────────────
  const progCount = (await db.select({ id: affiliatePrograms.id }).from(affiliatePrograms).where(eq(affiliatePrograms.workspaceId, creatorWs.id)).all()).length;
  if (progCount === 0) {
    const prog = await db
      .insert(affiliatePrograms)
      .values({ workspaceId: creatorWs.id, name: 'Course partners', commissionBps: 3000, active: true })
      .returning({ id: affiliatePrograms.id })
      .get();
    await db.insert(affiliates)
      .values({ programId: prog.id, code: 'demo-aff', name: 'Demo affiliate', userId: student.id })
      .run();
    console.log('  + Affiliate program with link /?aff=demo-aff');
  }

  // ── Templates ──────────────────────────────────────
  const tplCount = (await db.select({ id: templates.id }).from(templates).all()).length;
  if (tplCount === 0) {
    await db.insert(templates)
      .values([
        { kind: 'PAGE', name: 'Classic landing', category: 'SaaS', description: 'Hero + features + CTA + FAQ', content: JSON.stringify({ blocks: [PAGE_BLOCK_TEMPLATES.hero, PAGE_BLOCK_TEMPLATES.features, PAGE_BLOCK_TEMPLATES.cta, PAGE_BLOCK_TEMPLATES.faq] }), premium: false },
        { kind: 'PAGE', name: 'Lead magnet', category: 'Growth', description: 'Form-first page', content: JSON.stringify({ blocks: [PAGE_BLOCK_TEMPLATES.hero, PAGE_BLOCK_TEMPLATES.form, PAGE_BLOCK_TEMPLATES.social_proof] }), premium: false },
        { kind: 'EMAIL', name: 'Welcome email', category: 'Lifecycle', description: 'First touch after signup', content: JSON.stringify({ subject: 'Welcome!', body: 'Thanks for joining. Here is what to do next.' }), premium: false },
        { kind: 'COURSE', name: '4-week cohort', category: 'Education', description: '4 modules × weekly lessons', content: JSON.stringify({ modules: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] }), premium: true },
      ])
      .run();
    console.log('  + Templates library');
  }

  // ── First lead event to show automation runs ───────
  await emitEvent({
    name: 'lead.created',
    workspaceId: creatorWs.id,
    payload: { email: 'lea@example.com', name: 'Lea' },
  });

  console.log('');
  console.log('✅ Seed complete. Demo accounts (all demo data, clearly identifiable):');
  console.log('   admin@nuvra.app    / admin2026!    (ADMIN)');
  console.log('   creator@nuvra.app  / creator2026!  (FREE creator)');
  console.log('   reseller@nuvra.app / reseller2026! (ACTIVE reseller)');
  console.log('   student@nuvra.app  / student2026!  (student/customer)');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
