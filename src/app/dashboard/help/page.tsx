import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, CreditCard, Rocket, Shield, Zap, Mail } from 'lucide-react';
import { PageHeader, Card, InlineAlert } from '@/components/ui';
import { paymentsMode } from '@/lib/stripe';
import { emailProvider } from '@/lib/email';

export const metadata: Metadata = { title: 'Aide' };

const GUIDES = [
  {
    icon: Rocket,
    title: 'Lancez-vous en 30 minutes',
    body: 'Créez un produit → construisez une page de vente avec un bloc Formulaire et un bloc Paiement → publiez → partagez le lien.',
    href: '/dashboard/pages?new=1',
    cta: 'Créer une page',
  },
  {
    icon: BookOpen,
    title: 'Vendez votre première formation',
    body: 'Formations → Nouvelle formation → ajoutez modules et leçons → publiez → elle apparaît dans votre boutique et la marketplace.',
    href: '/dashboard/courses?new=1',
    cta: 'Nouvelle formation',
  },
  {
    icon: Zap,
    title: 'Automatisez les relances',
    body: 'Automatisations → nouvelle → déclencheur lead.created → action send_email. Déclenché par de vrais événements, 24 h/24.',
    href: '/dashboard/automations',
    cta: 'Créer l’automatisation',
  },
  {
    icon: CreditCard,
    title: 'Comprenez votre argent',
    body: 'Paiements → grand livre : chaque répartition, frais et remboursement est une écriture en append-only que vous pouvez auditer.',
    href: '/dashboard/payments?tab=ledger',
    cta: 'Ouvrir le grand livre',
  },
  {
    icon: Shield,
    title: 'Passez en Pro, gardez 100 %',
    body: 'Pro supprime la commission de 10 % sur vos propres ventes et ajoute les domaines, les statistiques et l’API.',
    href: '/dashboard/settings/billing',
    cta: 'Voir la facturation',
  },
  {
    icon: Mail,
    title: 'Délivrabilité des emails',
    body: 'Sans prestataire, chaque email reste dans la file d’envoi (Admin → Emails) — connectez Resend pour livrer réellement.',
    href: '/dashboard/emails?tab=outbox',
    cta: 'Ouvrir la file d’envoi',
  },
];

export default async function HelpPage() {
  const mode = paymentsMode();
  const email = emailProvider();

  return (
    <div>
      <PageHeader
        title="Aide"
        description="Comment Nuvra fonctionne — et ce qui est connecté aujourd’hui."
      />

      <div className="mb-5">
        <InlineAlert tone="info">
          <strong>État de l’environnement :</strong> Payments ={' '}
          <strong>
            {mode === 'stripe'
              ? 'Stripe actif'
              : 'MODE TEST (pas de STRIPE_SECRET_KEY)'}
          </strong>{' '}
          · Email ={' '}
          <strong>
            {email === 'RESEND'
              ? 'Resend actif'
              : 'File d’envoi (pas de RESEND_API_KEY)'}
          </strong>
          . Voir <code>.env.example</code> pour toutes les variables lues par
          Nuvra.
        </InlineAlert>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g) => (
          <Link
            key={g.title}
            href={g.href}
            className="card p-5 transition hover:border-nuvra-500/40"
          >
            <g.icon className="mb-3 h-5 w-5 text-nuvra-400" />
            <div className="section-title">{g.title}</div>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
              {g.body}
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-nuvra-400">
              {g.cta} →
            </span>
          </Link>
        ))}
      </div>

      <Card padded className="mt-6">
        <div className="section-title">
          Le modèle économique de Nuvra, en clair
        </div>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-white/[0.07] p-4 text-zinc-400">
            <div className="font-semibold text-zinc-200">
              Plateforme = gratuite
            </div>
            Pages, tunnels, CRM, formations, automatisations, statistiques.
          </div>
          <div className="rounded-lg border border-white/[0.07] p-4 text-zinc-400">
            <div className="font-semibold text-zinc-200">
              Académie = payante
            </div>
            Le programme de 15 modules + statut revendeur optionnel (90/10).
          </div>
          <div className="rounded-lg border border-nuvra-500/30 bg-nuvra-500/[0.05] p-4 text-zinc-400">
            <div className="font-semibold text-nuvra-200">
              Pro = subscription
            </div>
            0 % de commission sur vos ventes + outils avancés.
          </div>
        </div>
      </Card>
    </div>
  );
}
