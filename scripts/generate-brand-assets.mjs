#!/usr/bin/env node
/**
 * Generates Nuvra's raster brand assets from vector geometry.
 *
 *   public/brand/nuvra-mark.png     blue "N" symbol on a transparent canvas
 *   public/brand/nuvra-lockup.png   symbol + NUVRA wordmark, stacked
 *   public/brand/og.png             Open Graph / social share card
 *   src/app/icon.png                favicon (Next.js file convention)
 *   src/app/apple-icon.png          iOS home-screen icon
 *
 * Once the official PNG exports are dropped into `public/brand/` using the same
 * file names, this script is no longer needed — `BrandLogo` reads those files
 * directly and never redraws them. Re-running it overwrites them, so only run it
 * deliberately:
 *
 *   node scripts/generate-brand-assets.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const BRAND_DIR = path.join(ROOT, 'public', 'brand');

const CYAN = '#38B6FF';
const BLUE = '#2B4BFF';
const DEEP = '#1B2FD0';
const WHITE = '#FFFFFF';
const INK = '#04060A';
const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';

/**
 * The Nuvra "N": two rounded stems plus one diagonal band running from the top
 * of the left stem to the bottom of the right stem, on a 512×512 grid.
 *
 * Geometry and gradient are declared once and interpolated into every asset, so
 * the mark can never drift between the symbol, the lockup and the favicon.
 */
const DEFS = `<defs>
    <linearGradient id="nuvraBlue" x1="0.08" y1="0.02" x2="0.92" y2="0.98" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="${CYAN}"/>
      <stop offset="0.42" stop-color="#3E7BFF"/>
      <stop offset="0.46" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${DEEP}"/>
    </linearGradient>
  </defs>`;

const MARK_SHAPES = `<g fill="url(#nuvraBlue)">
      <rect x="104" y="104" width="88" height="304" rx="44"/>
      <rect x="320" y="104" width="88" height="304" rx="44"/>
      <path d="M104 104h88l216 304h-88z"/>
    </g>`;

/** The mark alone, transparent square canvas. */
function markSvg(size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512" fill="none">
  ${DEFS}
  ${MARK_SHAPES}
</svg>`;
}

/** Symbol above the wordmark — the official stacked lockup. */
function lockupSvg(width = 1254) {
  const height = Math.round(width * 1.08);
  const markSize = Math.round(width * 0.32);
  const markTop = Math.round(height * 0.13);
  const markLeft = Math.round((width - markSize) / 2);
  const scale = (markSize / 512).toFixed(4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${DEFS}
  <g transform="translate(${markLeft} ${markTop}) scale(${scale})">
    ${MARK_SHAPES}
  </g>
  <text x="${width / 2}" y="${Math.round(height * 0.9)}" text-anchor="middle"
        font-family="${FONT}" font-size="${Math.round(width * 0.225)}"
        font-weight="700" letter-spacing="${Math.round(width * 0.01)}"
        fill="${WHITE}">NUVRA</text>
</svg>`;
}

/** Favicon / app icon: the mark on a dark surface, legible down to 16 px. */
function iconSvg({ size = 512, rounded = true } = {}) {
  const pad = Math.round(size * 0.19);
  const inner = size - pad * 2;
  const scale = (inner / 512).toFixed(4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  ${DEFS}
  <rect width="${size}" height="${size}" rx="${rounded ? Math.round(size * 0.22) : 0}" fill="${INK}"/>
  <g transform="translate(${pad} ${pad}) scale(${scale})">
    ${MARK_SHAPES}
  </g>
</svg>`;
}

/** Social share card. */
function ogSvg(width = 1200, height = 630) {
  const scale = (200 / 512).toFixed(4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${DEFS}
  <defs>
    <radialGradient id="bloom" cx="0.5" cy="0" r="0.75">
      <stop offset="0" stop-color="#1B51F5" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#1B51F5" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${INK}"/>
  <rect width="${width}" height="${height}" fill="url(#bloom)"/>
  <g transform="translate(${(width - 200) / 2} 96) scale(${scale})">
    ${MARK_SHAPES}
  </g>
  <text x="${width / 2}" y="470" text-anchor="middle" font-family="${FONT}"
        font-size="64" font-weight="700" letter-spacing="6" fill="${WHITE}">NUVRA</text>
  <text x="${width / 2}" y="522" text-anchor="middle" font-family="${FONT}"
        font-size="25" fill="#8EBCFF">Create. Sell. Teach. Scale.</text>
</svg>`;
}

const README = `# Nuvra brand assets

| File | Use |
|---|---|
| \`nuvra-mark.png\` | The blue "N" symbol alone — compact slots (sidebar, mobile bar, loading states). |
| \`nuvra-lockup.png\` | Symbol + NUVRA wordmark, stacked — hero and auth screens. |
| \`og.png\` | Open Graph / social share card (1200×630). |

Favicons live at \`src/app/icon.png\` and \`src/app/apple-icon.png\` (Next.js App Router file
conventions — no markup needed).

## Swapping in the official export

Drop the official transparent-PNG exports in this folder with exactly these file names and
they are picked up everywhere automatically: \`BrandLogo\` reads these paths and never redraws
the artwork. Keep the same proportions (square mark, ~1:1.08 lockup) so nothing shifts, and
always keep the background transparent so the mark sits correctly on dark surfaces.
`;

async function main() {
  await mkdir(BRAND_DIR, { recursive: true });

  await sharp(Buffer.from(markSvg(512)), { density: 384 })
    .png({ compressionLevel: 9 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(BRAND_DIR, 'nuvra-mark.png'));

  await sharp(Buffer.from(lockupSvg(1254)), { density: 384 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'nuvra-lockup.png'));

  await sharp(Buffer.from(ogSvg()), { density: 192 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'og.png'));

  await sharp(Buffer.from(iconSvg({ size: 512 })), { density: 384 })
    .png()
    .toFile(path.join(ROOT, 'src', 'app', 'icon.png'));

  await sharp(Buffer.from(iconSvg({ size: 512, rounded: false })), { density: 384 })
    .png()
    .toFile(path.join(ROOT, 'src', 'app', 'apple-icon.png'));

  await writeFile(path.join(BRAND_DIR, 'README.md'), README, 'utf8');

  console.log(
    [
      'brand assets written:',
      '  public/brand/nuvra-mark.png',
      '  public/brand/nuvra-lockup.png',
      '  public/brand/og.png',
      '  src/app/icon.png',
      '  src/app/apple-icon.png',
    ].join('\n'),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
