'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

/**
 * LiquidGlassHeader — the signature public navigation.
 *
 * A floating glass capsule: rounded-full, translucent, blurred and saturated,
 * with a hairline border, a soft drop shadow and a very light top sheen (all
 * from `.glass-capsule`). It never touches the viewport edges, and it stays
 * legible over any section because the surface is blurred behind it.
 *
 * Blur cost is bounded on purpose: exactly one backdrop-filter per page, no
 * animated filter, and a solid fallback where backdrop-filter is unsupported.
 */

export interface NavItem {
  href: string;
  label: string;
}

export function LiquidGlassHeader({
  items,
  children,
  sticky = true,
  brandSize = 'md',
  showWordmark = true,
  className,
}: {
  items: NavItem[];
  /** Right-hand side of the capsule: sign-in, primary CTA, account menu… */
  children?: React.ReactNode;
  sticky?: boolean;
  brandSize?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet on Escape (keyboard reachable)…
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const links = (onNavigate?: () => void) =>
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className="nav-link"
      >
        {item.label}
      </Link>
    ));

  return (
    <div
      className={cn(
        'z-40 w-full px-3 sm:px-5',
        sticky && 'sticky top-0',
        className,
      )}
    >
      <div className="mx-auto max-w-6xl pt-3 sm:pt-4">
        <header
          className={cn(
            'glass-capsule flex items-center gap-3 rounded-full pl-4 pr-2.5 transition-[height] duration-300 ease-smooth sm:pl-5 sm:pr-3',
            // The capsule tightens slightly once the page scrolls: a soft depth cue.
            scrolled ? 'h-14' : 'h-14 sm:h-16',
          )}
        >
          <BrandLogo size={brandSize} priority showWordmark={showWordmark} />

          {/* Desktop navigation — the anchor links stay <a> so they scroll in place */}
          <nav
            aria-label="Navigation principale"
            className="ml-2 hidden items-center gap-1 lg:flex"
          >
            {items.map((item) =>
              item.href.startsWith('#') ? (
                <a key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {children}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="nuvra-mobile-nav"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="btn-glass !rounded-full !p-2.5 lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile sheet — same glass language, full-width, no horizontal overflow */}
      {open ? (
        <div
          id="nuvra-mobile-nav"
          className="mx-auto mt-2 max-w-6xl animate-panelIn lg:hidden"
        >
          <nav
            aria-label="Navigation mobile"
            className="glass-panel flex flex-col rounded-3xl p-2"
          >
            {links(() => setOpen(false))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
