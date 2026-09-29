import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import {
  ArrowUpRight,
  Plus,
  CreditCard,
  Rocket,
  GraduationCap,
  FileText,
  Package,
  Sparkles,
} from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, orders, pages, products, funnels } from '@/db/schema';
import { formatCents } from '@/lib/money';
import {
  BarChart,
  Badge,
  PageHeader,
  Stat,
  StatusBadge,
} from '@/components/ui';
import { revenueSeries, workspaceStats } from '@/lib/analytics';
import { paymentsMode } from '@/lib/stripe';
import { academyPriceCents } from '@/lib/config';

export const metadata: Metadata = { title: 'Vue d’ensemble' };

export default async function OverviewPage() {
  const ctx = await requireUser();
  const ws = ctx.workspace.id;
  const stats = await workspaceStats(ws);
  const series = await revenueSeries(14);

  const recentOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.workspaceId, ws))
    .orderBy(desc(orders.createdAt))
    .limit(6)
    .all();

  // "Your next moves" — real recommendations from real data
  const productCount = (
    await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.workspaceId, ws))
      .all()
  ).length;
  const courseCount = (
    await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.workspaceId, ws))
      .all()
  ).length;
  const pageCount = (
    await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.workspaceId, ws))
      .all()
  ).length;
  const funnelCount = (
    await db
      .select({ id: funnels.id })
      .from(funnels)
      .where(eq(funnels.workspaceId, ws))
      .all()
  ).length;
  const hasStripe = paymentsMode() === 'stripe';

  const moves: {
    title: string;
    body: string;
    href: string;
    cta: string;
    done?: boolean;
  }[] = [
    {
      title:
        productCount === 0 && courseCount === 0
          ? 'Créez votre premier produit'
          : 'Produits et formations en place',
      body:
        productCount === 0 && courseCount === 0
          ? 'Avoir quelque chose à vendre est le point de départ de tout.'
          : `${productCount} produit(s) et ${courseCount} formation(s) dans votre espace.`,
      href: '/dashboard/products?new=1',
      cta:
        productCount === 0 && courseCount === 0
          ? 'Créer le produit'
          : 'Ouvrir les produits',
      done: productCount > 0 || courseCount > 0,
    },
    {
      title:
        pageCount === 0 ? 'Créez une page de vente' : 'Vos pages sont en ligne',
      body:
        pageCount === 0
          ? 'Transformez votre trafic en prospects avec une page dédiée.'
          : `${pageCount} page(s) créée(s).`,
      href: '/dashboard/pages?new=1',
      cta: pageCount === 0 ? 'Créer la page' : 'Ouvrir les pages',
      done: pageCount > 0,
    },
    {
      title: funnelCount === 0 ? 'Structurez un tunnel' : 'Tunnels en place',
      body:
        funnelCount === 0
          ? 'Page de vente → prospect → vente → paiement → upsell, avec les conversions suivies.'
          : `${funnelCount} tunnel(s) suivent les conversions par étape.`,
      href: '/dashboard/funnels?new=1',
      cta: funnelCount === 0 ? 'Créer le tunnel' : 'Ouvrir les tunnels',
      done: funnelCount > 0,
    },
    {
      title: hasStripe ? 'Paiements connectés' : 'Connectez vos paiements',
      body: hasStripe
        ? 'Stripe est configuré — le paiement en production est actif.'
        : 'Renseignez STRIPE_SECRET_KEY pour encaisser en réel. En attendant, le paiement tourne en MODE TEST identifié.',
      href: '/dashboard/settings#payments',
      cta: hasStripe ? 'Voir les paramètres' : 'Paramètres de paiement',
      done: hasStripe,
    },
    {
      title: 'Découvrir l’Académie Nuvra',
      body: `Programme payant donnant accès au programme revendeur — ${formatCents(await academyPriceCents())}. La plateforme reste gratuite.`,
      href: '/dashboard/academy',
      cta: 'Découvrir l’Académie',
      done: false,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Bon retour, ${ctx.user.name.split(' ')[0]}`}
        description="Votre activité en un coup d’œil."
        actions={
          <>
            <Link href="/dashboard/products?new=1" className="btn-secondary">
              <Plus className="h-4 w-4" /> Nouveau produit
            </Link>
            <Link href="/dashboard/courses?new=1" className="btn-primary">
              <Plus className="h-4 w-4" /> Nouvelle formation
            </Link>
          </>
        }
      />

      <div className="grid-stats">
        <Stat
          label="Chiffre d’affaires (total)"
          value={formatCents(stats.revenue)}
          hint={`${stats.sales} commande(s) payée(s)`}
        />
        <Stat
          label="Chiffre d’affaires (30 jours)"
          value={formatCents(stats.revenue30)}
          hint="Commandes payées"
        />
        <Stat
          label="Clients"
          value={String(stats.customers)}
          hint={`${stats.leads} prospect(s) dans le CRM`}
        />
        <Stat
          label="Élèves"
          value={String(stats.students)}
          hint={`${stats.pageViews} pages vues`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card card-body lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title">
                Chiffre d’affaires — 14 derniers jours
              </h2>
              <p className="text-xs text-zinc-600">
                Commandes payées uniquement.
              </p>
            </div>
            <Link
              href="/dashboard/analytics"
              className="text-xs text-nuvra-400 hover:text-nuvra-300"
            >
              Statistiques complètes →
            </Link>
          </div>
          <BarChart data={series} format={(v) => formatCents(v)} />
        </div>

        <div className="card card-body">
          <div className="mb-4 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-nuvra-400" />
            <h2 className="section-title">Vos prochaines étapes</h2>
          </div>
          <div className="space-y-3">
            {moves.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="block rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5 transition hover:border-nuvra-500/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-200">
                    {m.title}
                  </span>
                  {m.done ? (
                    <Badge tone="green">Terminé</Badge>
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-nuvra-400" />
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  {m.body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="card-head">
            <h2 className="section-title">Commandes récentes</h2>
            <Link
              href="/dashboard/payments"
              className="text-xs text-nuvra-400 hover:text-nuvra-300"
            >
              Payments →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-600">
              Aucune commande pour l’instant. Publiez quelque chose et partagez
              votre lien.
            </div>
          ) : (
            <div className="table-wrap border-0">
              <table className="data">
                <thead>
                  <tr>
                    <th>Commande</th>
                    <th>Acheteur</th>
                    <th>Total</th>
                    <th>Commission Nuvra</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="font-medium text-zinc-200">{o.number}</td>
                      <td className="text-zinc-400">{o.buyerEmail}</td>
                      <td className="tabular-nums">
                        {formatCents(o.totalCents, o.currency)}
                      </td>
                      <td className="tabular-nums text-zinc-500">
                        {formatCents(o.platformFeeCents, o.currency)}
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          <StatusBadge status={o.status} />
                          <StatusBadge status={o.mode} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card card-body">
          <h2 className="mb-3 section-title">Actions rapides</h2>
          <div className="space-y-2">
            {[
              {
                icon: Package,
                label: 'Nouveau produit',
                href: '/dashboard/products?new=1',
              },
              {
                icon: FileText,
                label: 'Nouvelle page',
                href: '/dashboard/pages?new=1',
              },
              {
                icon: GraduationCap,
                label: 'Nouvelle formation',
                href: '/dashboard/courses?new=1',
              },
              {
                icon: CreditCard,
                label: 'Paiements & versements',
                href: '/dashboard/payments',
              },
              {
                icon: Sparkles,
                label: 'Académie Nuvra',
                href: '/dashboard/academy',
              },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] px-3.5 py-2.5 text-sm text-zinc-400 transition hover:border-white/15 hover:text-zinc-200"
              >
                <a.icon className="h-4 w-4 text-nuvra-400" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
