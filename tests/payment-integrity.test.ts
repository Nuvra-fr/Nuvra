/**
 * Payment-integrity tests.
 *
 * Regression coverage for the checkout/payment trust boundary:
 *
 *  1. `verifyCheckoutSessionForOrder` — a Stripe session may only finalize the
 *     order it was created for, for the exact amount charged. Before this guard,
 *     a `cs_…` id paid for a $1 order could be replayed on
 *     `/checkout/success?order=<expensive pending order>&session_id=<that id>`
 *     and the expensive order was marked PAID without being paid.
 *  2. `finalizeOrderPaid` — defense in depth: Stripe never finalizes a TEST
 *     order, and one payment reference never finalizes two orders.
 *  3. `resolveCheckoutItem` — only PUBLISHED products/courses are sellable.
 *  4. `confirmTestPurchaseAction` — an order id is not a credential: an
 *     account-bound order can only be confirmed by its buyer.
 *
 * Runs against a TEMP database with the real migrations applied; DATABASE_URL is
 * set before `@/lib/db` is imported, so the development database is untouched.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

// ── In-memory stand-ins for next/headers + next/navigation ──────────────────
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name)! } : undefined,
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.9" }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

let db: import("@/lib/db").DB;
let schema: typeof import("@/db/schema");
let auth: typeof import("@/lib/auth");
let ordersLib: typeof import("@/lib/orders");
let checkoutActions: typeof import("@/server/actions/checkout");
let verify: typeof import("@/lib/checkout-verify");

const ids: { owner: string; other: string; workspace: string } = {
  owner: "",
  other: "",
  workspace: "",
};

async function makeUser(
  email: string,
  withWorkspace: boolean,
): Promise<{ userId: string; workspaceId: string }> {
  const user = await db
    .insert(schema.users)
    .values({
      email,
      name: email.split("@")[0],
      passwordHash: "x",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    })
    .returning()
    .get();
  const ws = await db
    .insert(schema.workspaces)
    .values({
      name: email.split("@")[0],
      slug: email.split("@")[0].replace(/[^a-z0-9]/g, ""),
      ownerId: user.id,
      plan: "FREE",
    })
    .returning()
    .get();
  if (withWorkspace) {
    await db
      .insert(schema.memberships)
      .values({ userId: user.id, workspaceId: ws.id, role: "OWNER" })
      .run();
  }
  return { userId: user.id, workspaceId: ws.id };
}

beforeAll(async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "nuvra-payments-test-"));
  process.env.DATABASE_URL = path.join(dir, "test.db");

  const dbMod = await import("@/lib/db");
  db = dbMod.db;
  const { migrate } = await import("drizzle-orm/libsql/migrator");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  schema = await import("@/db/schema");
  auth = await import("@/lib/auth");
  ordersLib = await import("@/lib/orders");
  verify = await import("@/lib/checkout-verify");
  checkoutActions = await import("@/server/actions/checkout");

  const owner = await makeUser("owner@payments.test", true);
  const other = await makeUser("other@payments.test", true);
  ids.owner = owner.userId;
  ids.other = other.userId;
  ids.workspace = owner.workspaceId;
});

describe("verifyCheckoutSessionForOrder", () => {
  const order = {
    id: "order-expensive",
    totalCents: 19700,
    currency: "usd",
    status: "PENDING",
    mode: "LIVE",
  };

  it("accepts the session created for this order, for this amount", () => {
    const verdict = verify.verifyCheckoutSessionForOrder(
      {
        id: "cs_ok",
        payment_status: "paid",
        amount_total: 19700,
        currency: "usd",
        metadata: { orderId: "order-expensive" },
      },
      order,
    );
    expect(verdict.ok).toBe(true);
  });

  it("rejects a paid session belonging to ANOTHER order (replay)", () => {
    const verdict = verify.verifyCheckoutSessionForOrder(
      {
        id: "cs_cheap",
        payment_status: "paid",
        amount_total: 100,
        currency: "usd",
        metadata: { orderId: "order-cheap" },
      },
      order,
    );
    expect(verdict.ok).toBe(false);
    expect(verdict.ok === false && verdict.reason).toBe("wrong_order");
  });

  it("rejects a session with no orderId metadata at all", () => {
    const verdict = verify.verifyCheckoutSessionForOrder(
      {
        id: "cs_anon",
        payment_status: "paid",
        amount_total: 19700,
        currency: "usd",
        metadata: {},
      },
      order,
    );
    expect(verdict.ok === false && verdict.reason).toBe("wrong_order");
  });

  it("rejects a session that was never paid", () => {
    const verdict = verify.verifyCheckoutSessionForOrder(
      {
        id: "cs_unpaid",
        payment_status: "unpaid",
        amount_total: 19700,
        currency: "usd",
        metadata: { orderId: "order-expensive" },
      },
      order,
    );
    expect(verdict.ok === false && verdict.reason).toBe("not_paid");
  });

  it("rejects an amount that is lower than the order asks for", () => {
    const verdict = verify.verifyCheckoutSessionForOrder(
      {
        id: "cs_low",
        payment_status: "paid",
        amount_total: 100,
        currency: "usd",
        metadata: { orderId: "order-expensive" },
      },
      order,
    );
    expect(verdict.ok === false && verdict.reason).toBe("amount_mismatch");
  });

  it("rejects a currency mismatch", () => {
    const verdict = verify.verifyCheckoutSessionForOrder(
      {
        id: "cs_eur",
        payment_status: "paid",
        amount_total: 19700,
        currency: "eur",
        metadata: { orderId: "order-expensive" },
      },
      order,
    );
    expect(verdict.ok === false && verdict.reason).toBe("currency_mismatch");
  });

  it("rejects an already-refunded order", () => {
    const verdict = verify.verifyCheckoutSessionForOrder(
      {
        id: "cs_ref",
        payment_status: "paid",
        amount_total: 19700,
        currency: "usd",
        metadata: { orderId: "order-expensive" },
      },
      { ...order, status: "REFUNDED" },
    );
    expect(verdict.ok === false && verdict.reason).toBe("order_not_pending");
  });

  it("rejects finalizing a TEST order with a real payment", () => {
    const verdict = verify.verifyCheckoutSessionForOrder(
      {
        id: "cs_test",
        payment_status: "paid",
        amount_total: 19700,
        currency: "usd",
        metadata: { orderId: "order-expensive" },
      },
      { ...order, mode: "TEST" },
    );
    expect(verdict.ok === false && verdict.reason).toBe("order_not_live");
  });
});

describe("finalizeOrderPaid — Stripe guards", () => {
  async function newOrder(mode: "LIVE" | "TEST") {
    return ordersLib.createOrder({
      workspaceId: ids.workspace,
      items: [{ kind: "PRODUCT", title: "Widget", priceCents: 4200 }],
      buyerEmail: "buyer@payments.test",
      mode,
    });
  }

  it("refuses to finalize a TEST order with a Stripe payment", async () => {
    const order = await newOrder("TEST");
    await expect(
      ordersLib.finalizeOrderPaid(order.id, {
        provider: "stripe",
        reference: "cs_should_not_apply",
      }),
    ).rejects.toThrow(ordersLib.OrderError);
    const after = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, order.id))
      .get();
    expect(after?.status).toBe("PENDING");
  });

  it("never lets one Stripe session finalize two orders", async () => {
    const first = await newOrder("LIVE");
    await ordersLib.finalizeOrderPaid(first.id, {
      provider: "stripe",
      reference: "cs_replayed",
    });

    const second = await newOrder("LIVE");
    await expect(
      ordersLib.finalizeOrderPaid(second.id, {
        provider: "stripe",
        reference: "cs_replayed",
      }),
    ).rejects.toThrow(/déjà finalisé une autre commande/);

    const after = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, second.id))
      .get();
    expect(after?.status).toBe("PENDING");
  });

  it("still finalizes normally with a fresh Stripe session", async () => {
    const order = await newOrder("LIVE");
    const paid = await ordersLib.finalizeOrderPaid(order.id, {
      provider: "stripe",
      reference: "cs_fresh",
    });
    expect(paid.status).toBe("PAID");
    expect(paid.platformFeeCents).toBe(420);
  });
});

describe("resolveCheckoutItem — only published items are sellable", () => {
  async function makeProduct(status: string) {
    return db
      .insert(schema.products)
      .values({
        workspaceId: ids.workspace,
        name: "Unfinished",
        slug: `p-${status}-${Date.now()}`,
        priceCents: 2500,
        status,
      })
      .returning()
      .get();
  }

  it("refuses a DRAFT product", async () => {
    const draft = await makeProduct("DRAFT");
    expect(
      await checkoutActions.resolveCheckoutItem(`product:${draft.id}`),
    ).toBeNull();
  });

  it("refuses an ARCHIVED product", async () => {
    const archived = await makeProduct("ARCHIVED");
    expect(
      await checkoutActions.resolveCheckoutItem(`product:${archived.id}`),
    ).toBeNull();
  });

  it("accepts a PUBLISHED product, with the server-side price", async () => {
    const published = await makeProduct("PUBLISHED");
    const item = await checkoutActions.resolveCheckoutItem(
      `product:${published.id}`,
    );
    expect(item?.priceCents).toBe(2500);
    expect(item?.workspaceId).toBe(ids.workspace);
  });
});

describe("confirmTestPurchaseAction — order id is not a credential", () => {
  async function courseOrder(buyerUserId: string): Promise<string> {
    const course = await db
      .insert(schema.courses)
      .values({
        workspaceId: ids.workspace,
        title: "Paid course",
        slug: `c-${Date.now()}`,
        priceCents: 9900,
        status: "PUBLISHED",
      })
      .returning()
      .get();
    const order = await db
      .insert(schema.orders)
      .values({
        workspaceId: ids.workspace,
        buyerUserId,
        number: `NV-TEST-${Math.floor(Math.random() * 1e9)}`,
        kind: "CREATOR_SALE",
        status: "PENDING",
        mode: "TEST",
        subtotalCents: 9900,
        totalCents: 9900,
        buyerEmail: "buyer@payments.test",
      })
      .returning()
      .get();
    await db
      .insert(schema.orderItems)
      .values({
        orderId: order.id,
        kind: "COURSE",
        courseId: course.id,
        title: "Paid course",
        priceCents: 9900,
      })
      .run();
    return order.id;
  }

  it("refuses to confirm an order that belongs to another account", async () => {
    const orderId = await courseOrder(ids.owner);
    await auth.createSession(ids.other); // signed in as somebody else
    await expect(
      checkoutActions.confirmTestPurchaseAction(orderId),
    ).rejects.toThrow(/appartient à un autre compte/);
    const after = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .get();
    expect(after?.status).toBe("PENDING");
  });

  it("refuses a guest trying to confirm an account-bound order", async () => {
    const orderId = await courseOrder(ids.owner);
    jar.clear(); // signed out
    await expect(
      checkoutActions.confirmTestPurchaseAction(orderId),
    ).rejects.toThrow(/autre compte|la confirmer/);
  });

  it("lets the buyer confirm their own order and sends them to the receipt", async () => {
    const orderId = await courseOrder(ids.owner);
    await auth.createSession(ids.owner);
    await expect(
      checkoutActions.confirmTestPurchaseAction(orderId),
    ).rejects.toThrow(`NEXT_REDIRECT:/checkout/success?order=${orderId}`);
    const after = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .get();
    expect(after?.status).toBe("PAID");
  });

  it("enrolls the buyer in the course after confirmation", async () => {
    const orderId = await courseOrder(ids.owner);
    await auth.createSession(ids.owner);
    await checkoutActions
      .confirmTestPurchaseAction(orderId)
      .catch(() => undefined);
    const enrolled = await db
      .select()
      .from(schema.enrollments)
      .where(eq(schema.enrollments.userId, ids.owner))
      .all();
    expect(enrolled.length).toBeGreaterThan(0);
  });
});
