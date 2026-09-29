# Nuvra brand assets

| File | Use |
|---|---|
| `nuvra-mark.png` | The blue "N" symbol alone — compact slots (sidebar, mobile bar, loading states). |
| `nuvra-lockup.png` | Symbol + NUVRA wordmark, stacked — hero and auth screens. |
| `og.png` | Open Graph / social share card (1200×630). |

Favicons live at `src/app/icon.png` and `src/app/apple-icon.png` (Next.js App Router file
conventions — no markup needed).

## Swapping in the official export

Drop the official transparent-PNG exports in this folder with exactly these file names and
they are picked up everywhere automatically: `BrandLogo` reads these paths and never redraws
the artwork. Keep the same proportions (square mark, ~1:1.08 lockup) so nothing shifts, and
always keep the background transparent so the mark sits correctly on dark surfaces.
