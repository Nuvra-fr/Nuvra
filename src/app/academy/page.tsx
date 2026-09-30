import type { Metadata } from 'next';
import Link from 'next/link';
import { asc, eq, and } from 'drizzle-orm';
import {
  ArrowRight,
  Award,
  Check,
  LayoutDashboard,
  Link2,
  Rocket,
  TrendingUp,
  Play,
  Hammer,
  FileCheck2,
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
  const totalMinutes = academyLessons.reduce((s, l) => s + l.durationMin, 0);
  const labCount = academyLessons.filter((l) => l.type === 'lab' || l.type === 'workshop').length;
  const published = academy?.status === 'PUBLISHED' && modules.length > 0;

  const FLOW = [
    { step: 'COMPRENDRE', text: 'Le modèle économique, le marché, l’audience, le problème.' },
    { step: 'APPRENDRE', text: 'Les méthodes, avec des exemples chiffrés et des contre-exemples.' },
    { step: 'VOIR', text: 'Chaque module ouvre sur sa vidéo : storyboard, chapitres, transcription.' },
    { step: 'FAIRE', text: 'L’atelier : vous construisez l’objet réel dans votre espace Nuvra.' },
    { step: 'VALIDER', text: 'Quiz corrigé, critères de réussite, vérification automatique dans Nuvra.' },
    { step: 'PASSER À LA SUITE', text: 'La progression est enregistrée — vous reprenez exactement où vous étiez.' },
  ];

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
        {!published ? (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Le programme est en cours de mise en ligne. Les inscriptions restent
            ouvertes — contactez-nous pour l&apos;accès anticipé.
          </div>
        ) : null}
        {/* ── Couverture ───────────────────────────────────────────────── */}
        <AcademyCover
          mode="discover"
          moduleCount={modules.length}
          lessonCount={academyLessons.length}
          priceLabel={formatCents(price)}
          ctaHref="/checkout?item=academy"
          ctaLabel="Commencer l'Académie"
          secondaryHref="#programme"
          secondaryLabel="Voir le programme"
        />

        {/* ── Méthode ──────────────────────────────────────────────────── */}
        <section className="mt-6 card overflow-hidden">
          <div className="card-head">
            <div>
              <h2 className="section-title">La méthode, à chaque leçon</h2>
              <p className="section-subtitle">
                Le même cycle, du début à la fin du programme
              </p>
            </div>
          </div>
          <ol className="grid gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((f, i) => (
              <li key={f.step} className="bg-ink-900 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-nuvra-500/30 bg-nuvra-500/10 text-[11px] font-semibold text-nuvra-200">
                    {i + 1}
                  </span>
                  <span className="eyebrow">{f.step}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.text}</p>
              </li>
            ))}
          </ol>
        </section>

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
                  {modules.length} modules · {academyLessons.length} leçons ·{' '}
                  {Math.round(totalMinutes / 60)} h de travail guidé · accès à vie
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
                  `${academyLessons.length} leçons réparties en ${modules.length} modules`,
                  `${labCount} ateliers pratiques où vous construisez dans Nuvra`,
                  `Vidéos : storyboard, chapitres, transcription — et le lecteur dès que le fichier est publié`,
                  'Progression enregistrée : vous reprenez exactement où vous vous étiez arrêté',
                  'Certificat de fin de parcours avec page de vérification publique',
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
                <h2 className="section-title">Dans votre espace</h2>
              </div>
              <ul className="mt-3 space-y-2.5 text-sm text-zinc-400">
                {[
                  { icon: Play, t: 'Lecteur vidéo avec position mémorisée' },
                  { icon: Hammer, t: 'Actions Nuvra : vous construisez dans les vrais ateliers' },
                  { icon: FileCheck2, t: 'Quiz corrigés, notes privées, critères de réussite' },
                ].map((f) => (
                  <li key={f.t} className="flex gap-2.5">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-nuvra-400" />
                    {f.t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Projet final ─────────────────────────────────────────────── */}
        <section className="mt-6 card card-body">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-nuvra-500/30 bg-nuvra-500/10">
              <Rocket className="h-5 w-5 text-nuvra-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-nuvra-300">Projet final</p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.01em] text-zinc-100">
                THE NUVRA LAUNCH PROJECT
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Le parcours ne s&apos;arrête pas à des vidéos. Il se termine par un
                lancement sur trente jours : cadrage, production, acquisition,
                système, croissance — avec un plan écrit et un certificat qui
                atteste que le système existe vraiment dans votre espace.
              </p>
            </div>
            <Link href="/academy/completion" className="btn-secondary shrink-0">
              Voir le projet <ArrowRight className="h-4 w-4" />
            </Link>
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
