'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Block } from './blocks';

export { parseBlocks } from './blocks';
export type { Block } from './blocks';

/**
 * Public renderer for page blocks — used on live pages and in the builder
 * preview. Every block type in constants.BLOCK_TYPES is handled; unknown
 * types render nothing rather than crashing.
 */
export function PageRenderer({
  blocks,
  workspaceId,
  basePath,
  isPreview = false,
  onBuy,
}: {
  blocks: Block[];
  workspaceId?: string;
  basePath?: string;
  isPreview?: boolean;
  onBuy?: (kind: string, id: string) => void;
}) {
  return (
    <div className="space-y-0">
      {blocks.map((b, i) => (
        <BlockView
          key={b.id ?? i}
          block={b}
          workspaceId={workspaceId}
          basePath={basePath}
          isPreview={isPreview}
          onBuy={onBuy}
        />
      ))}
    </div>
  );
}

function BlockView({
  block,
  workspaceId,
  basePath,
  isPreview,
  onBuy,
}: {
  block: Block;
  workspaceId?: string;
  basePath?: string;
  isPreview?: boolean;
  onBuy?: (kind: string, id: string) => void;
}) {
  const d = block.data ?? {};
  const align =
    d.align === 'left'
      ? 'text-left items-start'
      : d.align === 'right'
        ? 'text-right items-end'
        : 'text-center items-center';

  switch (block.type) {
    case 'hero':
      return (
        <section className={cn('flex flex-col px-6 py-20 md:py-28', align)}>
          <h1
            className={cn(
              'max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl',
              d.align === 'center' && 'mx-auto',
            )}
          >
            {d.heading}
          </h1>
          {d.subheading ? (
            <p
              className={cn(
                'mt-4 max-w-2xl text-lg text-zinc-400',
                d.align === 'center' && 'mx-auto',
              )}
            >
              {d.subheading}
            </p>
          ) : null}
          {d.ctaLabel ? (
            <CtaLink
              href={d.ctaHref || '#'}
              label={d.ctaLabel}
              className="mt-8"
            />
          ) : null}
        </section>
      );

    case 'text':
      return (
        <section
          className={cn(
            'px-6 py-12',
            d.align === 'center'
              ? 'mx-auto max-w-3xl text-center'
              : 'max-w-3xl',
          )}
        >
          {d.heading ? (
            <h2 className="mb-3 text-2xl font-semibold text-white">
              {d.heading}
            </h2>
          ) : null}
          <div className="whitespace-pre-wrap leading-relaxed text-zinc-400">
            {d.body}
          </div>
        </section>
      );

    case 'image':
      return (
        <section className="px-6 py-8">
          {d.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.src}
              alt={d.alt || ''}
              className={cn(
                'mx-auto max-h-[480px] w-full max-w-3xl object-cover',
                d.rounded !== false && 'rounded-xl',
              )}
            />
          ) : (
            <div className="mx-auto flex h-48 max-w-3xl items-center justify-center rounded-xl border border-dashed border-white/15 text-sm text-zinc-600">
              Image block — set a source
            </div>
          )}
        </section>
      );

    case 'video':
      return (
        <section className="px-6 py-8">
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-900 px-4 py-10 text-sm text-zinc-500">
            <Play className="h-4 w-4 text-nuvra-400" />
            {d.url ? (
              <a href={d.url} className="hover:text-zinc-300">
                {d.title || d.url}
              </a>
            ) : (
              'Bloc vidéo — renseignez une URL'
            )}
          </div>
        </section>
      );

    case 'cta':
      return (
        <section className="flex justify-center px-6 py-10">
          <CtaLink
            href={d.href || '#'}
            label={d.label || 'Commencer'}
            variant={d.variant === 'secondary' ? 'secondary' : 'primary'}
          />
        </section>
      );

    case 'form':
      return (
        <LeadForm
          title={d.title}
          buttonLabel={d.buttonLabel}
          workspaceId={workspaceId}
          basePath={basePath}
        />
      );

    case 'pricing':
      return (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Array.isArray(d.plans) ? d.plans : []).map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-ink-900 p-6"
              >
                <div className="text-sm font-semibold text-zinc-300">
                  {p.name}
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {p.price}
                </div>
                <div className="mt-3 whitespace-pre-line text-sm text-zinc-500">
                  {p.features}
                </div>
                {p.cta ? (
                  <CtaLink
                    href={p.href || '#'}
                    label={p.cta}
                    className="mt-6 w-full justify-center"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      );

    case 'testimonials':
      return (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {(Array.isArray(d.items) ? d.items : []).map((t, i) => (
              <figure
                key={i}
                className="rounded-xl border border-white/10 bg-ink-900 p-5"
              >
                <blockquote className="text-sm leading-relaxed text-zinc-300">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-3 text-xs text-zinc-500">
                  {t.author}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      );

    case 'faq':
      return (
        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="space-y-3">
            {(Array.isArray(d.items) ? d.items : []).map((f, i) => (
              <details
                key={i}
                className="rounded-xl border border-white/10 bg-ink-900 p-5"
              >
                <summary className="cursor-pointer section-title">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-zinc-500">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      );

    case 'features':
      return (
        <section className="mx-auto max-w-5xl px-6 py-12">
          {d.title ? (
            <h2 className="mb-6 text-center text-2xl font-semibold text-white">
              {d.title}
            </h2>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Array.isArray(d.items) ? d.items : []).map((f, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-ink-900 p-5"
              >
                <div className="section-title">{f.title}</div>
                <div className="mt-1.5 text-sm text-zinc-500">{f.body}</div>
              </div>
            ))}
          </div>
        </section>
      );

    case 'countdown':
      return (
        <Countdown
          days={Number(d.untilDays) || 7}
          label={d.label || 'L’offre se termine dans'}
        />
      );

    case 'product':
    case 'course':
    case 'checkout':
      return (
        <BuySection
          kind={
            block.type === 'course'
              ? 'course'
              : block.type === 'checkout'
                ? 'checkout'
                : 'product'
          }
          id={block.type === 'course' ? d.courseId : d.productId || d.courseId}
          label={d.ctaLabel || 'Acheter'}
          onBuy={onBuy}
          isPreview={isPreview}
        />
      );

    case 'social_proof':
      return (
        <section className="px-6 py-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            {d.label}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {(Array.isArray(d.items) ? d.items : []).map(
              (s: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-400"
                >
                  {s}
                </span>
              ),
            )}
          </div>
        </section>
      );

    case 'logos':
      return (
        <section className="flex flex-wrap items-center justify-center gap-6 px-6 py-8 opacity-60">
          {(Array.isArray(d.items) ? d.items : []).map(
            (l: string, i: number) => (
              <span
                key={i}
                className="text-sm font-semibold tracking-wide text-zinc-500"
              >
                {l}
              </span>
            ),
          )}
        </section>
      );

    case 'divider':
      return <div className="mx-auto my-2 h-px max-w-5xl bg-white/[0.08]" />;

    case 'spacer':
      return <div style={{ height: Number(d.size) || 32 }} />;

    case 'link':
      return (
        <a
          href={d.href || '#'}
          className="mx-6 mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-ink-900 px-5 py-3.5 text-sm font-medium text-zinc-200 transition hover:border-nuvra-500/40"
          rel="nofollow"
        >
          {d.label}
          <ChevronRight className="h-4 w-4 text-zinc-600" />
        </a>
      );

    default:
      return null;
  }
}

function CtaLink({
  href,
  label,
  variant = 'primary',
  className,
}: {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  const isInternal = href.startsWith('/');
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  if (isInternal) {
    return (
      <Link href={href} className={cn(cls, 'px-6 py-3', className)}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={cn(cls, 'px-6 py-3', className)}
      target="_blank"
      rel="noopener"
    >
      {label}
    </a>
  );
}

function LeadForm({
  title,
  buttonLabel,
  workspaceId,
  basePath,
}: {
  title?: string;
  buttonLabel?: string;
  workspaceId?: string;
  basePath?: string;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          pagePath: basePath,
          email: form.get('email'),
          name: form.get('name'),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue');
        return;
      }
      setDone(true);
    } catch {
      setError('Erreur réseau');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="mx-auto max-w-xl px-6 py-10 text-center">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
          ✓ C&apos;est fait. Merci pour votre inscription.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-10">
      <form
        onSubmit={submit}
        className="rounded-xl border border-white/10 bg-ink-900 p-6"
      >
        <h3 className="text-lg font-semibold text-white">
          {title || 'Rejoignez la liste'}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Nom" className="input" />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="input"
          />
        </div>
        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
        <button className="btn-primary mt-3 w-full" disabled={busy}>
          {busy ? 'Envoi…' : buttonLabel || 'S’inscrire'}
        </button>
        <p className="mt-2 text-center text-[10px] text-zinc-600">
          Aucun spam. Désinscription en un clic.
        </p>
      </form>
    </section>
  );
}

function BuySection({
  kind,
  id,
  label,
  onBuy,
  isPreview,
}: {
  kind: string;
  id?: string;
  label: string;
  onBuy?: (kind: string, id: string) => void;
  isPreview?: boolean;
}) {
  return (
    <section className="flex justify-center px-6 py-8">
      <button
        type="button"
        onClick={() => id && onBuy?.(kind, id)}
        disabled={!id || isPreview}
        className="btn-primary px-6 py-3 disabled:opacity-40"
        title={
          !id
            ? 'Sélectionnez un produit ou une formation dans l’inspecteur'
            : undefined
        }
      >
        {label}
      </button>
    </section>
  );
}

/**
 * Countdown block — counts down the next `days` days, live.
 *
 * Server and client both start from the same relative duration, so the first
 * paint is identical (no hydration mismatch); a 1 s interval then updates it.
 */
function Countdown({ days, label }: { days: number; label: string }) {
  const totalMs = Math.max(0, Math.floor(days)) * 86400000;
  const [remaining, setRemaining] = useState(totalMs);

  useEffect(() => {
    const target = Date.now() + totalMs;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [totalMs]);

  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <section className="px-6 py-8 text-center">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
        {label}
      </div>
      <div className="mt-2 flex justify-center gap-3" data-nv-countdown>
        {[
          [d, 'days'],
          [h, 'hrs'],
          [m, 'min'],
          [s, 'sec'],
        ].map(([v, l]) => (
          <div
            key={l as string}
            className="rounded-lg border border-white/10 bg-ink-900 px-4 py-2.5"
          >
            <div className="text-2xl font-semibold tabular-nums text-white">
              {String(v).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase text-zinc-600">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
