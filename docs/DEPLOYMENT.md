# Nuvra — Deployment

Nuvra is a **stateful Node.js app with a SQLite database**. It deploys as a single container
(or Node process) with a persistent disk. Migrations and the first administrator are applied
automatically when the server boots — no shell access to the host is needed.

| Host | SQLite persistence | Verdict |
|---|---|---|
| **Railway** (Dockerfile + volume) | ✅ volume | **Recommended** — ~5 minutes, auto-deploy from GitHub |
| Fly.io / Render (paid disk) / any VPS or Docker host | ✅ volume / disk | Works as is (same image) |
| Vercel / Netlify / serverless | ❌ ephemeral, read-only filesystem | **Not supported** — the database would vanish on every invocation. Would require migrating the data layer to a hosted DB (Turso/libSQL or Postgres). |

## 0 — Runtime

**Node.js ≥ 22.14** (declared in `package.json` → `engines`; hosts read it to pick the runtime).
`better-sqlite3@13` ships an N-API 10 prebuilt binary, which does not load on Node 18/20 — a
project pinned to an older Node fails at build time while generating static pages.

## 1 — Recommended: Railway (≈ 5 minutes)

1. **New Project → Deploy from GitHub repo** → pick `Nuvra-fr/Nuvra`, branch `main`.
   Railway detects the `Dockerfile` (`railway.json` sets the builder + `/api/health` check).
2. **Volume**: service → *Settings* → *Volumes* → *Add volume*, mount path **`/data`**.
3. **Variables** (service → *Variables*):

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_APP_URL` | `https://<your-service>.up.railway.app` (or your domain) |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | your admin login — ≥ 12 characters; used only while no admin exists |
   | `CRON_SECRET` | a long random value (`openssl rand -hex 32`) |
   | `DATABASE_URL` | already `/data/nuvra.db` in the image — override only if your mount path differs |
   | Stripe / Resend / AI keys | optional — see §3; absent ⇒ labeled TEST mode / outbox |

4. **Networking** → *Generate domain* (port **3000**). Deploy.
5. Open `https://<domain>/api/health` → `{"ok":true,"db":"ok",…}`, then sign in at `/login`
   with `ADMIN_EMAIL` → `/admin`.

Every push to `main` redeploys. The database on `/data` is kept across deploys and restarts.

## 2 — Docker (Fly.io, Render, VPS…)

```bash
docker build -t nuvra .
docker run -d --name nuvra -p 3000:3000 -v nuvra-data:/data \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD='a-long-passphrase' \
  -e CRON_SECRET="$(openssl rand -hex 32)" \
  nuvra
```

- Image: `node:22-bookworm-slim`, production dependencies only, `HEALTHCHECK` on `/api/health`.
- Runs as root on purpose: hosted volumes are mounted root-owned and SQLite must write to `/data`.
- Honors `PORT` (Railway/Render/Fly inject it).
- Fly.io: `fly launch --no-deploy`, then `fly volumes create nuvra_data --size 1`, add
  `[mounts] source = "nuvra_data", destination = "/data"` to `fly.toml`, set secrets, `fly deploy`.
- Render: Web Service from the repo (Docker), add a **Disk** mounted at `/data` (disks require a
  paid instance), set the env vars.

## 3 — Environment

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | SQLite path. Local `./nuvra.db`; production a path **on the volume** (`/data/nuvra.db`) |
| `NEXT_PUBLIC_APP_URL` | yes | `https://your-domain.com` — Stripe redirects, share links, emails |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | first deploy | First administrator + platform workspace, provisioned at boot **only while no admin exists** (an existing account with that email is promoted). Never logged. |
| `CRON_SECRET` | **prod** | `/api/cron/process` refuses to run in production without it |
| `AUTO_MIGRATE` | no | `false` to disable migrations at boot (then run `npm run db:migrate` yourself) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | for live payments | absent ⇒ labeled TEST mode |
| `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` | for subscriptions | recurring price IDs |
| `RESEND_API_KEY` | for email delivery | absent ⇒ outbox (rows in `email_logs`, visible in Admin → Emails) |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | optional | AI features |
| `PORT` | no | default 3000 |

**Never commit `.env`.** The repo contains `.env.example` only.

## 4 — Database

At boot the server applies pending `drizzle/` migrations (`src/lib/startup.ts`), ensures the
subscription plans and — if configured — the first admin. Manual equivalents:

```bash
npm run db:migrate          # drizzle-kit migrate against DATABASE_URL
npm run db:seed             # demo data + demo accounts — local/staging ONLY, never in production
```

**Backups**: the whole database is the single file on the volume. Copy it with SQLite's online
backup (`sqlite3 /data/nuvra.db ".backup /data/backup-$(date +%F).db"`) or snapshot the volume.

## 5 — Stripe

1. Create products/prices → put price IDs in env.
2. Webhook endpoint: `https://your-domain.com/api/stripe/webhook` with events:
   `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`.
3. Put the signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Until then the app runs in TEST mode — checkout creates clearly-labeled test orders that
   exercise the **exact same** split/ledger/enrollment pipeline.

## 6 — Cron

Something must `POST https://your-domain.com/api/cron/process` with header
`x-cron-secret: $CRON_SECRET` regularly (every 1–5 min). It delivers scheduled sequence emails
and resumes automations paused by a *wait* step.

- **Zero-setup option**: `.github/workflows/cron.yml` does it every 5 minutes as soon as the
  repository secrets `APP_URL` and `CRON_SECRET` exist (GitHub → Settings → Secrets → Actions).
- Or a Railway cron service, system cron, cron-job.org — anything that can send that POST.

## 7 — Post-deploy checklist

- [ ] `GET /api/health` → `200 { "ok": true, "db": "ok", … }` — point your uptime monitor at it
- [ ] Container log shows `[nuvra:startup] database ready` and, on first boot,
      `administrator created: …`
- [ ] Sign in with `ADMIN_EMAIL` → `/admin` loads; *Settings* shows platform values
- [ ] Register a normal account → onboarding → dashboard
- [ ] Test checkout (or live Stripe with test keys) creates a PAID order + ledger entries;
      `/checkout?item=academy` resolves (platform workspace exists)
- [ ] `/api/stripe/webhook` returns 400 on bogus signature, 200 on real event
- [ ] `POST /api/cron/process` without secret → 401; with secret → `{ ok: true }`
- [ ] Restart the service: data is still there (volume mounted at `/data`)
- [ ] Staging only: `BASE=https://staging.example npm run smoke` green (needs demo accounts)
- [ ] CI green on `main` (`npm run typecheck && npm run lint && npm test && npm run build`)
