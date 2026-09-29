import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { formatCents } from '@/lib/money';
import { getAllConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    'Tarifs Nuvra — une plateforme gratuite, un abonnement Pro en option et l’Académie en produit payant.',
};

const PLAN_MATRIX: { label: string; free: string; pro: string }[] = [
  { label: 'Pages, tunnels, formations, CRM', free: 'Inclus', pro: 'Inclus' },
  { label: 'Commission sur vos ventes', free: '10 %', pro: '0 %' },
  { label: 'Domaine personnalisé', free: '—', pro: '✓' },
  { label: 'Statistiques avancées', free: 'Essentielles', pro: 'Avancées' },
  { label: 'Crédits IA / mois', free: '20', pro: '200' },
  { label: 'Tests A/B', free: '—', pro: '✓' },
  { label: 'Membres d’équipe', free: '1', pro: 'Selon le plan' },
  { label: 'API & webhooks', free: '—', pro: '✓' },
  { label: 'Support prioritaire', free: '—', pro: '✓' },
  { label: 'Marque blanche', free: '—', pro: '✓' },
];

export default async function PricingPage() {
  const cfg = await getAllConfig();
  const proPrice = Number(cfg['pro.priceCents'] ?? 2900);
  const businessPrice = Number(cfg['business.priceCents'] ?? 9900);
  const academyPrice = Number(cfg['academy.priceCents'] ?? 19700);

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="glass-capsule sticky top-0 z-40 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <BrandLogo href="/" />
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">
              Connexion
            </Link>
            <Link href="/register" className="btn-primary">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-zinc-100">
            Des tarifs qui évoluent avec vous
          </h1>
          <p className="mt-3 text-zinc-500">
            La plateforme Nuvra est gratuite. Vous ne payez qu&apos;en
            choisissant Pro ou l&apos;Académie — et Nuvra prélève une part
            transparente sur vos ventes.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-300">Gratuit</div>
            <div className="mt-2 text-4xl font-semibold text-white">$0</div>
            <div className="text-xs text-zinc-600">pour toujours</div>
            <ul className="mt-6 space-y-2.5 text-sm text-zinc-400">
              {[
                'Accès complet à la plateforme',
                'Pages, tunnels, boutique',
                'Formations & LMS',
                'CRM & email',
                '10 % de commission sur vos ventes',
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-secondary mt-6 w-full">
              Commencer gratuitement
            </Link>
          </div>

          <div className="card card-hover relative border-nuvra-500/30 p-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-nuvra-600 px-3 py-0.5 text-[11px] font-semibold text-white">
              MOST POPULAR
            </div>
            <div className="text-sm font-semibold text-nuvra-300">
              Nuvra Pro
            </div>
            <div className="mt-2 text-4xl font-semibold text-white">
              {formatCents(proPrice)}
              <span className="text-base font-normal text-zinc-500">/mo</span>
            </div>
            <div className="text-xs text-zinc-600">sans engagement</div>
            <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
              {[
                '0 % de commission sur vos ventes',
                'Domaine personnalisé',
                'Statistiques avancées & tests A/B',
                '200 crédits IA / mois',
                'API, webhooks, support prioritaire',
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/billing" className="btn-primary mt-6 w-full">
              Passer en Pro
            </Link>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-300">Business</div>
            <div className="mt-2 text-4xl font-semibold text-white">
              {formatCents(businessPrice)}
              <span className="text-base font-normal text-zinc-500">/mo</span>
            </div>
            <div className="text-xs text-zinc-600">équipes & agences</div>
            <ul className="mt-6 space-y-2.5 text-sm text-zinc-400">
              {[
                'Tout ce qui est inclus dans Pro',
                '10+ sièges d’équipe',
                '1 000 crédits IA / mois',
                'Multi-espaces de travail',
                'Accompagnement dédié',
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/billing"
              className="btn-secondary mt-6 w-full"
            >
              Choisir Business
            </Link>
          </div>
        </div>

        {/* Comparison */}
        <div className="table-wrap mt-12">
          <table className="data">
            <thead>
              <tr>
                <th>Fonctionnalité</th>
                <th>Gratuit</th>
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
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="card p-6">
            <div className="text-sm font-semibold text-amber-300">
              Académie Nuvra
            </div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {formatCents(academyPrice)}
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Achat unique. 15 modules, accès à vie et éligibilité au programme
              revendeur (90 % / 10 % sur les ventes attribuées).
            </p>
            <Link href="/academy" className="btn-secondary mt-5 inline-flex">
              Découvrir l’Académie
            </Link>
          </div>
          <div className="card p-6">
            <div className="text-sm font-semibold text-zinc-300">
              Revendeur Académie Nuvra
            </div>
            <div className="mt-2 text-3xl font-semibold text-white">
              90 / 10
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Vous conservez 90 % de chaque vente de l’Académie attribuée à
              votre lien. Nuvra en garde 10 %. Les frais de paiement sont
              toujours affichés séparément.
            </p>
            <Link
              href="/academy#reseller"
              className="btn-secondary mt-5 inline-flex"
            >
              Détails du revendeur
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
