# Nuvra — Testing

## Commands

```bash
npm test            # vitest run — the full suite
npm run test:watch  # watch mode
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (next/core-web-vitals + next/typescript)
```

## Suites

| File | What it proves |
|---|---|
| `tests/money.test.ts` | Split math: `splitByBps`, Academy 90/10, Free 10 %, Pro 0 %, rounding/remainder conservation, refunds proportions, coupons, processor-fee display helper, formatting. |
| `tests/orders.test.ts` | **Integration** against a temp DB with the real migrations: createOrder → finalizeOrderPaid for every business-model case, ledger entries per account, refund reversals (including plan-change-after-sale), idempotent finalize, ledger summary = summed entries. |
| `tests/auth.test.ts` | bcrypt verify (right/wrong/salt), sha256 determinism, timing-safe token compare. |
| `tests/rate-limit.test.ts` | Window limits, reset after window, key isolation (fake timers). |
| `tests/utils.test.ts` | slugify (incl. path-traversal input), randomCode, safeJson fallbacks, percent, timeAgo, cn. |

## Conventions

- Tests are **pure where possible**; the integration suite points `DATABASE_URL` at a
  `mkdtemp` file **before** importing `@/lib/db`, then runs `drizzle-kit` migrations — the
  development database is never touched.
- Assertions encode the business contract (e.g. `sellerCents + platformCents === gross`,
  refund proportions equal sale proportions) so any refactor that breaks money math fails CI.
