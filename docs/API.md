# Nuvra — API

All mutations are Next.js **server actions** (POST semantics, same-origin only) in
`src/server/actions/*`. Every action: auth guard → Zod → ownership check → domain service →
`{ ok: true, … } | { ok: false, error }` + `revalidatePath`.

## HTTP endpoints

### `GET /api/health`
Public liveness/readiness probe (uptime monitors, load balancers, Docker `HEALTHCHECK`).
Reports *which* integrations are configured — never their values.
```json
{ "ok": true, "service": "nuvra", "version": "0.1.0", "env": "production", "uptimeSec": 42,
  "db": "ok", "integrations": { "payments": "test", "email": "OUTBOX", "ai": false, "cronProtected": true } }
```
- `200` healthy · `503` when the database cannot be queried. `Cache-Control: no-store`.

### `POST /api/leads`
Public lead capture from published pages/funnels.
```json
{ "workspaceId": "…", "pagePath": "/p/ws/landing", "email": "a@b.c", "name": "…" }
```
- Dedupes by email per workspace, status `LEAD`, emits `lead.created` (runs automations).
- 20/min/IP rate limit. → `201 {ok}` | `400 {error}` | `429`.

### `POST /api/stripe/webhook`
Stripe events (raw body + `stripe-signature`).
- `400` invalid signature · `503` not configured · `200` processed/duplicate · `500` (Stripe retries).
- Handles: `checkout.session.completed` → `finalizeOrderPaid`; `invoice.paid` /
  `invoice.payment_failed` → subscription state; `customer.subscription.updated|deleted` →
  plan sync; `charge.refunded` → `refundOrder`.
- Idempotent through `stripe_events`.

### `GET|POST /api/cron/process`
Runs due email sequences + waited automation steps.
- Header `x-cron-secret: $CRON_SECRET` — **required in production**, optional in dev.
- → `{ ok, emails, runs }` | `401`.

### `PATCH /api/lessons/[id]` (session cookie)
Lesson content save from the curriculum editor (workspace ownership enforced).

### `POST /api/auth/register|login|logout|forgot-password|reset-password|verify-email`
JSON auth endpoints used by the client forms (see `src/app/api/auth`). `register` and `login`
both open a session (`nuvra_session` httpOnly cookie) and answer `{ ok, next }` — the client
navigates to `next` (`/onboarding` after sign-up, `/dashboard` after sign-in). Rate-limited per IP.

## Server-action groups (by domain)

| Area | File | Key actions |
|---|---|---|
| Auth/onboarding | `onboarding.ts` | setupWorkspace, saveProfile |
| Builder | `builder.ts` | createPageAction, savePageContent, publishPage, funnel CRUD |
| Products/Courses | `products.ts`, `courses.ts` | CRUD, publish, curriculum/lesson CRUD |
| Checkout/Payments | `checkout.ts`, `payments.ts` | startCheckoutAction, confirmTestOrder, refund, payout request |
| CRM/Email | `crm.ts` | contacts CRUD, tags, campaigns send |
| Automations | `automations.ts` | create/toggle/save, triggers validated against whitelist |
| Affiliates | `affiliates.ts` | program CRUD, affiliate add |
| Marketplace | `marketplace.ts` | list, purchase, review |
| Billing | `billing.ts` | upgradePlanAction (Stripe or TEST), cancel |
| Workspace/Profile | `workspace.ts`, `profile.ts` | settings, domains, resend verification |
| Admin | `admin.ts` | settings, moderation, payout, refund, suspend, email queue |

## Attribution params

`?ref=CODE` (or `?aff=` / `?reseller=`) on any page → 30-day cookie → checkout fallback.
Server-side resolution order: URL param → cookie. Reseller resolution: ACTIVE profile,
self-purchase excluded.
