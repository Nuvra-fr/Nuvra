import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Logo } from '@/components/auth';
import { formatCents } from '@/lib/money';
import { getAllConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Nuvra pricing — a free platform, an optional Pro subscription and the paid Academy.',
};

const PLAN_MATRIX: { label: string; free: string; pro: string }[] = [
  { label: 'Pages, funnels, courses, CRM', free: 'Included', pro: 'Included' },
  { label: 'Platform fee on your sales', free: '10 %', pro: '0 %' },
  { label: 'Custom domain', free: '—', pro: '✓' },
  { label: 'Advanced analytics', free: 'Core', pro: 'Advanced' },
  { label: 'AI credits / month', free: '20', pro: '200' },
  { label: 'A/B testing', free: '—', pro: '✓' },
  { label: 'Team members', free: '1', pro: 'Per plan' },
  { label: 'API & webhooks', free: '—', pro: '✓' },
  { label: 'Priority support', free: '—', pro: '✓' },
  { label: 'White-label touches', free: '—', pro: '✓' },
];

export default async function PricingPage() {
  const cfg = getAllConfig();
  const proPrice = Number(cfg['pro.priceCents'] ?? 2900);
  const businessPrice = Number(cfg['business.priceCents'] ?? 9900);
  const academyPrice = Number(cfg['academy.priceCents'] ?? 19700);

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/register" className="btn-primary">Start for free</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-zinc-100">Pricing that grows with you</h1>
          <p className="mt-3 text-zinc-500">
            The Nuvra platform is free. You pay only when you choose Pro or Academy — and Nuvra
            earns a transparent share when you sell.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-300">Free</div>
            <div className="mt-2 text-4xl font-semibold text-white">$0</div>
            <div className="text-xs text-zinc-600">forever</div>
            <ul className="mt-5 space-y-2.5 text-sm text-zinc-400">
              {['Full platform access', 'Pages, funnels, store', 'Courses & LMS', 'CRM & email', '10 % platform fee on sales'].map((f) => (
                <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />{f}</li>
              ))}
            </ul>
            <Link href="/register" className="btn-secondary mt-6 w-full">Start for free</Link>
          </div>

          <div className="card relative border-nuvra-500/40 p-6 shadow-glow">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-nuvra-600 px-3 py-0.5 text-[11px] font-semibold text-white">
              MOST POPULAR
            </div>
            <div className="text-sm font-semibold text-nuvra-300">Nuvra Pro</div>
            <div className="mt-2 text-4xl font-semibold text-white">
              {formatCents(proPrice)}
              <span className="text-base font-normal text-zinc-500">/mo</span>
            </div>
            <div className="text-xs text-zinc-600">cancel anytime</div>
            <ul className="mt-5 space-y-2.5 text-sm text-zinc-300">
              {['0 % platform fee on your sales', 'Custom domain', 'Advanced analytics & A/B tests', '200 AI credits / month', 'API, webhooks, priority support'].map((f) => (
                <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />{f}</li>
              ))}
            </ul>
            <Link href="/dashboard/billing" className="btn-primary mt-6 w-full">Upgrade to Pro</Link>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-300">Business</div>
            <div className="mt-2 text-4xl font-semibold text-white">
              {formatCents(businessPrice)}
              <span className="text-base font-normal text-zinc-500">/mo</span>
            </div>
            <div className="text-xs text-zinc-600">teams & agencies</div>
            <ul className="mt-5 space-y-2.5 text-sm text-zinc-400">
              {['Everything in Pro', '10+ team seats', '1,000 AI credits / month', 'Multi-workspace ready', 'Dedicated onboarding'].map((f) => (
                <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />{f}</li>
              ))}
            </ul>
            <Link href="/dashboard/billing" className="btn-secondary mt-6 w-full">Choose Business</Link>
          </div>
        </div>

        {/* Comparison */}
        <div className="table-wrap mt-12">
          <table className="data">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_MATRIX.map((row) => (
                <tr key={row.label}>
                  <td className="text-zinc-300">{row.label}</td>
                  <td>{row.free}</td>
                  <td className="text-nuvra-200">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Academy */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="card p-6">
            <div className="text-sm font-semibold text-amber-300">Nuvra Academy</div>
            <div className="mt-2 text-3xl font-semibold text-white">{formatCents(academyPrice)}</div>
            <p className="mt-2 text-sm text-zinc-500">
              One-time purchase. 15 modules, lifetime learning access and eligibility for the
              reseller program (90 % / 10 % on attributed sales).
            </p>
            <Link href="/academy" className="btn-secondary mt-5 inline-flex">Explore Academy</Link>
          </div>
          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-300">Nuvra Academy Reseller</div>
            <div className="mt-2 text-3xl font-semibold text-white">90 / 10</div>
            <p className="mt-2 text-sm text-zinc-500">
              You keep 90 % of every Academy sale attributed to your link. Nuvra keeps 10 %.
              Payment-processing fees are always shown separately.
            </p>
            <Link href="/academy#reseller" className="btn-secondary mt-5 inline-flex">Reseller details</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
