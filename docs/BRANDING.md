# Nuvra — Brand & visual system

Dark, premium, minimal. Deep ink blacks, one electric blue accent, glass used as a
*hierarchy* — never as a default.

## Brand assets

| File | Use |
|---|---|
| `public/brand/nuvra-mark.png` | The blue "N" symbol alone — compact slots (sidebar, mobile bar, empty/loading states). |
| `public/brand/nuvra-lockup.png` | Symbol + NUVRA wordmark, stacked — hero and auth screens. |
| `public/brand/og.png` | Open Graph / social share card (1200×630, wired into `src/app/layout.tsx`). |
| `src/app/icon.png`, `src/app/apple-icon.png` | Favicon and iOS icon (App Router file conventions — no markup required). |

**The artwork is never redrawn in code.** `src/components/BrandLogo.tsx` reads the files above
and renders them through `next/image`, so the browser downloads the smallest variant that fits
each slot. `scripts/generate-brand-assets.mjs` can regenerate the raster set from vector
geometry (`node scripts/generate-brand-assets.mjs`) — it is a bootstrap only.

**Replacing the assets with the official exports:** drop the transparent PNGs over the exact
file names above and every surface updates with no code change. Keep the proportions (square
mark, ~1:1.08 lockup) so no layout shifts, and keep the background transparent for dark
surfaces. While a file is missing the component degrades to the mark + a wordmark set in the UI
font rather than showing a broken image.

## Components

| Component | Role |
|---|---|
| `<BrandLogo>` | Symbol + wordmark. `orientation="inline" \| "stacked"`, `size="sm\|md\|lg\|xl"`, `href` (null renders static). |
| `<BrandMark>` | Symbol only, optional explicit pixel `height` for inline use. |
| `<BrandLockup>` | The official stacked lockup image, for hero moments. |
| `<LiquidGlassHeader>` | The signature public navigation: a floating glass capsule with items + right-hand `children`. |

## Liquid glass — two levels, on purpose

```css
.glass-capsule  /* floating chrome: public header, dashboard topbar, admin header */
.glass-panel    /* overlays: modals, dropdowns, sidebar, mobile sheet */
```

Both are defined once in `src/app/globals.css` from the `--glass-*` custom properties
(background gradient, hairline, sheen) so every glass surface stays consistent.

Rules we hold to:

- **Blur is bounded.** One `backdrop-filter` per surface, never animated, never nested:
  `blur(22px) saturate(150%)` for the header capsule, `blur(20px) saturate(140%)` for panels.
  Content is not glass by default — cards, tables and forms are opaque so text contrast never
  depends on what scrolls behind them.
- **Always a fallback.** `@supports not (backdrop-filter: …)` swaps in an opaque surface, so
  older engines (and Safari versions without the unprefixed property) stay readable.
- **Light, not neon.** Depth comes from a hairline border, an inset top highlight and a soft
  ambient shadow (`shadow-glass`, `shadow-panel`, `shadow-button-primary`) — no glow halos.
- **Short, cheap motion.** `0.15–0.3s` on `cubic-bezier(0.22, 0.61, 0.36, 1)` (`ease-smooth`),
  transform/opacity only. `prefers-reduced-motion` disables all of it.

## Tokens (`tailwind.config.ts`)

- `ink-950…600` — surfaces, from page background to raised cards.
- `nuvra-50…900` — the accent ramp; `nuvra-600` is the primary action blue.
- Radii: `rounded-xl` (controls), `rounded-2xl` (cards/panels), `rounded-full` (capsule, pills).
- Shadows: `card`, `glass`, `panel`, `button-primary`, `lift`.
- Motion: `ease-smooth`, `animate-fadeUp`, `animate-fadeIn`, `animate-panelIn`.
- Utilities: `.card`, `.card-hover`, `.input`, `.label`, `.nav-link`, `.btn`, `.btn-primary`,
  `.btn-secondary`, `.btn-glass`, `.btn-ghost`, `.btn-danger`, `.badge`, `.table-wrap`,
  `table.data`.

## Where the brand appears

Public pages (`/`, `/pricing`, `/academy`, `/marketplace`, `/marketplace/[id]`, `/c/[slug]`,
`/s/[slug]`, `/u/[username]`, `/p/[ws]/[page]`), auth screens (`/login`, `/register`,
`/forgot-password`, `/reset-password`, `/verify-email`), `/onboarding`, checkout flow, the
dashboard chrome (sidebar brand + mobile topbar mark), the admin console, empty states
(`<EmptyState>` falls back to the mark) and the dashboard loading skeleton.

## Accessibility

- Contrast: text sits on opaque or near-opaque surfaces; glass is chrome, not content.
- Focus: a visible 2 px `nuvra-400` outline on every interactive element (`:focus-visible`).
- The mobile navigation is a real button with `aria-expanded` / `aria-controls`, closes on
  `Escape`, and the sheet is reachable by keyboard.
- Active navigation state is conveyed by colour **and** a filled surface, not colour alone.
- The capsule header keeps its own vertical rhythm (`pt-3`/`pt-4`) so it never overlaps content
  and never causes horizontal overflow (`body { overflow-x: hidden }` as a backstop).
