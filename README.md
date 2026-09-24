# Nuvra

**Create. Sell. Teach. Scale.** — the all-in-one operating system for digital business.

Nuvra is a production-grade SaaS platform: websites & funnels, digital products, courses (LMS),
CRM, email marketing, automations, affiliate programs, marketplace, payouts and analytics —
with a complete double-entry-style ledger, server-side commission splits and an admin console.

- **Platform is free to use.** Creators on the Free plan pay a platform commission (default **10 %**, admin-configurable); **Nuvra Pro** removes it (0 %).
- **Nuvra Academy** is the paid flagship course. Buying it activates the **reseller program**: resellers keep **90 %** of sales they attribute (admin-configurable bps), Nuvra keeps 10 %.
- **No fake data anywhere.** Every number on every dashboard is computed from the database. Payment and email integrations run in clearly-labeled TEST mode until you provide credentials — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Quick start

```bash
npm install
cp .env.example .env          # then edit values (see docs/DEPLOYMENT.md)
npx drizzle-kit generate      # only if schema changed
npx drizzle-kit migrate       # creates nuvra.db
npm run db:seed               # demo data + demo accounts (see below)
npm run dev                   # http://localhost:3000
```

Demo accounts (created by `npm run db:seed`, clearly-marked demo data):

| Account | Password | Role |
|---|---|---|
| `admin@nuvra.app` | `admin2026!` | Administrator (`/admin`) |
| `creator@nuvra.app` | `creator2026!` | Free-plan creator with pages, products, courses, funnel |
| `reseller@nuvra.app` | `reseller2026!` | Active reseller (90/10 program) |
| `student@nuvra.app` | `student2026!` | Student / customer |

> These accounts exist only in your local/dev database. Never seed demo accounts in production.

## Quality gates

```bash
npm run typecheck   # tsc --noEmit — 0 errors
npm run lint        # eslint (next/core-web-vitals + next/typescript) — 0 problems
npm test            # vitest — 52 tests: money splits, refunds, ledger, auth, rate-limit, utils
npm run build       # next build
```

## Documentation

| Doc | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, directory layout, data flow, rendering model |
| [docs/BUSINESS-MODEL.md](docs/BUSINESS-MODEL.md) | The 4 money systems, configurable values, ledger rules |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, sessions, RBAC, multi-tenancy, rate limits, secrets |
| [docs/API.md](docs/API.md) | HTTP endpoints + server-action contracts |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Env vars, Stripe setup, cron, Vercel deploy |
| [docs/TESTING.md](docs/TESTING.md) | Test strategy and how to run each suite |

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (default `./nuvra.db`) |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | Canonical URL (links, Stripe redirects) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Live payments (absent ⇒ labeled TEST mode) |
| `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` | Recurring subscription price IDs |
| `RESEND_API_KEY` | Transactional email (absent ⇒ local outbox log) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | AI features (absent ⇒ features report unavailable) |
| `CRON_SECRET` | Protects `/api/cron/process` in production |

`.env` is git-ignored. Never commit secrets.

## License

Private — Nuvra SAS. All rights reserved.
