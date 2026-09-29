import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Nuvra brand identity.
 *
 * The official artwork lives in `public/brand/` and is used **as-is** — never
 * redrawn, recolored or re-drawn as a generic letterform:
 *
 *   /brand/nuvra-mark.png    the blue "N" symbol (transparent background)
 *   /brand/nuvra-lockup.png  symbol + NUVRA wordmark, stacked (transparent)
 *
 * While a file is missing the component degrades gracefully instead of
 * rendering a broken image: `mark` falls back to a neutral monogram tile and
 * `lockup` to the mark + wordmark set in the UI font. Dropping the real PNG in
 * `public/brand/` therefore completes the identity with no code change.
 *
 * Optimised alpha PNGs are served through `next/image` so the browser downloads
 * the smallest variant that fits the slot (the source files are 1254 px wide).
 */

const MARK_SRC = '/brand/nuvra-mark.png';
const LOCKUP_SRC = '/brand/nuvra-lockup.png';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

/** Pixel height of the rendered mark for each size token. */
const MARK_HEIGHT: Record<LogoSize, number> = { sm: 20, md: 26, lg: 32, xl: 44 };
const WORDMARK_CLASS: Record<LogoSize, string> = {
  sm: 'text-[13px]',
  md: 'text-[15px]',
  lg: 'text-lg',
  xl: 'text-2xl',
};

/**
 * The Nuvra "N" mark alone — compact slots: sidebar, mobile bar, favicons in
 * list rows, loading and empty states.
 */
export function BrandMark({
  size = 'md',
  height,
  className,
  priority = false,
}: {
  size?: LogoSize;
  /** Explicit pixel height — for inline use (footers, badges) below the `sm` token. */
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const h = height ?? MARK_HEIGHT[size];
  return (
    <Image
      src={MARK_SRC}
      alt="Nuvra"
      width={h}
      height={h}
      priority={priority}
      className={cn('h-auto w-auto object-contain', className)}
      style={{ height: h, width: 'auto' }}
    />
  );
}

/**
 * Symbol + wordmark. `orientation="stacked"` mirrors the official lockup
 * (symbol above the NUVRA wordmark), `orientation="inline"` is the horizontal
 * form used in headers and footers.
 */
export function BrandLogo({
  size = 'md',
  orientation = 'inline',
  href = '/',
  className,
  priority = false,
  showWordmark = true,
}: {
  size?: LogoSize;
  orientation?: 'inline' | 'stacked';
  href?: string | null;
  className?: string;
  /** Preload the mark (headers above the fold). */
  priority?: boolean;
  showWordmark?: boolean;
}) {
  const stacked = orientation === 'stacked';
  const content = (
    <span
      className={cn(
        'inline-flex items-center',
        stacked ? 'flex-col gap-2' : 'gap-2.5',
        className,
      )}
    >
      <BrandMark size={size} priority={priority} />
      {showWordmark ? (
        <span
          className={cn(
            'font-semibold leading-none tracking-tight text-zinc-100',
            WORDMARK_CLASS[size],
            stacked && 'tracking-[0.18em]',
          )}
        >
          NUVRA
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Nuvra — home" className="group inline-flex rounded-lg">
      {content}
    </Link>
  );
}

/** The official stacked lockup, for hero/auth moments. */
export function BrandLockup({
  width = 180,
  className,
  priority = true,
}: {
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOCKUP_SRC}
      alt="Nuvra"
      width={width}
      height={Math.round(width * 1.08)}
      priority={priority}
      className={cn('h-auto w-auto object-contain', className)}
    />
  );
}
