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
import { BrandLogo } from '@/components/BrandLogo';
import { LiquidGlassHeader } from '@/components/LiquidGlassHeader';
import { formatCents } from '@/lib/money';
import { academyPriceCents, proPriceCents } from '@/lib/config';

const FEATURES = [
  {
    icon: Layers,
    title: 'Pages & tunnels',
    body: 'Pages et tunnels à assembler par glisser-déposer, avec suivi des conversions étape par étape.',
  },
  {
    icon: Store,
    title: 'Boutique digitale',
    body: 'Produits, services et formations avec un checkout intégré.',
  },
  {
    icon: GraduationCap,
    title: 'Formations & LMS',
    body: 'Modules, leçons, quiz, progression et certificats.',
  },
  {
    icon: Users,
    title: 'CRM',
    body: 'Contacts, prospects et élèves au même endroit, avec tout l’historique.',
  },
  {
    icon: Mail,
    title: 'Email marketing',
    body: 'Campagnes, séquences et boîte d’envoi réelle, prêtes à partir.',
  },
  {
    icon: Zap,
    title: 'Automatisations',
    body: 'Déclencheurs sur inscription, achat et progression — actifs 24 h/24.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques',
    body: 'Chiffre d’affaires, conversions et performance des tunnels, sur vos vraies données.',
  },
  {
    icon: Bot,
    title: 'Nuvra AI',
    body: 'Générateur de tunnels, planificateur de formation, rédacteur et assistant d’analyse.',
  },
  {
    icon: Shield,
    title: 'Maîtrisez vos finances',
    body: 'Un vrai grand livre, des frais transparents et des versements vérifiables.',
  },
];

const FAQ = [
  {
    q: 'La plateforme Nuvra est-elle vraiment gratuite ?',
    a: 'Oui. Compte, tableau de bord, pages, tunnels, produits, formations et CRM sont gratuits — sans carte bancaire. En gratuit, Nuvra prend 10 % de commission sur vos propres ventes ; Pro la supprime.',
  },
  {
    q: 'Qu’est-ce que l’Académie Nuvra ?',
    a: 'Le programme payant de référence : business design, offre, tunnels, copywriting, acquisition, email et passage à l’échelle. L’achat ouvre aussi le programme revendeur, en option.',
  },
  {
    q: 'Comment fonctionne le programme revendeur ?',
    a: 'Vous recevez un lien personnel et un tableau de bord revendeur. Les ventes attribuées se partagent 90 % pour vous, 10 % pour Nuvra — frais de paiement affichés séparément.',
  },
  {
    q: 'Que comprend Nuvra Pro ?',
    a: 'Pro supprime les 10 % de commission sur vos propres ventes et ajoute le domaine personnalisé, les statistiques avancées, plus de crédits IA et l’accès API.',
  },
  {
    q: 'Puis-je utiliser mon propre domaine ?',
    a: 'Oui — en Pro, connectez academie.monsite.com. Les espaces gratuits reçoivent un sous-domaine Nuvra.',
  },
  {
    q: 'Mes données sont-elles bloquées chez vous ?',
    a: 'Non. Vos contacts, formations et contenus restent exportables — la fidélité doit venir de la valeur, pas de la contrainte.',
  },
];

export default async function LandingPage() {
  const academyPrice = await academyPriceCents();
  const proPrice = await proPriceCents();

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Nav — floating liquid-glass capsule */}
      <LiquidGlassHeader
        items={[
          { href: '#platform', label: 'Plateforme' },
          { href: '#academy', label: 'Académie' },
          { href: '/pricing', label: 'Tarifs' },
          { href: '#faq', label: 'FAQ' },
        ]}
      >
        <Link href="/login" className="btn-ghost hidden text-sm sm:inline-flex">
          Connexion
        </Link>
        <Link href="/register" className="btn-primary !py-2 text-sm">
          Commencer gratuitement
        </Link>
      </LiquidGlassHeader>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,81,245,0.18),transparent_70%)]" />
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-nuvra-500/30 bg-nuvra-500/10 px-3 py-1 text-xs font-medium text-nuvra-200">
            <Sparkles className="h-3.5 w-3.5" />
            Le système d’exploitation de votre activité digitale
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
            NUVRA
          </h1>
          <p className="mt-4 text-xl font-medium text-nuvra-300 md:text-2xl">
            Créez. Vendez. Enseignez. Développez.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-400 md:text-lg">
            Lancez vos pages et vos tunnels, vendez vos produits, enseignez et
            automatisez votre croissance — sans brancher dix outils entre eux.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/academy" className="btn-secondary px-6 py-3 text-base">
              Découvrir l’Académie Nuvra
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-600">
            Plan gratuit à vie · Sans carte bancaire · {formatCents(proPrice)}
            /mois en Pro quand vous en avez besoin
          </p>
        </div>
      </section>

      {/* Platform features */}
      <section id="platform" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-100 md:text-3xl">
            Tout ce dont votre activité a besoin — connecté
          </h2>
          <p className="page-subtitle text-base">
            Produit, tunnel, prospect, paiement, inscription, statistiques : un
            seul système au lieu de dix outils.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card p-5 transition hover:border-nuvra-500/30"
            >
              <f.icon className="mb-3 h-5 w-5 text-nuvra-400" />
              <h3 className="text-sm font-semibold text-zinc-100">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Business model transparency */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <div className="eyebrow">Plan gratuit</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-100">
              Vous gardez 90 %
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Utilisez Nuvra gratuitement. La plateforme ne prend 10 % que
              lorsque vous vendez — jamais caché.
            </p>
          </div>
          <div className="card card-hover border-nuvra-500/25 p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-nuvra-400">
              Nuvra Pro
            </div>
            <div className="mt-2 text-3xl font-semibold text-white">
              Vous gardez 100 %
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {formatCents(proPrice)}/mois supprime la commission plateforme.
              Les frais de paiement restent séparés.
            </p>
          </div>
          <div className="card p-6">
            <div className="eyebrow">Revendeurs Académie</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-100">
              Vous gardez 90 %
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Vendez l’Académie avec votre lien : 90 % pour vous, 10 % pour
              Nuvra.
            </p>
          </div>
        </div>
      </section>

      {/* Academy */}
      <section
        id="academy"
        className="border-y border-white/[0.06] bg-ink-900/60"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
              <GraduationCap className="h-4 w-4" /> Académie Nuvra
            </div>
            <h2 className="text-2xl font-semibold text-zinc-100 md:text-3xl">
              Le programme payant pour construire et vendre — avec droits de
              revente
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-zinc-400">
              15 modules, du business design au passage à l’échelle — avec le
              programme revendeur en option.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <InfinityIcon className="h-4 w-4 text-nuvra-400" /> Accès à vie
                à votre espace d’apprentissage
              </li>
              <li className="flex gap-2">
                <GitBranch className="h-4 w-4 text-nuvra-400" /> Programme
                revendeur en option : 90 % / 10 %
              </li>
              <li className="flex gap-2">
                <BarChart3 className="h-4 w-4 text-nuvra-400" /> Tableau de bord
                revendeur, suivi et versements
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/academy" className="btn-primary">
                Obtenir l’Académie Nuvra — {formatCents(academyPrice)}
              </Link>
            </div>
          </div>
          <div className="card p-6">
            <div className="section-title">Ce que vous allez maîtriser</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              {[
                'Business digital',
                'Offre & positionnement',
                'Tunnels',
                'Pages de vente',
                'Copywriting',
                'Acquisition',
                'Email marketing',
                'Automatisations',
                'Création de formation',
                'Vente',
                'Statistiques',
                'Passage à l’échelle',
                'Système revendeur',
                'Nuvra avancé',
                'Lancement',
              ].map((m) => (
                <div
                  key={m}
                  className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-2"
                >
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
          <h2 className="text-2xl font-semibold text-zinc-100">
            Des tarifs simples et honnêtes
          </h2>
          <p className="mt-2 text-zinc-500">
            Commencez gratuitement. Passez au payant quand c’est rentable.
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-300">Gratuit</div>
            <div className="mt-1 text-3xl font-semibold text-white">$0</div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>· Accès complet à la plateforme</li>
              <li>· Pages, tunnels, formations, CRM, automatisations</li>
              <li>· 10 % de commission sur vos ventes</li>
              <li>· Académie à {formatCents(academyPrice)} (option)</li>
            </ul>
            <Link href="/register" className="btn-secondary mt-6 w-full">
              Commencer gratuitement
            </Link>
          </div>
          <div className="card card-hover border-nuvra-500/30 p-6">
            <div className="text-sm font-semibold text-nuvra-300">Pro</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {formatCents(proPrice)}
              <span className="text-base font-normal text-zinc-500">/mois</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>· 0 % de commission sur vos ventes</li>
              <li>· Domaine personnalisé & marque blanche</li>
              <li>· Statistiques avancées, tests A/B, API</li>
              <li>· Plus de crédits IA & support prioritaire</li>
            </ul>
            <Link href="/register?plan=pro" className="btn-primary mt-6 w-full">
              Passer en Pro
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="text-sm text-nuvra-400 hover:text-nuvra-300"
          >
            Comparer tous les plans →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-zinc-100">
          FAQ
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="card group p-5">
              <summary className="cursor-pointer list-none section-title marker:hidden">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] bg-ink-900/60">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h2 className="text-2xl font-semibold text-zinc-100 md:text-3xl">
            Construisez votre activité. Nuvra s’occupe du système.
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3">
              Commencer gratuitement
            </Link>
            <Link href="/academy" className="btn-secondary px-6 py-3">
              Découvrir l’Académie Nuvra
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-zinc-600 md:flex-row">
          <BrandLogo size="sm" />
          <div className="flex gap-5">
            <Link href="/pricing" className="hover:text-zinc-400">
              Tarifs
            </Link>
            <Link href="/academy" className="hover:text-zinc-400">
              Académie
            </Link>
            <a href="#faq" className="hover:text-zinc-400">
              FAQ
            </a>
          </div>
          <div>
            © {new Date().getFullYear()} Nuvra. Créez. Vendez. Enseignez.
            Développez.
          </div>
        </div>
      </footer>
    </div>
  );
}
