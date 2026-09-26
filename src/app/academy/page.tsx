import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, Check, TrendingUp, LayoutDashboard, Link2 } from 'lucide-react';
import { Logo } from '@/components/auth';
import { Badge } from '@/components/ui';
import { formatCents } from '@/lib/money';
import { academyPriceCents, getAllConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Nuvra Academy',
  description:
    'The paid Nuvra program to build, sell and scale a digital business — with an optional 90/10 reseller program.',
};

const MODULES = [
  ['01', 'Business digital', 'Modèle, positioning et économie d’une activité digitale.'],
  ['02', 'Offre', 'Construire une offre irrésistible et légitime.'],
  ['03', 'Positionnement', 'Se différencer sans bruit inutile.'],
  ['04', 'Funnel', 'Architecturer le parcours jusqu’à l’achat.'],
  ['05', 'Landing pages', 'Pages qui convertissent, structure par structure.'],
  ['06', 'Copywriting', 'Les mots qui font agir (sans manipulation).'],
  ['07', 'Acquisition', 'Channels, budget, mesure.'],
  ['08', 'Email marketing', 'Listes, séquences, fidélisation.'],
  ['09', 'Automations', 'Le travail qui continue pendant que vous dormez.'],
  ['10', 'Création de formation', 'Structurer, filmer, livrer un LMS qui donne des résultats.'],
  ['11', 'Vente', 'Checkout, objections, closing éthique.'],
  ['12', 'Analytics', 'Lire ses chiffres et décider.'],
  ['13', 'Scaling', 'Passer à l’échelle sans casser l’offre.'],
  ['14', 'Reseller system', 'Vendre Nuvra Academy avec votre lien (90/10).'],
  ['15', 'Nuvra avancé', 'Tirer le maximum de la plateforme.'],
];

export default async function AcademyPage() {
  const price = await academyPriceCents();
  const cfg = await getAllConfig();
  const bps = Number(cfg['commission.resellerBps'] ?? 9000);
  const resellerPct = bps / 100;
  const nuvraPct = 100 - resellerPct;
  const exampleSale = 19700;

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="btn-ghost">Pricing</Link>
            <Link href="/register" className="btn-primary">Start for free</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-16 md:grid-cols-2 md:items-center">
          <div>
            <Badge tone="amber" className="mb-4">
              <GraduationCap className="h-3.5 w-3.5" /> Paid product
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Nuvra Academy
            </h1>
            <p className="mt-4 text-lg text-zinc-400">
              The complete program to design, launch and scale a digital business — and optionally
              resell it with a 90/10 split.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
              {[
                '15 modules with objectives, lessons, resources and quizzes',
                'Your personal learning space with progress tracking',
                'Certificate on completion',
                'Eligibility for the Nuvra Academy Reseller program',
                'Lifetime access to the program you purchase',
              ].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/checkout?item=academy" className="btn-primary px-6 py-3 text-base">
                Buy Nuvra Academy — {formatCents(price)}
              </Link>
              <span className="text-xs text-zinc-600">
                The Nuvra <strong className="text-zinc-400">platform</strong> stays free — Academy is
                a separate product.
              </span>
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">Curriculum</span>
              <Badge tone="blue">15 modules</Badge>
            </div>
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {MODULES.map(([n, title, desc]) => (
                <div key={n} className="flex gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
                  <span className="text-xs font-semibold text-nuvra-400">{n}</span>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{title}</div>
                    <div className="text-xs text-zinc-500">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reseller */}
        <section id="reseller" className="border-y border-white/[0.06] bg-ink-900/60">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-semibold text-zinc-100">Nuvra Academy Reseller</h2>
              <p className="mt-3 text-zinc-500">
                After purchasing Academy, activate the reseller program (subject to the conditions
                defined by Nuvra administration). You receive a personal sales link, tracking,
                statistics, marketing assets and payouts.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="card p-6">
                <Link2 className="mb-3 h-5 w-5 text-nuvra-400" />
                <div className="text-sm font-semibold text-zinc-200">Your link</div>
                <p className="mt-1.5 text-sm text-zinc-500">
                  A personal referral URL with click tracking and attribution on every sale.
                </p>
              </div>
              <div className="card p-6">
                <TrendingUp className="mb-3 h-5 w-5 text-emerald-400" />
                <div className="text-sm font-semibold text-zinc-200">
                  {resellerPct} % for you, {nuvraPct} % for Nuvra
                </div>
                <p className="mt-1.5 text-sm text-zinc-500">
                  Example: a {formatCents(exampleSale)} sale →{' '}
                  <strong className="text-emerald-300">{formatCents(Math.floor((exampleSale * bps) / 10000))} for you</strong>,{' '}
                  {formatCents(exampleSale - Math.floor((exampleSale * bps) / 10000))} for Nuvra.
                  Payment fees shown separately.
                </p>
              </div>
              <div className="card p-6">
                <LayoutDashboard className="mb-3 h-5 w-5 text-amber-400" />
                <div className="text-sm font-semibold text-zinc-200">Reseller dashboard</div>
                <p className="mt-1.5 text-sm text-zinc-500">
                  Revenue, sales, commissions, clicks, conversions and payout status — updated
                  automatically.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Link href={`/checkout?item=academy`} className="btn-primary px-6 py-3">
                Get Academy & become eligible — {formatCents(price)}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-14 text-center">
          <h2 className="text-xl font-semibold text-zinc-100">Two different things, clearly separated</h2>
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Nuvra Platform</div>
              <div className="mt-1 text-lg font-semibold text-zinc-100">Free</div>
              <p className="mt-1.5 text-sm text-zinc-500">
                Dashboard, pages, funnels, CRM, courses, LMS, automations, analytics.
              </p>
            </div>
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-400">Nuvra Academy</div>
              <div className="mt-1 text-lg font-semibold text-zinc-100">{formatCents(price)} — paid</div>
              <p className="mt-1.5 text-sm text-zinc-500">
                The full training program and resale eligibility. A distinct commercial product.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
