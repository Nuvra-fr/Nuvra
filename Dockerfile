# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# Nuvra — production image (Railway, Fly.io, Render, any Docker host)
#
#   docker build -t nuvra .
#   docker run -p 3000:3000 -v nuvra-data:/data \
#     -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
#     -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD='a-long-passphrase' \
#     -e CRON_SECRET='another-secret' nuvra
#
# Two supported backends (src/lib/db.ts):
#   • Turso / hosted libSQL — set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
#   • local libSQL file on the /data volume (default DATABASE_URL=/data/nuvra.db)
# Migrations and the first admin are applied automatically at boot
# (src/lib/startup.ts).
# ─────────────────────────────────────────────────────────────

ARG NODE_VERSION=22

# ── 1. dependencies (all, for the build) ─────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# libSQL ships prebuilt N-API binaries, so no toolchain is needed and
# --ignore-scripts is safe. Fail fast if the driver cannot be loaded.
RUN npm ci --ignore-scripts --no-audit --no-fund \
 && node -e "require('@libsql/client').createClient({url:':memory:'}).execute('select 1').then(()=>process.exit(0),e=>{console.error(e);process.exit(1)})"

# ── 2. build ─────────────────────────────────────────────────
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time DB is a throwaway file; the runtime DB is on the volume.
ENV DATABASE_URL=/tmp/build.db
RUN npm run build

# ── 3. runtime (production deps only) ────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    DATABASE_URL=/data/nuvra.db

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
 && node -e "require('@libsql/client').createClient({url:':memory:'}).execute('select 1').then(()=>process.exit(0),e=>{console.error(e);process.exit(1)})" \
 && npm cache clean --force \
 && mkdir -p /data

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/drizzle ./drizzle

# The container runs as root on purpose: hosted volumes (Railway, Fly) are
# mounted root-owned and the libSQL file lives in /data.
VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "start"]
