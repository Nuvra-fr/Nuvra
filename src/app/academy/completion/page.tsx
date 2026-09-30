import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Compass,
  Lock,
  Rocket,
  Share2,
  Target,
  Trophy,
} from 'lucide-react';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAcademyAccess } from '@/lib/academy';
import { getSession } from '@/lib/auth';
import { certificates } from '@/db/schema';
import { academyPriceCents } from '@/lib/config';
import { formatCents } from '@/lib/money';
import { Badge, InlineAlert, Section } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';

export const metadata: Metadata = {
  title: 'THE NUVRA LAUNCH PROJECT — Nuvra Academy',
  description:
    "Le projet final de Nuvra Academy : lancez votre système digital complet en 30 jours, avec un plan d'action, des indicateurs et un certificat vérifiable.",
};
export const dynamic = 'force-dynamic';

const PROJECT_PHASES = [
  {
    day: 'Jours 1-7',
    title: 'Cadrage',
    mission:
      "Votre offre est écrite en une phrase, votre audience est nommée, votre problème est formulé dans les mots du client. Le module 1 a produit cette fiche : elle n'est pas négociable.",
    outputs: [
      'Fiche business (niche, audience, problème, preuve)',
      'Offre à trois niveaux avec prix et garantie',
      'Une seule promesse, écrite une seule fois',
    ],
  },
  {
    day: 'Jours 8-14',
    title: 'Production',
    mission:
      "Votre produit est en ligne, votre tunnel est construit, votre page de vente est rédigée et publiée. Rien n'est vendu avant que la page ne soit prête.",
    outputs: [
      'Produit publié avec une page de vente qui répond aux objections',
      'Tunnel de trois étapes testé de bout en bout',
      'Paiement Stripe en mode réel, testé puis basculé en live',
    ],
  },
  {
    day: 'Jours 15-21',
    title: 'Acquisition',
    mission:
      "Une source de trafic ativo, mesurée, avec un coût par lead connu. Le contenu, l'affiliation et la communauté sont des canaux — pas des Kiev wish.",
    outputs: [
      'Un canal principal avec un objectif de leads par semaine',
      'Cinq contenus publiés et distribués',
      'Tableau de bord acquisition ouvert chaque matin',
    ],
  },
  {
    day: 'Jours 22-27',
    title: 'Système',
    mission:
      "Les automatisations prennent le relais : bienvenue, relance de panier, relance de paiement, nurturing, réactivation. Vous ne répondez plus à la main.",
    outputs: [
      'Quatre automatisations actives et surveillées',
      'Séquence email de 6 messages branchée sur le tunnel',
      'Alertes configurées sur les signaux qui comptent',
    ],
  },
  {
    day: 'Jours 28-30',
    title: 'Croissance',
    mission:
      "La boucle est bouclée : le produit est construit, mesuré, amélioré — et les retours alimentent le contenu comme l'offre. Vous savez exactement quel canal mérite le prochain euro.",
    outputs: [
      'Revue de cohorte et taux de réachat',
      'Une amélioration de l\'offre par mois, planifiée',
      'Décision d\'investissement justifiée par des données',
    ],
  },
];

export default async function AcademyCompletionPage() {
  const session = await getSession();
  const access = session ? await getAcademyAccess(session.user.id) : null;
  const price = await academyPriceCents();
  const enrollment = access?.enrollment ?? null;
  const cert = enrollment
    ? await db
        .select()
        .from(certificates)
        .where(eq(certificates.enrollmentId, enrollment.id))
        .get()
    : null;

  const enrolled = !!access?.granted;

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-6">
        <BrandLogo href="/" size="md" />
        <div className="flex items-center gap-2">
          {enrolled ? (
            <Link href="/dashboard/academy" className="btn-ghost">
              Mon parcours
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost">
              Se connecter
            </Link>
          )}
          <Link href="/academy" className="btn-secondary">
            Voir le programme
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20">
        <section className="relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-925 px-6 py-12 sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_-10%,rgba(27,81,245,0.32),transparent_70%)]"
          />
          <div className="relative">
            <div className="eyebrow text-nuvra-300">Projet final</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              THE NUVRA LAUNCH PROJECT
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
              Les 8 modules vous ont fait comprendre, construire et automatiser.
              Ce dernier travail consiste à tout lancer : un système digital
              complet, mesuré, tenu par vous — en trente jours, sans usine à
              gaz.
            </p>

            {!enrolled ? (
              <div className="mt-7 space-y-3">
                <InlineAlert tone="info">
                  <Lock className="mr-1 inline h-3.5 w-3.5" />
                  Ce projet est la conclusion du parcours. Il s&apos;ouvre à la
                  fin des 118 leçons de Nuvra Academy.
                </InlineAlert>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/checkout?item=academy" className="btn-primary">
                    <Rocket className="h-4 w-4" /> Rejoindre l&apos;Académie —{' '}
                    {formatCents(price)}
                  </Link>
                  <Link href="/academy" className="btn-ghost">
                    Voir le contenu du programme
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-7 space-y-4">
                {cert ? (
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-5 py-4">
                    <Trophy className="h-6 w-6 text-amber-300" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-amber-100">
                        Parcours terminé — certificat émis
                      </p>
                      <p className="mt-0.5 text-xs text-amber-200/70">
                        Code {cert.code} ·{' '}
                        {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Link href={`/certificate/${cert.code}`} className="btn-secondary btn-sm">
                      <Award className="h-3.5 w-3.5" /> Voir le certificat
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.03] px-5 py-4">
                    <Compass className="h-5 w-5 text-nuvra-300" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-100">
                        Dernière étape : le laboratoire « Nuvra Growth System »
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Il valide votre système complet avant de délivrer le
                        certificat.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/academy/systeme-de-croissance-nuvra"
                      className="btn-primary btn-sm"
                    >
                      Ouvrir le laboratoire
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          {PROJECT_PHASES.map((phase, i) => (
            <article key={phase.title} className="card card-body">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-nuvra-500/30 bg-nuvra-500/10 text-sm font-semibold text-nuvra-200">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="eyebrow">{phase.day}</div>
                  <h2 className="mt-1 text-base font-semibold text-zinc-100">
                    {phase.title}
                  </h2>
                </div>
                {i === 0 ? <Badge tone="blue">Fondations</Badge> : null}
                {i === 4 ? <Badge tone="green">Bouclage</Badge> : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {phase.mission}
              </p>
              <ul className="mt-3 space-y-1.5">
                {phase.outputs.map((o) => (
                  <li
                    key={o}
                    className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {o}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <Section
          title="Comment le projet est évalué"
          description="Le laboratoire final vérifie votre système dans Nuvra, pas dans un formulaire."
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              'Une offre publiée, avec son prix et sa page de vente',
              'Un tunnel actif qui va de la visite à la commande payée',
              'Une source de trafic avec un coût par lead mesuré',
              'Des automatisations actives sur les moments clés',
              'Un tableau de bord ouvert et des alertes configurées',
              'Un plan de croissance écrit pour les 90 prochains jours',
            ].map((c) => (
              <li
                key={c}
                className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300"
              >
                <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nuvra-400" />
                {c}
              </li>
            ))}
          </ul>
        </Section>

        <section className="card card-body mt-6 flex flex-wrap items-center gap-4">
          <Share2 className="h-5 w-5 text-nuvra-400" />
          <div className="min-w-0 flex-1">
            <h2 className="section-title">Votre certificat est public</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              Chaque certificat porte un identifiant unique et une page
              de vérification consultable par un recruteur, un partenaire ou un
              client — sans compte, sans partage de données.
            </p>
          </div>
          {cert ? (
            <Link href={`/certificate/${cert.code}`} className="btn-secondary shrink-0">
              Voir mon certificat
            </Link>
          ) : (
            <Link href="/academy" className="btn-secondary shrink-0">
              Découvrir l&apos;Académie
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}
