# Nuvra — Deployment

Nuvra stores everything in **libSQL** — the same engine as SQLite, spoken over a driver that can
talk either to a local file *or* to a hosted database (Turso). That single choice gives two
deployment shapes:

| Host | Database | Verdict |
|---|---|---|
| **Vercel** | **Turso** (hosted libSQL) | **Recommended** — serverless, no disk, free tier available |
| Railway / Fly.io / Render / any Docker host or VPS | local libSQL file on a persistent volume | Works out of the box (same image) |
| Local development & tests | `./nuvra.db` (or `:memory:`) | No configuration needed |

Migrations and the first administrator are applied automatically — at build time on Vercel
(`vercel.json` → `npm run db:migrate && npm run build`), at boot on a long-running server
(`src/lib/startup.ts`).

> **Français** : guide pas à pas en 3 étapes → [docs/VERCEL.fr.md](VERCEL.fr.md).

---

## 1 — Vercel + Turso (recommended)

### 1.1 Create the database

1. Vercel dashboard → your project → **Storage** → **Marketplace** → **Turso** → **Connect**.
   The integration creates the database **and** adds the environment variables for you
   (`STORAGE_TURSO_DATABASE_URL`, `STORAGE_TURSO_AUTH_TOKEN`, …). Nuvra discovers them
   automatically: any `*_DATABASE_URL` variable whose value is `libsql://…` or `*.turso.io`
   wins over a local path (`src/lib/db.ts`).

   Prefer the CLI? `turso db create nuvra` then `turso db show nuvra --url` and
   `turso db tokens create nuvra`, and set the two variables below yourself.

2. Required variables (Project → **Settings → Environment Variables**, Production **and**
   Preview):

   | Variable | Value |
   |---|---|
   | `TURSO_DATABASE_URL` | `libsql://<db>-<org>.turso.io` (or use the Marketplace integration) |
   | `TURSO_AUTH_TOKEN` | the token for that database |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | your admin login — password **≥ 12 characters** |
   | `CRON_SECRET` | a long random value (`openssl rand -hex 32`) |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-project>.vercel.app` (or your domain) |
   | Stripe / Resend / AI keys | optional — see §3 |

   Accepted aliases: `DATABASE_URL` + `DATABASE_AUTH_TOKEN`.

3. **Deploy** (or *Redeploy* if the project already exists). The build runs
   `npm run db:migrate && npm run build`: migrations plus the first admin are applied to Turso
   **before** the app is built, so a fresh database is never empty.

4. Verify: `https://<your-project>.vercel.app/api/health` →
   `{"ok":true,"db":"ok","database":"turso",…}`, then sign in at `/login` with `ADMIN_EMAIL`.

Vercel has no persistent disk, so the build **fails on purpose** if no hosted database is
configured:

```
No hosted database configured. Vercel has no persistent disk, so a local SQLite file cannot
be used: set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (see docs/DEPLOYMENT.md)
```

### 1.2 Scheduled work (cron)

`vercel.json` registers a daily cron (`0 3 * * *` → `POST /api/cron/process`) that delivers
due sequence emails and resumes automations paused by a *wait* step. Vercel Cron calls the
route with `Authorization: Bearer $CRON_SECRET`, which the route accepts (it also accepts the
`x-cron-secret` header for manual calls, Railway cron, `cron-job.org`, GitHub Actions — see
[`.github/workflows/cron.yml`](../.github/workflows/cron.yml)).

---

## 2 — Docker (Railway, Fly.io, Render, VPS…)

```bash
docker build -t nuvra .
docker run -d --name nuvra -p 3000:3000 -v nuvra-data:/data \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD='a-long-passphrase' \
  -e CRON_SECRET="$(openssl rand -hex 32)" \
  nuvra
```

- Default `DATABASE_URL=/data/nuvra.db` → a libSQL file on the volume. Migrations and the first
  admin are applied **at boot**; restarting the container is always safe.
- You can point a container at Turso too: set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` and the
  volume becomes unnecessary.
- Image: `node:22-bookworm-slim`, production dependencies only, `HEALTHCHECK` on `/api/health`.
- Runs as root on purpose: hosted volumes are mounted root-owned and the database file must be
  writable. Honors `PORT` (Railway/Render/Fly inject it).
- **Railway**: *Deploy from GitHub* → *Add volume*, mount path `/data` → set the variables →
  *Generate domain*. `railway.json` sets the builder and the `/api/health` check.
- **Fly.io**: `fly launch --no-deploy`, `fly volumes create nuvra_data --size 1`, add
  `[mounts] source = "nuvra_data", destination = "/data"` to `fly.toml`, set secrets, `fly deploy`.
- **Render**: Web Service from the repo (Docker) + a **Disk** mounted at `/data` (paid instance),
  then set the env vars.

---

## 3 — Environment

| Variable | Required | Notes |
|---|---|---|
| `TURSO_DATABASE_URL` (+ `TURSO_AUTH_TOKEN`) | Vercel / hosted | `libsql://…` or `https://…`. `DATABASE_URL` + `DATABASE_AUTH_TOKEN` are accepted aliases; the Vercel Marketplace Turso integration's prefixed names (`STORAGE_TURSO_DATABASE_URL`, …) are auto-detected |
| `DATABASE_URL` | local / Docker | Path of the local database file. Default `./nuvra.db`; on a volume `/data/nuvra.db`. `:memory:` works (tests) |
| `NEXT_PUBLIC_APP_URL` | yes (prod) | Canonical URL — Stripe redirects, share links, emails. Falls back to `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` on Vercel |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | first deploy | First administrator + platform workspace, provisioned **only while no admin exists** (an existing account with that email is promoted). Password ≥ 12 chars. Never logged |
| `CRON_SECRET` | **prod** | `/api/cron/process` refuses to run in production without it |
| `AUTO_MIGRATE` | no | `false` disables migrations at boot (then run `npm run db:migrate` yourself) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | for live payments | absent ⇒ labeled TEST mode |
| `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` | for subscriptions | recurring price IDs |
| `RESEND_API_KEY` | for email delivery | absent ⇒ outbox (rows in `email_logs`, visible in Admin → Emails) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | optional | AI features |
| `PORT` | no | default 3000 |

**Never commit `.env`.** The repo contains `.env.example` only.

## 4 — Database

```bash
npm run db:migrate   # apply drizzle/ migrations + bootstrap plans & first admin (idempotent)
npm run db:seed      # demo data + demo accounts — local/staging ONLY, never in production
npm run db:reset     # throw the local file away, re-migrate and re-seed
```

`npm run db:migrate` is the same code path the Vercel build and the server boot use
(`src/lib/startup.ts` → `bootstrapDatabase()`), so CI, production and local stay identical.

**Backups**: on Turso use `turso db shell` / the dashboard's point-in-time restore; on a
self-hosted volume copy `/data/nuvra.db` (`sqlite3 /data/nuvra.db ".backup /data/backup.db"`)
or snapshot the volume.

## 5 — Stripe

1. Create products/prices → put price IDs in env.
2. Webhook endpoint: `https://your-domain.com/api/stripe/webhook` with events:
   `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`.
3. Put the signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Until then the app runs in TEST mode — checkout creates clearly-labeled test orders that
   exercise the **exact same** split/ledger/enrollment pipeline.

## 6 — Cron

Something must call `POST https://your-domain.com/api/cron/process` regularly (every 1–5 min).
It delivers scheduled sequence emails and resumes automations paused by a *wait* step.

- **On Vercel**: automatic (`vercel.json` → `crons`, daily). Increase the frequency in
  `vercel.json` if you need faster delivery (Hobby plans allow one cron per day).
- **Zero-setup elsewhere**: `.github/workflows/cron.yml` does it every 5 minutes as soon as the
  repository secrets `APP_URL` and `CRON_SECRET` exist (GitHub → Settings → Secrets → Actions).
- Or Railway cron, system cron, cron-job.org — anything that can send
  `x-cron-secret: $CRON_SECRET` (or `Authorization: Bearer $CRON_SECRET`).

## 7 — Post-deploy checklist

- [ ] `GET /api/health` → `200 { "ok": true, "db": "ok", "database": "turso" | "file", … }` — point your uptime monitor at it
- [ ] Log shows `[nuvra:startup] database target: …` and, on first deploy, `administrator created: …`
- [ ] Sign in with `ADMIN_EMAIL` → `/admin` loads; *Settings* shows platform values
- [ ] Register a normal account → onboarding → dashboard
- [ ] Test checkout (or live Stripe with test keys) creates a PAID order + ledger entries;
      `/checkout?item=academy` resolves (platform workspace exists)
- [ ] `/api/stripe/webhook` returns 400 on a bogus signature, 200 on a real event
- [ ] `POST /api/cron/process` without secret → 401; with secret → `{ ok: true }`
- [ ] Staging only: `BASE=https://staging.example npm run smoke` green (needs demo accounts)
- [ ] CI green on the pull request (`typecheck`, `lint`, 55 tests, build, Docker job)
