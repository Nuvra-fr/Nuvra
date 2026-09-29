# Nuvra — Security

## Authentication

- Email + password, **bcrypt** (salted, cost 10+). Passwords never logged, never returned by APIs.
- Opaque session tokens: **hashed (sha256) in the DB** (`sessions`), httpOnly + SameSite=Lax cookie.
- Sliding expiry (30 days) with server-side invalidation — suspending or banning a user **deletes
  their sessions immediately**; changing password invalidates all sessions.
- Email verification with hashed, single-use, 24 h tokens.
- `tokensMatch()` compares in a **timing-safe** manner.

## Authorization (RBAC)

- `requireUser()` / `requireAdmin()` guards on every server action and protected page.
- Admin-only console at `/admin/*` (layout re-checks role) + `requireAdmin()` in each action.
- Workspace membership roles: `OWNER | ADMIN | MEMBER`.

## Multi-tenancy (IDOR defense)

- Every tenant row carries `workspaceId`; all queries filter by the caller's workspace.
- `ownedQuery(table, id, workspaceId)` is the standard guard: loads by **id AND workspace** in a
  single query, returns `null` if the row belongs to another tenant.
- Public identifiers use UUIDs; slugs are uniqueness-checked server-side.

## Input validation

- **Zod** schemas at every trust boundary (server actions, API routes).
- URL/path params re-validated; unknown query params ignored.
- File-free product model (no uploads) — no upload attack surface today.

## Rate limiting

- In-memory fixed-window limiter (`src/lib/rate-limit.ts`) on:
  public lead capture (20/min/IP), auth-sensitive endpoints, checkout.
- Single-instance by design; for multi-instance production use a shared store (Redis/Upstash) —
  the interface is one function swap.

## Payments

- Stripe **webhook signature verified** on the raw body (`constructEvent`); bad signature → 400.
- Webhook processing is **idempotent** via the `stripe_events` table (event id dedupe).
- **A payment claim is never trusted on its own.** Both the Stripe webhook and
  `/checkout/success` pass the session through `verifyCheckoutSessionForOrder`
  (`src/lib/checkout-verify.ts`) before anything is marked paid: the session must carry the
  `metadata.orderId` of *that* order, must be `paid`, and its `amount_total`/`currency` must
  match the order. Rejected claims are never finalized — they are recorded as
  `payment.claim_rejected` in the audit log for review.
- `finalizeOrderPaid` (defense in depth) refuses a Stripe payment on a `TEST` order and refuses
  a payment reference that already finalized a different order.
- An order id is **not** a credential: test-mode confirmation only works for the buyer of an
  account-bound (course/Academy) order.
- Commission/split logic lives **only** on the server (`src/lib/orders.ts`); the frontend never
  computes or submits amounts. Only `PUBLISHED` products/courses can be checked out.
- Test mode is explicit — orders are labeled `mode=TEST`, banners shown, admin filters separate.

## Secrets

- `.env` is git-ignored; `.env.example` documents keys with empty values.
- No credential is invented anywhere in the repo; missing keys degrade to documented TEST mode.

## Headers / platform

- Next.js defaults (X-Frame-Options, etc.); the app renders no cross-origin embeds.
- Cookies: httpOnly where server-read; SameSite=Lax; attribution cookies are non-sensitive codes.
- `.env` and `nuvra.db` excluded from git.

## Known limitations (honest list)

- Workspace membership roles exist in the schema (`OWNER | ADMIN | MEMBER`, every workspace
  creator is `OWNER`) but **no team layer is shipped yet**: the only way to join a workspace is
  to create one, and every action scopes on the caller's workspace rather than on a finer role.
  Enforce role checks before opening workspace invitations to third parties.
- Rate limiter is per-instance (see above).
- libSQL (local file or hosted Turso) is single-writer per database: perfect at this scale;
  the same Drizzle schema moves to Postgres if multi-region write load ever requires it.
- No 2FA/TOTP yet — session hygiene + bcrypt + rate limits today.
