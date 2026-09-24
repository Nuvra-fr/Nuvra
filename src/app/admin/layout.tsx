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

export const metadata: Metadata = { title: 'Admin' };

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { href: '/admin/marketplace', label: 'Moderation', icon: Store },
  { href: '/admin/emails', label: 'Email queue', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/audit', label: 'Audit logs', icon: ScrollText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  if (ctx.user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs font-bold text-white">
              A
            </span>
            <span className="text-sm font-semibold text-zinc-100">Nuvra Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-zinc-600 sm:inline">{ctx.user.email}</span>
            <Link href="/dashboard" className="btn-ghost !py-1.5 !text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> App
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 md:px-6" aria-label="Admin">
          {NAV.map((item) => (
            <AdminLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
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
