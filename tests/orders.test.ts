/**
 * Integration tests: real order pipeline against a TEMP database with the
 * actual migrations applied. Covers every business-model split, the ledger
 * (reconstructable, append-only) and refunds.
 *
 * DATABASE_URL is pointed at a temp file BEFORE @/lib/db is imported, so the
 * development database is never touched.
 */
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';

let db: import('@/lib/db').DB;
let schema: typeof import('@/db/schema');
let ordersLib: typeof import('@/lib/orders');
let ledger: typeof import('@/lib/ledger');
let config: typeof import('@/lib/config');

const state: {
  userIds: Record<string, string>;
  wsIds: Record<string, string>;
} = { userIds: {}, wsIds: {} };

beforeAll(async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nuvra-test-'));
  process.env.DATABASE_URL = path.join(dir, 'test.db');

  const dbMod = await import('@/lib/db');
  db = dbMod.db;
  const { migrate } = await import('drizzle-orm/libsql/migrator');
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });

  schema = await import('@/db/schema');
  ordersLib = await import('@/lib/orders');
  ledger = await import('@/lib/ledger');
  config = await import('@/lib/config');

  // Fixtures: one owner + workspace per plan, plus a platform workspace
  const mk = async (email: string, plan: string, slug: string) => {
    const u = await db
      .insert(schema.users)
      .values({ email, name: email.split('@')[0], passwordHash: 'x', status: 'ACTIVE', emailVerifiedAt: new Date() })
      .returning()
      .get();
    const ws = await db
      .insert(schema.workspaces)
      .values({ name: slug, slug, ownerId: u.id, plan })
      .returning()
      .get();
    state.userIds[slug] = u.id;
    state.wsIds[slug] = ws.id;
  };
  await mk('free@example.com', 'FREE', 'ws-free');
  await mk('pro@example.com', 'PRO', 'ws-pro');
  await mk('buyer@example.com', 'FREE', 'ws-buyer');
  await mk('reseller@example.com', 'FREE', 'ws-reseller');
  await mk('platform@example.com', 'PRO', 'ws-platform');
  await db.update(schema.workspaces)
    .set({ isPlatform: true })
    .where(eq(schema.workspaces.id, state.wsIds['ws-platform']!))
    .run();
});

async function mkCourse(wsId: string, priceCents: number, slug: string) {
  return await db
    .insert(schema.courses)
    .values({ workspaceId: wsId, title: slug, slug, priceCents, status: 'PUBLISHED', publishedAt: new Date() })
    .returning()
    .get();
}

describe('creator sales — platform fee by plan', () => {
  it('FREE creator: platform takes the configured 10 %, creator keeps 90 %', async () => {
    const c = await mkCourse(state.wsIds['ws-free']!, 4900, 'free-course');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-free']!,
      items: [{ kind: 'COURSE', courseId: c.id, title: c.title, priceCents: 4900 }],
      buyerEmail: 'b1@example.com',
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });

    expect(paid.status).toBe('PAID');
    expect(paid.platformFeeCents).toBe(490); // 10 %

    const entries = await ledger.ledgerForOrder(paid.id);
    const sale = entries.find((e) => e.type === 'SALE');
    const fee = entries.find((e) => e.type === 'PLATFORM_FEE');
    expect(sale?.amountCents).toBe(4410);
    expect(sale?.account).toBe('CREATOR_PAYABLE');
    expect(fee?.amountCents).toBe(490);
    expect(fee?.account).toBe('PLATFORM_REVENUE');
    // money conservation: every cent is accounted for
    expect(sale!.amountCents! + fee!.amountCents!).toBe(4900);
  });

  it('PRO creator: platform takes 0 % (0 % commission subscription)', async () => {
    const c = await mkCourse(state.wsIds['ws-pro']!, 4900, 'pro-course');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-pro']!,
      items: [{ kind: 'COURSE', courseId: c.id, title: c.title, priceCents: 4900 }],
      buyerEmail: 'b2@example.com',
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });
    expect(paid.platformFeeCents).toBe(0);

    const entries = await ledger.ledgerForOrder(paid.id);
    const sale = entries.find((e) => e.type === 'SALE');
    const fee = entries.find((e) => e.type === 'PLATFORM_FEE');
    expect(sale?.amountCents).toBe(4900);
    expect(fee).toBeUndefined(); // zero-cent entries are never written
  });

  it('admin-configurable free commission is honoured', async () => {
    await config.setConfig('commission.freeBps', 2000); // 20 %
    const c = await mkCourse(state.wsIds['ws-free']!, 10000, 'cfg-course');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-free']!,
      items: [{ kind: 'COURSE', courseId: c.id, title: c.title, priceCents: 10000 }],
      buyerEmail: 'b3@example.com',
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });
    expect(paid.platformFeeCents).toBe(2000);
    await config.setConfig('commission.freeBps', 1000); // restore default
  });
});

describe('Academy + reseller 90/10', () => {
  it('direct Academy sale: Nuvra keeps 100 %', async () => {
    const c = await mkCourse(state.wsIds['ws-platform']!, 19700, 'academy-direct');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-platform']!,
      kind: 'ACADEMY_SALE',
      items: [{ kind: 'ACADEMY', courseId: c.id, title: 'Academy', priceCents: 19700 }],
      buyerEmail: 'buyer1@example.com',
      buyerUserId: state.userIds['ws-buyer'],
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });
    expect(paid.platformFeeCents).toBe(19700);

    const entries = await ledger.ledgerForOrder(paid.id);
    const sale = entries.find((e) => e.type === 'SALE');
    const fee = entries.find((e) => e.type === 'PLATFORM_FEE');
    expect(sale).toBeUndefined();
    expect(fee?.amountCents).toBe(19700);

    // Buying the Academy activates the reseller status automatically
    const rp = await db
      .select()
      .from(schema.resellerProfiles)
      .where(eq(schema.resellerProfiles.userId, state.userIds['ws-buyer']!))
      .get();
    expect(rp?.status).toBe('ACTIVE');
    expect(rp?.code).toBeTruthy();
  });

  it('reseller-attributed Academy sale: reseller 90 % / Nuvra 10 %', async () => {
    const rp = await db
      .select()
      .from(schema.resellerProfiles)
      .where(eq(schema.resellerProfiles.userId, state.userIds['ws-buyer']!))
      .get();
    expect(rp?.status).toBe('ACTIVE');

    const c = await mkCourse(state.wsIds['ws-platform']!, 19700, 'academy-resold');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-platform']!,
      kind: 'ACADEMY_SALE',
      items: [{ kind: 'ACADEMY', courseId: c.id, title: 'Academy', priceCents: 19700 }],
      buyerEmail: 'buyer2@example.com',
      buyerUserId: state.userIds['ws-reseller'],
      resellerId: rp!.id,
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });
    expect(paid.platformFeeCents).toBe(1970); // 10 %
    expect(paid.resellerId).toBe(rp!.id);

    const entries = await ledger.ledgerForOrder(paid.id);
    expect(entries.find((e) => e.type === 'SALE')?.amountCents).toBe(17730); // 90 %
    expect(entries.find((e) => e.type === 'PLATFORM_FEE')?.amountCents).toBe(1970);
  });

  it('admin-configurable reseller bps is honoured', async () => {
    await config.setConfig('commission.resellerBps', 8000); // 80/20
    const rp = await db
      .select()
      .from(schema.resellerProfiles)
      .where(eq(schema.resellerProfiles.userId, state.userIds['ws-buyer']!))
      .get();
    const c = await mkCourse(state.wsIds['ws-platform']!, 10000, 'academy-bps');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-platform']!,
      kind: 'ACADEMY_SALE',
      items: [{ kind: 'ACADEMY', courseId: c.id, title: 'Academy', priceCents: 10000 }],
      buyerEmail: 'buyer3@example.com',
      resellerId: rp!.id,
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });
    expect(paid.platformFeeCents).toBe(2000);
    await config.setConfig('commission.resellerBps', 9000); // restore default
  });
});

describe('refunds reverse the split captured at sale time', () => {
  it('full refund returns the exact sale proportions', async () => {
    const c = await mkCourse(state.wsIds['ws-free']!, 4900, 'refund-course');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-free']!,
      items: [{ kind: 'COURSE', courseId: c.id, title: c.title, priceCents: 4900 }],
      buyerEmail: 'b4@example.com',
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });

    const refunded = await ordersLib.refundOrder(paid.id, { reason: 'customer request' });
    expect(refunded.status).toBe('REFUNDED');

    const entries = await ledger.ledgerForOrder(paid.id);
    const refSale = entries.find((e) => e.type === 'REVERSAL' && e.account === 'CREATOR_PAYABLE');
    const refPlatform = entries.find((e) => e.type === 'REVERSAL' && e.account === 'PLATFORM_REVENUE');
    expect(refSale?.direction).toBe('DEBIT');
    expect(refSale?.amountCents).toBe(4410);
    expect(refPlatform?.amountCents).toBe(490);
  });

  it('a plan upgrade between sale and refund does not shift the burden', async () => {
    const c = await mkCourse(state.wsIds['ws-free']!, 4900, 'upgrade-course');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-free']!,
      items: [{ kind: 'COURSE', courseId: c.id, title: c.title, priceCents: 4900 }],
      buyerEmail: 'b5@example.com',
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });

    // Creator upgrades to Pro AFTER the sale
    await db.update(schema.workspaces).set({ plan: 'PRO' }).where(eq(schema.workspaces.id, state.wsIds['ws-free']!)).run();

    await ordersLib.refundOrder(paid.id, {});
    const entries = await ledger.ledgerForOrder(paid.id);
    const refSale = entries.find((e) => e.type === 'REVERSAL' && e.account === 'CREATOR_PAYABLE');
    const refPlatform = entries.find((e) => e.type === 'REVERSAL' && e.account === 'PLATFORM_REVENUE');
    // Refund proportions = sale proportions (90/10), NOT the new plan (0 %)
    expect(refSale?.amountCents).toBe(4410);
    expect(refPlatform?.amountCents).toBe(490);

    // restore plan for any later tests
    await db.update(schema.workspaces).set({ plan: 'FREE' }).where(eq(schema.workspaces.id, state.wsIds['ws-free']!)).run();
  });

  it('cannot refund more than captured', async () => {
    const c = await mkCourse(state.wsIds['ws-pro']!, 1000, 'over-refund');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-pro']!,
      items: [{ kind: 'COURSE', courseId: c.id, title: c.title, priceCents: 1000 }],
      buyerEmail: 'b6@example.com',
      mode: 'TEST',
    });
    const paid = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });
    await expect(ordersLib.refundOrder(paid.id, { amountCents: 5000 })).rejects.toThrow();
  });
});

describe('ledger integrity', () => {
  it('is append-only and reconstructable: summary equals summed entries', async () => {
    const summary = await ledger.ledgerSummary('TEST');
    // Recompute directly from raw rows
    const rows = await db.select().from(schema.ledgerEntries).all();
    const platformFromRows = rows
      .filter((r) => r.account === 'PLATFORM_REVENUE' && r.mode === 'TEST')
      .reduce((s, r) => s + (r.direction === 'CREDIT' ? r.amountCents : -r.amountCents), 0);
    expect(summary.PLATFORM_REVENUE).toBe(platformFromRows);
    expect(await ledger.getPlatformRevenue('TEST')).toBe(platformFromRows);
    // Every entry has a group (atomic operation id)
    expect(rows.every((r) => !!r.group)).toBe(true);
  });

  it('orders never mutate: PAID finalize is idempotent', async () => {
    const c = await mkCourse(state.wsIds['ws-pro']!, 500, 'idem-course');
    const order = await ordersLib.createOrder({
      workspaceId: state.wsIds['ws-pro']!,
      items: [{ kind: 'COURSE', courseId: c.id, title: c.title, priceCents: 500 }],
      buyerEmail: 'b7@example.com',
      mode: 'TEST',
    });
    const first = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });
    const countBefore = (await ledger.ledgerForOrder(order.id)).length;
    const second = await ordersLib.finalizeOrderPaid(order.id, { provider: 'test' });
    expect(second.status).toBe('PAID');
    expect((await ledger.ledgerForOrder(order.id)).length).toBe(countBefore);
    expect(first.id).toBe(second.id);
  });
});
