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
npm run db:migrate            # applies drizzle/ migrations (+ first admin if configured)
npm run db:seed               # demo data + demo accounts (see below)
npm run dev                   # http://localhost:3000
```

No hosted database is required locally: with no `TURSO_DATABASE_URL` the app uses a libSQL
file (`./nuvra.db`). `npm run db:reset` wipes it, re-migrates and re-seeds.

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
npm test            # vitest — 55 tests: money splits, refunds, ledger, registration, auth, rate-limit, utils
npm run build       # next build
npm run smoke       # HTTP smoke test of every route × every demo role (needs a running seeded server)
```

All of the above run automatically in GitHub Actions on every push and pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)). `GET /api/health` is a public
liveness probe for uptime monitors and load balancers.

## Documentation

| Doc | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, directory layout, data flow, rendering model |
| [docs/BUSINESS-MODEL.md](docs/BUSINESS-MODEL.md) | The 4 money systems, configurable values, ledger rules |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, sessions, RBAC, multi-tenancy, rate limits, secrets |
| [docs/API.md](docs/API.md) | HTTP endpoints + server-action contracts |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel + Turso, Docker/Railway, env vars, Stripe, cron |
| [docs/VERCEL.fr.md](docs/VERCEL.fr.md) | Déployer sur Vercel + Turso, guide en français |
| [docs/TESTING.md](docs/TESTING.md) | Test strategy and how to run each suite |

## Deploy

Nuvra stores everything in **libSQL**, so there are two supported shapes:

**Vercel + Turso (recommended, no disk needed).** Add the Turso integration from
Vercel → Storage → Marketplace (or set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` yourself),
plus `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `CRON_SECRET`, then deploy. The build runs
`npm run db:migrate && npm run build` (`vercel.json`), so migrations and the first administrator
are applied to Turso before the app is built. `vercel.json` also registers the daily cron that
drives scheduled emails and automations.

**Docker / Railway / Fly.io / VPS (persistent volume).** Migrations and the first administrator
are applied at boot instead:

```bash
docker build -t nuvra . && docker run -p 3000:3000 -v nuvra-data:/data \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD='a-long-passphrase' -e CRON_SECRET=… nuvra
```

Step-by-step guides: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) ·
[docs/VERCEL.fr.md](docs/VERCEL.fr.md) (français).

## Environment

| Variable | Purpose |
|---|---|
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Hosted libSQL database — required on Vercel. Aliases `DATABASE_URL` / `DATABASE_AUTH_TOKEN`; Vercel Marketplace names (`STORAGE_TURSO_*`) are auto-detected |
| `DATABASE_URL` | Local database file (default `./nuvra.db`; Docker: `/data/nuvra.db`); `:memory:` supported |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First administrator, provisioned while no admin exists (at build time on Vercel, at boot elsewhere). Password ≥ 12 characters |
| `NEXT_PUBLIC_APP_URL` | Canonical URL (links, Stripe redirects, emails); falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Live payments (absent ⇒ labeled TEST mode) |
| `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` | Recurring subscription price IDs |
| `RESEND_API_KEY` | Transactional email (absent ⇒ local outbox log) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | AI features (absent ⇒ features report unavailable) |
| `CRON_SECRET` | Protects `/api/cron/process` in production |

`.env` is git-ignored. Never commit secrets.

## License

Private — Nuvra SAS. All rights reserved.
