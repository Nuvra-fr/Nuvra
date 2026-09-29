import type { Metadata } from 'next';
import Link from 'next/link';
import { asc, eq, and } from 'drizzle-orm';
import {
  ArrowRight,
  Award,
  Check,
  LayoutDashboard,
  Link2,
  TrendingUp,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { AcademyCover } from '@/components/AcademyCover';
import {
  ProgramOutline,
  type OutlineModule,
} from '@/components/ProgramOutline';
import { Badge } from '@/components/ui';
import { db } from '@/lib/db';
import { courseModules, courses, lessons } from '@/db/schema';
import { formatCents } from '@/lib/money';
import { academyPriceCents, resellerBps } from '@/lib/config';

// Real programme data (modules, lessons, price) — always read fresh so the page
// never advertises a programme that no longer matches the database.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Académie Nuvra',
  description:
    'Le programme complet pour concevoir, lancer et développer une activité digitale — avec un programme revendeur 90/10 en option.',
};

export default async function AcademyPage() {
  const price = await academyPriceCents();
  const bps = await resellerBps();
  const resellerPct = bps / 100;

  // Real programme — the same rows the learner will open inside the dashboard.
  const academy = await db
    .select()
    .from(courses)
    .where(and(eq(courses.isAcademy, true), eq(courses.status, 'PUBLISHED')))
    .get();
  const modules = academy
    ? await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, academy.id))
        .orderBy(asc(courseModules.position))
        .all()
    : [];
  const academyLessons = academy
    ? await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, academy.id))
        .all()
    : [];

  const outline: OutlineModule[] = modules.map((m) => ({
    id: m.id,
    title: m.title,
    lessonCount: academyLessons.filter((l) => l.moduleId === m.id).length,
  }));

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="glass-capsule sticky top-0 z-40 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <BrandLogo href="/" />
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="btn-ghost hidden sm:inline-flex">
              Tarifs
            </Link>
            <Link
              href="/register"
              className="btn-primary btn-sm sm:!px-4 sm:!py-2.5 sm:!text-sm"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8">
        {/* ── Couverture ───────────────────────────────────────────────── */}
        <AcademyCover
          mode="discover"
          moduleCount={modules.length || 15}
          lessonCount={academyLessons.length || 30}
          priceLabel={formatCents(price)}
          ctaHref="/checkout?item=academy"
          ctaLabel="Commencer l'Académie"
          secondaryHref="#programme"
          secondaryLabel="Voir le programme"
        />

        {/* ── Programme ────────────────────────────────────────────────── */}
        <section
          id="programme"
          className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]"
        >
          <div className="card overflow-hidden">
            <div className="card-head">
              <div>
                <h2 className="section-title">Le programme</h2>
                <p className="section-subtitle">
                  {modules.length || 15} modules · {academyLessons.length || 30}{' '}
                  leçons · accès à vie
                </p>
              </div>
              <Badge tone="blue">Certificat à la fin</Badge>
            </div>
            <ProgramOutline modules={outline} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="card card-body">
              <h2 className="section-title">Ce que vous obtenez</h2>
              <ul className="mt-3.5 space-y-2.5 text-sm text-zinc-400">
                {[
                  'Le programme complet, module par module',
                  'Votre espace d’apprentissage avec suivi de progression',
                  'Ressources et quiz à chaque étape',
                  'Certificat de fin de parcours',
                  'Éligibilité au programme revendeur',
                ].map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/checkout?item=academy"
                className="btn-primary mt-5 w-full justify-center"
              >
                Commencer — {formatCents(price)}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-2.5 text-center text-xs text-zinc-600">
                La plateforme Nuvra reste gratuite — l’Académie est un produit à
                part.
              </p>
            </div>

            <div className="card card-body">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <h2 className="section-title">Accompagnement</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Chaque module se termine par un livrable concret : votre offre,
                votre page, votre séquence email.
              </p>
            </div>
          </div>
        </section>

        {/* ── Revendeur ────────────────────────────────────────────────── */}
        <section id="reseller" className="mt-12">
          <div className="mb-6 max-w-xl">
            <p className="eyebrow text-nuvra-300/80">Programme revendeur</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-zinc-100">
              Vendez l’Académie, gardez {resellerPct} %
            </h2>
            <p className="page-subtitle">
              Après l’achat, activez le programme revendeur : lien personnel,
              suivi des ventes et paiements.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card card-hover card-body">
              <Link2 className="h-5 w-5 text-nuvra-400" />
              <h3 className="mt-3.5 section-title">Votre lien</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                Une URL personnelle, avec suivi des clics et attribution sur
                chaque vente.
              </p>
            </div>
            <div className="card card-hover card-body">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h3 className="mt-3.5 section-title">
                {resellerPct} % pour vous, {100 - resellerPct} % pour Nuvra
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                Une vente à {formatCents(price)} vous rapporte{' '}
                <strong className="text-emerald-300">
                  {formatCents(Math.floor((price * bps) / 10000))}
                </strong>
                . Frais de paiement affichés séparément.
              </p>
            </div>
            <div className="card card-hover card-body">
              <LayoutDashboard className="h-5 w-5 text-amber-400" />
              <h3 className="mt-3.5 section-title">Tableau de bord</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                Revenus, commissions, clics, conversions et statut des
                paiements.
              </p>
            </div>
          </div>
        </section>

        {/* ── Deux produits distincts ──────────────────────────────────── */}
        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="card card-body">
            <p className="eyebrow text-emerald-400">Plateforme Nuvra</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-zinc-100">
              Gratuit
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              Pages, tunnels, CRM, formations, automatisations, statistiques.
            </p>
          </div>
          <div className="card card-body border-nuvra-500/25">
            <p className="eyebrow text-amber-400">Académie Nuvra</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-zinc-100">
              {formatCents(price)} — produit à part
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              La formation complète et l’éligibilité au programme revendeur.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
