#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Nuvra smoke test — hits every page as anonymous + each demo role and fails
# on any unexpected HTTP status. Requires a running server seeded with
# `npm run db:seed` (demo accounts).
#
#   npm run smoke                      # against http://localhost:3000
#   BASE=https://staging.example bash scripts/smoke.sh
# ─────────────────────────────────────────────────────────────
set -u
BASE="${BASE:-http://localhost:3000}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FAIL=0
declare -A COOKIE=()

# check <role> <path> <expected-status-regex>
check() {
  local role="$1" url="$2" expect="$3" code
  code=$(curl -s -o "$TMP/body" -w '%{http_code}' --max-time 90 \
    -H "Cookie: ${COOKIE[$role]:-}" "$BASE$url")
  if [[ "$code" =~ ^($expect)$ ]]; then
    printf '  %-9s %-46s %s\n' "$role" "$url" "$code"
  else
    printf '  %-9s %-46s %s  <-- UNEXPECTED (want %s)\n' "$role" "$url" "$code" "$expect"
    grep -oE '(Error|Exception)[^<"]{0,140}' "$TMP/body" | head -3 | sed 's/^/             /'
    FAIL=$((FAIL + 1))
  fi
}

# login <role> <email> <password> — stores the session cookie for <role>.
# The cookie is read from Set-Cookie directly (not a curl jar) so it also works
# against a production server over plain http, where the cookie is `Secure`.
login() {
  local role="$1" code token
  code=$(curl -s -o "$TMP/login.json" -D "$TMP/login.h" -w '%{http_code}' --max-time 90 \
    -H 'content-type: application/json' \
    -d "{\"email\":\"$2\",\"password\":\"$3\"}" "$BASE/api/auth/login")
  token=$(grep -i '^set-cookie: nuvra_session=' "$TMP/login.h" | sed -E 's/^[^=]*=([^;]*).*/\1/' | tr -d '\r')
  if [[ "$code" == "200" && -n "$token" ]]; then
    COOKIE[$role]="nuvra_session=$token"
    printf '  login %-9s -> %s (session cookie set)\n' "$role" "$code"
  else
    printf '  login %-9s -> %s  <-- FAILED %s\n' "$role" "$code" "$(head -c 160 "$TMP/login.json")"
    FAIL=$((FAIL + 1))
  fi
}

echo "== Health =="
check anon /api/health 200

echo "== Public (anonymous) =="
for u in / /pricing /academy /marketplace /login /register /forgot-password /reset-password /verify-email \
         /u/creator /@creator /s/camille-studio /p/camille-studio/email-course \
         /c/nuvra-academy /c/email-marketing-that-converts /c/launch-in-a-weekend; do
  check anon "$u" 200
done
check anon /checkout 307                       # no item → back to store
check anon /checkout/success 404               # no order id
check anon /nonexistent-page 404
check anon /s/does-not-exist 404

echo "== Auth guards (anonymous) =="
check anon /dashboard 307
check anon /admin 307
check anon /onboarding 307
check anon /api/notifications '401|307'

echo "== Login (demo accounts from npm run db:seed) =="
login creator  creator@nuvra.app  'creator2026!'
login admin    admin@nuvra.app    'admin2026!'
login reseller reseller@nuvra.app 'reseller2026!'
login student  student@nuvra.app  'student2026!'

echo "== Creator dashboard =="
for u in /dashboard /dashboard/pages /dashboard/funnels /dashboard/products /dashboard/courses \
         /dashboard/customers /dashboard/leads /dashboard/emails /dashboard/automations \
         /dashboard/affiliates /dashboard/marketplace /dashboard/payments /dashboard/analytics \
         /dashboard/store /dashboard/academy /dashboard/help /dashboard/profile \
         /dashboard/settings /dashboard/settings/billing /api/notifications; do
  check creator "$u" 200
done
check creator /admin 307                       # RBAC: non-admin is bounced to /dashboard
check creator /admin/settings 307

echo "== Reseller / student =="
for u in /dashboard /dashboard/academy /dashboard/payments; do check reseller "$u" 200; done
for u in /dashboard /dashboard/academy /dashboard/courses; do check student "$u" 200; done

echo "== Admin console =="
for u in /admin /admin/users /admin/orders /admin/payouts /admin/marketplace /admin/emails \
         /admin/audit /admin/settings; do
  check admin "$u" 200
done

echo
if [[ $FAIL -eq 0 ]]; then
  echo "SMOKE OK"
else
  echo "SMOKE FAILURES: $FAIL"
  exit 1
fi
