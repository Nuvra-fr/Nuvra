import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  BarChart3,
  Users,
  ShoppingBag,
  Wallet,
  Store,
  Settings,
  Mail,
  ScrollText,
  ArrowLeft,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { BrandMark } from '@/components/BrandLogo';

export const metadata: Metadata = { title: 'Administration' };

const NAV = [
  { href: '/admin', label: 'Vue d’ensemble', icon: BarChart3 },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { href: '/admin/payouts', label: 'Versements', icon: Wallet },
  { href: '/admin/marketplace', label: 'Modération', icon: Store },
  { href: '/admin/emails', label: 'File d’envoi', icon: Mail },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  { href: '/admin/audit', label: 'Journal d’audit', icon: ScrollText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireAdmin();
  if (ctx.user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="glass-capsule sticky top-0 z-30 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" priority />
            <span className="text-sm font-semibold text-zinc-100">
              Nuvra Admin
            </span>
            <span className="badge border-red-500/30 bg-red-500/10 text-red-300">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-zinc-600 sm:inline">
              {ctx.user.email}
            </span>
            <Link href="/dashboard" className="btn-ghost btn-sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Application
            </Link>
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 md:px-6"
          aria-label="Administration"
        >
          {NAV.map((item) => (
            <AdminLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
    >
      {label}
    </Link>
  );
}
