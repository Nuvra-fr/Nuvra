# Nuvra — Testing

## Commands

```bash
npm test            # vitest run — the full suite
npm run test:watch  # watch mode
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (next/core-web-vitals + next/typescript)
npm run smoke       # HTTP smoke test against a running, seeded server (see below)
```

## Suites

| File | What it proves |
|---|---|
| `tests/money.test.ts` | Split math: `splitByBps`, Academy 90/10, Free 10 %, Pro 0 %, rounding/remainder conservation, refunds proportions, coupons, processor-fee display helper, formatting. |
| `tests/orders.test.ts` | **Integration** against a temp DB with the real migrations: createOrder → finalizeOrderPaid for every business-model case, ledger entries per account, refund reversals (including plan-change-after-sale), idempotent finalize, ledger summary = summed entries. |
| `tests/register.test.ts` | **Integration** of the real `POST /api/auth/register` handler (with `next/headers` mocked): account + profile + workspace + OWNER membership created, **session cookie issued** so `/onboarding` resolves the user, 409 on duplicate email, 400 on invalid input. Regression test for the sign-up → `/register` redirect loop. |
| `tests/auth.test.ts` | bcrypt verify (right/wrong/salt), sha256 determinism, timing-safe token compare. |
| `tests/rate-limit.test.ts` | Window limits, reset after window, key isolation (fake timers). |
| `tests/utils.test.ts` | slugify (incl. path-traversal input), randomCode, safeJson fallbacks, percent, timeAgo, cn. |

## Smoke test (`scripts/smoke.sh`)

Black-box HTTP check of **every page as anonymous and as each demo role** (creator, reseller,
student, admin): public pages 200, auth guards 307, RBAC (`/admin` bounces non-admins), all
dashboard + admin pages 200, `/api/health` 200. Fails on any unexpected status.

```bash
npm run db:seed && npm run dev      # or: npm run build && npm run start
npm run smoke                       # BASE=https://staging.example npm run smoke
```

Sessions are read from `Set-Cookie` directly, so it also works against a production server
(where the cookie is `Secure`) reached over plain http, e.g. in CI.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every pull request:
typecheck → lint → tests → build → migrations on an empty DB → seed → production server →
smoke test. Keep it green.

## Conventions

- Tests are **pure where possible**; the integration suite points `DATABASE_URL` at a
  `mkdtemp` file **before** importing `@/lib/db`, then runs `drizzle-kit` migrations — the
  development database is never touched.
- Assertions encode the business contract (e.g. `sellerCents + platformCents === gross`,
  refund proportions equal sale proportions) so any refactor that breaks money math fails CI.
