# Nuvra — Architecture

## Stack

- **Next.js 15 (App Router)** — React 19, server components by default, server actions for mutations.
- **TypeScript 5.9 strict** — no `any` in application code without a documented exception.
- **Drizzle ORM + SQLite** (better-sqlite3) — synchronous, transactional, zero external service.
  Migrations live in `drizzle/` and are applied with `drizzle-kit migrate`.
- **Zod** — validation at every trust boundary (server actions, API routes).
- **Stripe** — Checkout + webhooks for payments and subscriptions.
- **Tailwind CSS** — design tokens in `tailwind.config.ts` (`ink` blacks, `nuvra` blue accent).

## Directory layout

```
src/
  app/                 Routes (public, auth, dashboard, admin, api, u|p|c|s public sites)
  components/          Shared UI (ui.tsx, auth.tsx, DashboardChrome, PageRenderer, RefAttribution)
  server/actions/      All mutations — server-only, RBAC + ownership checked, Zod-validated
  lib/                 Domain services (money, orders, ledger, payouts, billing, email, events…)
  db/schema.ts         50-table Drizzle schema (UUID pk, timestamp_ms, JSON-as-text)
scripts/seed.ts        Idempotent demo-data seed
tests/                 Vitest suites
docs/                  This documentation
```

## Request model

1. **Reads** — server components query `src/lib/db` directly. Pages call `requireUser()` /
   `requireAdmin()` which throw `notFound()`/`redirect()` on failure.
2. **Writes** — only through `src/server/actions/*`:
   `requireUser() → Zod parse → ownership/tenant check → domain service → revalidatePath`.
   Every action returns `{ ok: true, … } | { ok: false, error }`.
3. **External events** — `/api/stripe/webhook` (raw body + signature), `/api/cron/process`
   (CRON_SECRET; prod refuses without it), `/api/leads` (public lead capture, rate-limited).

## Money flow (server-side only)

```
checkout action ─► createOrder (PENDING)
                     │
Stripe webhook ───────┼─► finalizeOrderPaid (idempotent)
test-mode confirm ────┘        │
                               ├─ computeOrderSplit (plan/config driven — never frontend)
                               ├─ payments row (SUCCEEDED)
                               ├─ ledger entries: SALE (seller CREDIT) + PLATFORM_FEE (CREDIT)
                               ├─ enrollments (courses/academy), CRM upsert
                               ├─ reseller activation (Academy)
                               └─ emitEvent → automations + email sequences
```

- Ledger is **append-only**: balances are derived (`ledgerSummary`, `getBalance`, …), never stored as mutable integers.
- Refunds reverse the proportions **captured at sale time** (`order.platformFeeCents`), so plan changes
  between sale and refund cannot shift the burden.
- `stripe_events` table makes webhook handling idempotent (event id dedupe).

## Rendering of user content

- **Pages/funnels** — JSON `blocks` rendered by `PageRenderer` (defensive: unknown block types render nothing).
- **Public sites** — `/u/[username]` (link-in-bio), `/p/[ws]/[page]`, `/c/[slug]` (course), `/s/[slug]` (funnel), `/marketplace`.
- Rewrites: `/@username → /u/username` (see `next.config.mjs`).

## Attribution

`?ref=CODE` (aliases `?aff=`, `?reseller=`) sets 30-day first-party cookies via
`components/RefAttribution.tsx`; the checkout action reads URL params first, then cookies.
Reseller codes resolve against `reseller_profiles.code` (ACTIVE only, self-purchase excluded);
affiliate codes resolve against `affiliates.code`.

## Concurrency & integrity

- better-sqlite3 is synchronous — single-writer, WAL mode, `foreign_keys = ON`.
- `finalizeOrderPaid` is guarded (`PAID → no-op`), webhook events deduped, order numbers unique-checked.
- Money is integer cents everywhere; splits guarantee `seller + platform === gross`.
