import Link from 'next/link';
import {
  ArrowRight,
  Layers,
  GraduationCap,
  GitBranch,
  Users,
  Mail,
  Zap,
  BarChart3,
  Store,
  Bot,
  Sparkles,
  Shield,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { Logo } from '@/components/auth';
import { formatCents } from '@/lib/money';
import { academyPriceCents, proPriceCents } from '@/lib/config';

const FEATURES = [
  {
    icon: Layers,
    title: 'Pages & funnels',
    body: 'Drag-and-drop pages, complete funnels with step-by-step conversion tracking, A/B-ready structures.',
  },
  {
    icon: Store,
    title: 'Digital store',
    body: 'Sell products, courses and services with a built-in checkout, coupons and order management.',
  },
  {
    icon: GraduationCap,
    title: 'Courses & LMS',
    body: 'Modules, lessons, videos, quizzes, progress tracking and certificates — your own academy.',
  },
  {
    icon: Users,
    title: 'CRM',
    body: 'Contacts, leads, customers and students in one place with tags, segments and full activity history.',
  },
  {
    icon: Mail,
    title: 'Email marketing',
    body: 'Campaigns, sequences and a real outbox. Purchase and lifecycle automations out of the box.',
  },
  {
    icon: Zap,
    title: 'Automations',
    body: 'Visual workflow triggers: signup, purchase, course progress, subscription events — running 24/7.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    body: 'Revenue, conversions, page views, funnel performance — computed from your real data.',
  },
  {
    icon: Bot,
    title: 'Nuvra AI',
    body: 'Funnel builder, course planner, copywriter and analytics assistant, with plan-based credit quotas.',
  },
  {
    icon: Shield,
    title: 'Own your economics',
    body: 'Transparent platform fees, a real financial ledger and payouts you can audit at any time.',
  },
];

const FAQ = [
  {
    q: 'Is the Nuvra platform really free?',
    a: 'Yes. Creating an account, your dashboard, pages, funnels, products, courses, CRM and core tools is free — no credit card required. Nuvra earns when you earn: creators on the free plan pay a 10 % platform commission on sales of their own products.',
  },
  {
    q: 'What is Nuvra Academy?',
    a: 'Nuvra Academy is our flagship paid training program covering business design, offers, funnels, copywriting, acquisition, email, scaling and the Nuvra toolset. Purchasing it also opens the optional reseller program (90 % / 10 % split on attributed sales).',
  },
  {
    q: 'How does the reseller program work?',
    a: 'After buying Nuvra Academy and activating the program, you get a personal referral link, a reseller dashboard, tracking and payouts. Sales attributed to you are split 90 % to you, 10 % to Nuvra — displayed transparently, payment fees shown separately.',
  },
  {
    q: 'What does Nuvra Pro include?',
    a: 'Nuvra Pro removes the 10 % platform commission on your own sales (you keep 100 % before payment-processing fees), and adds custom domains, advanced analytics, higher AI quotas, A/B testing, team seats, API access and priority support.',
  },
  {
    q: 'Can I bring my own domain?',
    a: 'Yes — on Nuvra Pro you can connect a custom domain such as academy.yoursite.com. Free workspaces get a Nuvra subdomain.',
  },
  {
    q: 'Do you lock my data in?',
    a: 'No. Your customers, courses and content remain exportable. We believe retention should come from value, not hostages.',
  },
];

export default async function LandingPage() {
  const academyPrice = await academyPriceCents();
  const proPrice = await proPriceCents();

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <a href="#platform" className="hover:text-zinc-200">Platform</a>
            <a href="#academy" className="hover:text-zinc-200">Academy</a>
            <Link href="/pricing" className="hover:text-zinc-200">Pricing</Link>
            <a href="#faq" className="hover:text-zinc-200">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn-primary">Start for free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,81,245,0.18),transparent_70%)]" />
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-nuvra-500/30 bg-nuvra-500/10 px-3 py-1 text-xs font-medium text-nuvra-200">
            <Sparkles className="h-3.5 w-3.5" />
            The operating system for digital business
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">NUVRA</h1>
          <p className="mt-4 text-xl font-medium text-nuvra-300 md:text-2xl">
            Create. Sell. Teach. Scale.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-400 md:text-lg">
            One platform to build your online identity, launch pages and funnels, sell products,
            teach courses, manage customers and automate growth — without stitching ten tools
            together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/academy" className="btn-secondary px-6 py-3 text-base">
              Explore Nuvra Academy
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-600">
            Free forever plan · No credit card · {formatCents(proPrice)}/mo Pro when you outgrow it
          </p>
        </div>
      </section>

      {/* Platform features */}
      <section id="platform" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold text-zinc-100 md:text-3xl">
            Everything your digital activity needs — connected
          </h2>
          <p className="mt-3 text-zinc-500">
            Product → funnel → landing → lead → CRM → email → checkout → payment → enrollment → LMS
            → analytics → automation. One coherent system, not a stack of disconnected apps.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5 transition hover:border-nuvra-500/30">
              <f.icon className="mb-3 h-5 w-5 text-nuvra-400" />
              <h3 className="text-sm font-semibold text-zinc-100">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Business model transparency */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Free plan</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-100">Keep 90 %</div>
            <p className="mt-2 text-sm text-zinc-500">
              Use Nuvra free. When you sell your own course, the platform fee is 10 % — clearly
              displayed, never hidden.
            </p>
          </div>
          <div className="card border-nuvra-500/30 p-6 shadow-glow">
            <div className="text-xs font-semibold uppercase tracking-wide text-nuvra-400">Nuvra Pro</div>
            <div className="mt-2 text-3xl font-semibold text-white">Keep 100 %</div>
            <p className="mt-2 text-sm text-zinc-400">
              {formatCents(proPrice)}/month removes the platform commission on your own sales — you
              only keep what payment processing takes (shown separately).
            </p>
          </div>
          <div className="card p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Academy resellers</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-100">Keep 90 %</div>
            <p className="mt-2 text-sm text-zinc-500">
              Sell Nuvra Academy with your personal link. Attributed sales split 90 % to you,
              10 % to Nuvra — tracked in your reseller dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Academy */}
      <section id="academy" className="border-y border-white/[0.06] bg-ink-900/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
              <GraduationCap className="h-4 w-4" /> Nuvra Academy
            </div>
            <h2 className="text-2xl font-semibold text-zinc-100 md:text-3xl">
              The paid program to build and sell — with resale rights
            </h2>
            <p className="mt-4 text-zinc-400">
              15 modules: business design, offer, positioning, funnels, landing pages, copywriting,
              acquisition, email marketing, automations, course creation, sales, analytics, scaling,
              the reseller system and advanced Nuvra usage.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2"><InfinityIcon className="h-4 w-4 text-nuvra-400" /> Lifetime access to your learning space</li>
              <li className="flex gap-2"><GitBranch className="h-4 w-4 text-nuvra-400" /> Optional reseller program: 90 % / 10 %</li>
              <li className="flex gap-2"><BarChart3 className="h-4 w-4 text-nuvra-400" /> Reseller dashboard, tracking and payouts</li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/academy" className="btn-primary">
                Get Nuvra Academy — {formatCents(academyPrice)}
              </Link>
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-200">What you&apos;ll master</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              {[
                'Business digital', 'Offre & positionnement', 'Funnels', 'Landing pages',
                'Copywriting', 'Acquisition', 'Email marketing', 'Automations',
                'Création de formation', 'Vente', 'Analytics', 'Scaling',
                'Reseller system', 'Nuvra avancé', 'Lancement',
              ].map((m) => (
                <div key={m} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-2">
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-zinc-100">Simple, honest pricing</h2>
          <p className="mt-2 text-zinc-500">Start free. Upgrade only when it pays for itself.</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-300">Free</div>
            <div className="mt-1 text-3xl font-semibold text-white">$0</div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>· Full platform access</li>
              <li>· Pages, funnels, courses, CRM, automations</li>
              <li>· 10 % platform fee on your sales</li>
              <li>· {formatCents(academyPrice)} Academy (optional)</li>
            </ul>
            <Link href="/register" className="btn-secondary mt-6 w-full">Start for free</Link>
          </div>
          <div className="card border-nuvra-500/40 p-6 shadow-glow">
            <div className="text-sm font-semibold text-nuvra-300">Pro</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {formatCents(proPrice)}<span className="text-base font-normal text-zinc-500">/mo</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>· 0 % platform fee on your own sales</li>
              <li>· Custom domain & white-label touches</li>
              <li>· Advanced analytics, A/B testing, API</li>
              <li>· Higher AI quotas & priority support</li>
            </ul>
            <Link href="/register?plan=pro" className="btn-primary mt-6 w-full">Go Pro</Link>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/pricing" className="text-sm text-nuvra-400 hover:text-nuvra-300">
            Compare all plans →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-zinc-100">FAQ</h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="card group p-5">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-200 marker:hidden">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] bg-ink-900/60">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h2 className="text-2xl font-semibold text-zinc-100 md:text-3xl">
            Build the business. Nuvra runs the system.
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3">Start for free</Link>
            <Link href="/academy" className="btn-secondary px-6 py-3">Explore Nuvra Academy</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-zinc-600 md:flex-row">
          <Logo size="sm" />
          <div className="flex gap-5">
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/academy" className="hover:text-zinc-400">Academy</Link>
            <a href="#faq" className="hover:text-zinc-400">FAQ</a>
          </div>
          <div>© {new Date().getFullYear()} Nuvra. Create. Sell. Teach. Scale.</div>
        </div>
      </footer>
    </div>
  );
}
