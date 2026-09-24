import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, CreditCard, Rocket, Shield, Zap, Mail } from 'lucide-react';
import { PageHeader, Card, InlineAlert } from '@/components/ui';
import { paymentsMode } from '@/lib/stripe';
import { emailProvider } from '@/lib/email';

export const metadata: Metadata = { title: 'Help' };

const GUIDES = [
  {
    icon: Rocket,
    title: 'Launch in 30 minutes',
    body: 'Create a product → build a landing page with a Form and Checkout block → publish → share the link.',
    href: '/dashboard/pages?new=1',
    cta: 'Build a page',
  },
  {
    icon: BookOpen,
    title: 'Sell your first course',
    body: 'Courses → New course → add modules and lessons → publish → it appears in your store and marketplace.',
    href: '/dashboard/courses?new=1',
    cta: 'New course',
  },
  {
    icon: Zap,
    title: 'Automate follow-ups',
    body: 'Automations → new → trigger lead.created → action send_email. Fires on real events, 24/7.',
    href: '/dashboard/automations',
    cta: 'Create automation',
  },
  {
    icon: CreditCard,
    title: 'Understand your money',
    body: 'Payments → Financial ledger: every split, fee and reversal is an append-only entry you can audit.',
    href: '/dashboard/payments?tab=ledger',
    cta: 'Open ledger',
  },
  {
    icon: Shield,
    title: 'Go Pro, keep 100 %',
    body: 'Pro removes the 10 % platform commission on your own sales and adds domains, analytics and API.',
    href: '/dashboard/settings/billing',
    cta: 'See billing',
  },
  {
    icon: Mail,
    title: 'Email delivery',
    body: 'Without a provider, every email lands in the Outbox (Admin → Emails) — connect Resend to deliver for real.',
    href: '/dashboard/emails?tab=outbox',
    cta: 'Open outbox',
  },
];

export default async function HelpPage() {
  const mode = paymentsMode();
  const email = emailProvider();

  return (
    <div>
      <PageHeader title="Help" description="How Nuvra works — and what's connected right now." />

      <div className="mb-5">
        <InlineAlert tone="info">
          <strong>Environment status:</strong> Payments ={' '}
          <strong>{mode === 'stripe' ? 'Stripe live' : 'TEST MODE (no STRIPE_SECRET_KEY)'}</strong> ·
          Email = <strong>{email === 'RESEND' ? 'Resend live' : 'Outbox (no RESEND_API_KEY)'}</strong>.
          See <code>.env.example</code> for every variable Nuvra reads.
        </InlineAlert>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g) => (
          <Link key={g.title} href={g.href} className="card p-5 transition hover:border-nuvra-500/40">
            <g.icon className="mb-3 h-5 w-5 text-nuvra-400" />
            <div className="text-sm font-semibold text-zinc-200">{g.title}</div>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{g.body}</p>
            <span className="mt-3 inline-block text-xs font-medium text-nuvra-400">{g.cta} →</span>
          </Link>
        ))}
      </div>

      <Card padded className="mt-6">
        <div className="text-sm font-semibold text-zinc-200">The Nuvra business model, in plain words</div>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-white/[0.07] p-4 text-zinc-400">
            <div className="font-semibold text-zinc-200">Platform = free</div>
            Pages, funnels, CRM, courses, LMS, automations, analytics.
          </div>
          <div className="rounded-lg border border-white/[0.07] p-4 text-zinc-400">
            <div className="font-semibold text-zinc-200">Academy = paid</div>
            The 15-module program + optional reseller (90/10).
          </div>
          <div className="rounded-lg border border-nuvra-500/30 bg-nuvra-500/[0.05] p-4 text-zinc-400">
            <div className="font-semibold text-nuvra-200">Pro = subscription</div>
            0 % commission on your sales + advanced tools.
          </div>
        </div>
      </Card>
    </div>
  );
}
