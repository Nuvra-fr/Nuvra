# Nuvra Academy

The paid flagship programme: **8 modules · 118 lessons · French · with a certificate**.
This document describes how it is built, how the money unlocks it, and how to operate it.

---

## 1. What the Academy is

Two things in one product, taught in this order:

1. **The business** — market and niche, problem, audience, offer, product, funnel, leads, content,
   sales, email, automation, analytics, growth.
2. **Nuvra mastery** — every important lesson ends with a **Nuvra Action**: a real route in the app
   (`/dashboard/products?new=1`, `/dashboard/funnels?new=1`, …) and a **verification against the real
   workspace data** (`src/lib/academy.ts → evaluateNuvraAction`).

Pedagogical flow of every lesson:

```
COMPRENDRE → APPRENDRE → VOIR → FAIRE → VALIDER → PASSER À LA SUITE
```

| Module | Lessons | Outcome |
|---|---|---|
| 1 — Workshop | 10 | The business is defined (mission, niche, problem, audience, offer) |
| 2 — Product | 14 | A real product exists in Nuvra |
| 3 — Funnel | 15 | A real funnel exists in Nuvra |
| 4 — Course | 17 | A real course exists in Nuvra |
| 5 — Acquisition | 15 | Traffic and leads, measured |
| 6 — Conversion | 15 | Checkout, sales copy, conversion |
| 7 — Automation | 15 | Emails and automations running |
| 8 — Growth | 17 | **Nuvra Growth System** lab + **THE NUVRA LAUNCH PROJECT** |

The last page of the programme is [`/academy/completion`](/academy/completion): *THE NUVRA LAUNCH
PROJECT* — the capstone brief, checked off against the learner's real objects.

---

## 2. Content lives in typed content, not in React

```
src/content/academy/
  types.ts        lesson, exercise, quiz, video package, resource, Nuvra action
  module-1..8.ts  the curriculum (French source of truth)
  builder.ts      buildModule() — applies the contract (durations, lab type, ids)
  index.ts        academyCourse() — the course shell, exposed to the DB layer
```

Content is **projected into the database** (`scripts/seed-academy.ts`, `npm run db:seed:academy`,
also run by `npm run db:seed` and at boot when the curriculum is missing). React never hardcodes
lesson text: pages read the DB, the admin console edits the DB. The projection is idempotent —
re-running it updates content, preserves `id`, and therefore preserves learner progress.

The eight section bodies of each lesson (`introduction`, `explanation`, `example`, `application`,
`nuvraApplication`, `summary`, `nextStep`) live in `lessons.content_json`, so they are editable
without a deploy.

---

## 3. Routes

| Route | Access | Purpose |
|---|---|---|
| `/academy` | public | The premium offer (price from `courses.price_cents`, never hardcoded) |
| `/academy/completion` | public | THE NUVRA LAUNCH PROJECT — the capstone |
| `/dashboard/academy` | entitled | Programme: modules, lessons, progress, resume |
| `/dashboard/academy/[module]` | entitled | Lessons of a module |
| `/dashboard/academy/[module]/lecon/[lesson]` | entitled | The player: video, content, exercise, quiz, notes |
| `/certificate/[id]` | public | Certificate verification (privacy-minimized) |
| `/admin/academy` | admin | Curriculum, students, media, analytics |
| `/api/academy/actions?check=…` | entitled | Nuvra Action verification (real workspace data) |
| `/api/academy/assets/[assetId]` | entitled | Video package (script, storyboard, chapters, transcript) |
| `/api/academy/media/[assetId]` | entitled + signed | Private media stream (short-lived, user-bound) |

Entitlement is checked **server-side** in every one of those entry points. A React guard is a
convenience, never the protection: without an ACTIVE `academy` entitlement the APIs answer `403`
and the lesson page redirects to `/dashboard/academy?locked=1`.

---

## 4. Money → access

```
Stripe checkout ──▶ checkout.session.completed / charge.refunded (verified signature)
                     └──▶ finalizeOrderPaid()   (orders.ts)
                          ├── entitlement  key=academy  status=ACTIVE
                          ├── enrollment   source=ACADEMY (or RESELLER when attributed)
                          ├── students     row
                          ├── lesson_progress / module_progress seeded at 0
                          ├── email sequence academy.purchased → 6 emails
                          └── redirect to /dashboard/academy
```

* Only a **verified** webhook creates the grant (`stripe.webhooks.constructEvent`).
* A **refund** revokes the entitlement, keeps the enrollment, the progress and every quiz attempt,
  and recomputes the reseller's attributed revenue. Access is suspended, never erased.
* Owning a Nuvra account grants **nothing**: the free Platform and the paid Academy stay separate,
  and resale rights come only from buying the Academy.

---

## 5. Progress is server-side

`lesson_progress` (with `seconds_spent`), `video_progress` (`position_sec`, `duration_sec`,
`percent`), `quiz_attempts` (score, passed, answers) and `enrollments.progress_pct` /
`completed_at` are all written server-side by server actions.

`getResumeTarget()` returns the **first lesson that is not completed** — a lesson that only has a
video-progress row (watched, not finished) is *not* counted as done — plus the exact video
position to resume from. Leaving and returning lands on the same line of the same lesson.

Completion issues a certificate with a unique `NV-XXXXXXXXXX` code; `/certificate/[id]` shows the
learner's name, the course, the issue date and the real statistics of the program (no email, no
internal ids).

---

## 6. Videos: honest until the file exists

Each video package ships a **complete script, a timed storyboard, chapters and a full transcript**.
Until the real file is uploaded, `video_assets.status = 'SCRIPTED'` and `playback_url IS NULL`:
the player shows the storyboard and the transcript — it never pretends to stream, and there is no
fake URL anywhere.

When a file is published, playback goes through `/api/academy/media/[assetId]?u=…&exp=…&sig=…`:
an HMAC signature bound to the asset **and** to the user, valid for 5 minutes
(`MEDIA_SIGNING_SECRET`). Admin → Académie → Médias handles the transition.

---

## 7. Operations

```bash
npm run db:seed:academy   # project the curriculum into the database (idempotent)
npm run db:seed           # full demo data, including the Academy
npm test                  # 127 tests, including tests/academy-e2e.test.ts
```

`tests/academy-e2e.test.ts` walks the whole paid journey against a throwaway database: no access →
verified payment → access granted → exact resume → video position → Nuvra Action verification →
quiz failed then passed → 118 lessons completed → certificate → public verification → refund →
revocation with history preserved → non-purchaser still blocked.
