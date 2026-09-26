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
- Commission/split logic lives **only** on the server (`src/lib/orders.ts`); the frontend never
  computes or submits amounts.
- Test mode is explicit — orders are labeled `mode=TEST`, banners shown, admin filters separate.

## Secrets

- `.env` is git-ignored; `.env.example` documents keys with empty values.
- No credential is invented anywhere in the repo; missing keys degrade to documented TEST mode.

## Headers / platform

- Next.js defaults (X-Frame-Options, etc.); the app renders no cross-origin embeds.
- Cookies: httpOnly where server-read; SameSite=Lax; attribution cookies are non-sensitive codes.
- `.env` and `nuvra.db` excluded from git.

## Known limitations (honest list)

- Rate limiter is per-instance (see above).
- libSQL (local file or hosted Turso) is single-writer per database: perfect at this scale;
  the same Drizzle schema moves to Postgres if multi-region write load ever requires it.
- No 2FA/TOTP yet — session hygiene + bcrypt + rate limits today.
