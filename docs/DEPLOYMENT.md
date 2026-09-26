# Nuvra — Deployment

## 1 — Environment

Copy `.env.example` → `.env` (local) or configure in your host (Vercel → Project → Settings).

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | SQLite path, e.g. `./nuvra.db` (local) — see *Storage* below for prod |
| `NEXT_PUBLIC_APP_URL` / `APP_URL` | yes | `https://your-domain.com` — used in Stripe redirects & share links |
| `STRIPE_SECRET_KEY` | for live payments | absent ⇒ labeled TEST mode |
| `STRIPE_WEBHOOK_SECRET` | for live payments | from `stripe listen` / webhook endpoint |
| `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` | for subscriptions | recurring price IDs |
| `RESEND_API_KEY` | for email delivery | absent ⇒ outbox (rows in `email_logs`) |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | optional | AI features |
| `CRON_SECRET` | **prod** | `/api/cron/process` refuses to run in prod without it |
| `SESSION_SECRET` | prod | session cookie signing (set a long random value) |

**Never commit `.env`.** The repo contains `.env.example` with empty values only.

## 2 — Database

```bash
npx drizzle-kit migrate     # applies drizzle/ migrations to DATABASE_URL
npm run db:seed             # OPTIONAL: demo data — do NOT run in production
```

**Storage note (Vercel/serverless):** SQLite needs a persistent disk or a hosted SQLite
provider (Turso/LiteFS) or a filesystem mount. On a stateful Node server (Railway, Fly, a VPS)
`./nuvra.db` on a volume just works. The rest of the app is storage-agnostic (Drizzle).

## 3 — Stripe

1. Create products/prices → put price IDs in env.
2. Webhook endpoint: `https://your-domain.com/api/stripe/webhook` with events:
   `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`.
3. Put the signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Until then the app runs in TEST mode — checkout creates clearly-labeled test orders that
   exercise the **exact same** split/ledger/enrollment pipeline.

## 4 — Cron

Call `POST https://your-domain.com/api/cron/process` every minute with header
`x-cron-secret: $CRON_SECRET` (Vercel Cron, GitHub Actions schedule, system cron…).

## 5 — Post-deploy checklist

- [ ] `GET /api/health` → `200 { "ok": true, "db": "ok", … }` — point your uptime monitor /
      load-balancer probe / Docker `HEALTHCHECK` at it (`503` when the DB is unreachable)
- [ ] `BASE=https://your-domain.com npm run smoke` is green (requires the demo accounts —
      staging only; never seed demo data in production)
- [ ] Landing page renders, `/pricing` shows admin-configured values
- [ ] Register → onboarding → dashboard works
- [ ] Test checkout (or live Stripe in test keys) creates PAID order + ledger entries
- [ ] `/api/stripe/webhook` returns 400 on bogus signature, 200 on real event
- [ ] Admin console loads real stats (`/admin`) — admin user required
- [ ] `/api/cron/process` without secret → 401 in production
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` green before push
