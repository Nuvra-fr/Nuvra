import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { BrandMark } from '@/components/BrandLogo';
import { ProgressBar } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Académie Nuvra — official cover.
 *
 * The entry point of the training: image-led, almost no copy. It answers three
 * questions in one screen — what this is, what it is worth, and what to do next —
 * and then hands over to the programme (modules → lessons → progress).
 *
 * Visual language: deep ink, a single controlled blue bloom, a whisper of cyan,
 * a technical hairline grid, and the brand mark. All decoration is CSS/SVG — no
 * images, no blur layers, so the cover stays cheap on every device.
 */
export interface AcademyCoverProps {
  /** `learning` = the learner owns it, `discover` = still deciding. */
  mode: 'learning' | 'discover';
  moduleCount: number;
  lessonCount: number;
  progressPct?: number;
  ctaHref: string;
  ctaLabel: string;
  /** Secondary action — e.g. "See the programme" or "Continue". */
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Discover mode only: formatted price, e.g. "$197.00". */
  priceLabel?: string;
  className?: string;
}

export function AcademyCover({
  mode,
  moduleCount,
  lessonCount,
  progressPct,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  priceLabel,
  className,
}: AcademyCoverProps) {
  const learning = mode === 'learning';

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-925',
        className,
      )}
    >
      {/* ── Decoration ───────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(48%_60%_at_50%_-8%,rgba(27,81,245,0.30),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-14 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(56,182,255,0.15),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(72%_62%_at_50%_0%,black,transparent_75%)]"
      />
      <BrandMark
        size="xl"
        priority
        className="pointer-events-none absolute -bottom-8 right-4 opacity-[0.04]"
      />

      {/* ── Composition ──────────────────────────────────────────────── */}
      <div className="relative px-6 pb-11 pt-12 sm:px-10 sm:pb-14 sm:pt-16">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <BrandMark size="lg" priority />

          <h1 className="mt-6 bg-gradient-to-b from-white to-nuvra-200/60 bg-clip-text text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent sm:text-5xl">
            Académie Nuvra
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-400">
            {learning
              ? 'Reprenez là où vous vous êtes arrêté.'
              : 'Apprenez la méthode complète. Construisez votre offre. Vendez-la.'}
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link href={ctaHref} className="btn-primary w-full justify-center px-6 py-3 sm:w-auto">
              {learning ? <Play className="h-4 w-4" /> : null}
              {ctaLabel}
              {learning ? null : <ArrowRight className="h-4 w-4" />}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="btn-secondary w-full justify-center px-6 py-3 sm:w-auto"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>

          {priceLabel ? (
            <p className="mt-4 text-xs text-zinc-500">
              {priceLabel} · accès à vie · éligible au programme revendeur
            </p>
          ) : null}
        </div>

        {/* Programme facts — real counts, never invented */}
        <div className="mx-auto mt-11 max-w-lg border-t border-white/[0.06] pt-8">
          <dl className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center">
            <Meta label="Modules" value={String(moduleCount)} />
            <span aria-hidden className="hidden h-8 w-px bg-white/[0.08] sm:block" />
            <Meta label="Leçons" value={String(lessonCount)} />
            <span aria-hidden className="hidden h-8 w-px bg-white/[0.08] sm:block" />
            <Meta label="À votre rythme" value="∞" />
          </dl>

          {learning && typeof progressPct === 'number' ? (
            <div className="mx-auto mt-8 max-w-sm">
              <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Progression</span>
                <span className="tabular-nums text-zinc-400">{progressPct}%</span>
              </div>
              <ProgressBar value={progressPct} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.08em] text-zinc-600">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tracking-tight text-zinc-200 tabular-nums">
        {value}
      </dd>
    </div>
  );
}
