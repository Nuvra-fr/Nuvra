# Nuvra — Business model

Four money systems. **Every rate and price below is stored in the `settings` table and editable
in `/admin/settings` — nothing is hardcoded in the frontend, and the server is the only place
splits are computed.**

## 1 — Academy reseller program (90/10)

- The **Nuvra Academy** course is sold by the platform workspace.
- Paying for it activates a **reseller profile** (status `ACTIVE`, unique code).
- Resellers share a link (`/checkout?item=academy&reseller=CODE`, or `?ref=CODE`).
- A sale attributed to an active reseller splits:
  - reseller **90 %** (`commission.resellerBps` = 9000) → `RESELLER_PAYABLE`
  - Nuvra **10 %** → `PLATFORM_REVENUE`
- A direct Academy sale (no reseller) → Nuvra keeps 100 %.
- A reseller's own purchase is never attributed to themselves.

## 2 — Creator sales (Free = 10 % platform fee)

- Creators sell products and courses. The split uses the **seller workspace plan at transaction time**:
  - **FREE** → platform takes `commission.freeBps` (default 1000 = 10 %), creator keeps the rest.
  - **PRO / BUSINESS / AGENCY** → platform takes **0 %**.
- Payment-processor fees (Stripe ~2.9 % + 30¢) are **always displayed separately** and are
  never mixed into commission math (`estimateProcessorFee`, shown as its own line).

## 3 — Nuvra Pro subscription (0 % commission)

- Stripe Checkout (`STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS`), webhook-driven activation.
- Without Stripe configured, upgrading runs in **labeled TEST mode** (no real charge).
- Cancellation is always possible from `/dashboard/settings/billing` — no retention tricks,
  data stays untouched.

## 4 — Affiliate programs (per workspace)

- Each workspace can run its own program: custom commission bps, cookie window, unique codes.
- Links: `/?aff=CODE` → 30-day cookie → applied at checkout (`affiliateSales` + ledger commission).

## Ledger rules (reconstructable, no hidden money)

- **Append-only** entries grouped by operation id (`ledger_entries.group`).
- Accounts: `CREATOR_PAYABLE`, `RESELLER_PAYABLE`, `AFFILIATE_PAYABLE`, `PLATFORM_REVENUE`, `PAYOUT_CLEARING`.
- Direction + amount > 0; balances are always computed from entries.
- Refund = `REVERSAL` entries debiting seller/platform in the **original sale proportions**.
- Payouts debit balances and go pending → processing → paid (admin), each step ledgered.
- Every entry carries `mode` (`TEST`/`LIVE`) so demo activity never pollutes live reporting.

## Admin-configurable values (Settings → Business)

| Setting key | Default | Meaning |
|---|---|---|
| `commission.resellerBps` | 9000 | Reseller share of Academy sales |
| `commission.freeBps` | 1000 | Platform commission on Free creators |
| `academy.priceCents` | 19700 | Academy price |
| `pro.priceCents` | 9900 | Pro plan price |
| `payouts.holdDays` | 7 | Payout hold period |
| `payouts.minCents` | 5000 | Minimum payout |
| flags | — | marketplace/auto-seo/etc. toggles |

## What runs without credentials

| Capability | Without credential | With credential |
|---|---|---|
| Payments | Clearly-labeled **TEST mode** orders (full split/ledger/enrollment flow) | Live Stripe Checkout + webhooks |
| Email | Local **outbox** (rows in `email_logs`, visible in admin) | Resend delivery |
| AI | Endpoints respond `AI not configured` | OpenAI/Anthropic features |

Nothing is faked: test mode is explicit in the UI, the admin console and every order row.
