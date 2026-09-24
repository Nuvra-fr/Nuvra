'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  Store,
  Package,
  GraduationCap,
  Users,
  UserRound,
  Mail,
  Zap,
  Share2 as Affiliate,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  User,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  LogOut,
  TestTube,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { globalSearch, type SearchHit } from '@/server/actions/search';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/funnels', label: 'Funnels', icon: GitBranch },
  { href: '/dashboard/pages', label: 'Pages', icon: FileText },
  { href: '/dashboard/store', label: 'Store', icon: Store },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/courses', label: 'Courses', icon: GraduationCap },
  { href: '/dashboard/academy', label: 'Academy', icon: Sparkles },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: Store },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/leads', label: 'Leads', icon: UserRound },
  { href: '/dashboard/emails', label: 'Emails', icon: Mail },
  { href: '/dashboard/automations', label: 'Automations', icon: Zap },
  { href: '/dashboard/affiliates', label: 'Affiliates', icon: Affiliate },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
];

const SECONDARY = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/help', label: 'Help', icon: HelpCircle },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export interface ChromeProps {
  user: { name: string; email: string; role: string };
  workspace: { name: string; slug: string; plan: string };
  unread: number;
  testMode: boolean;
  children: React.ReactNode;
}

export default function DashboardChrome({ user, workspace, unread, testMode, children }: ChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [pending, startSearch] = useTransition();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // CMD+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      startSearch(async () => {
        const res = await globalSearch(q);
        setHits(res);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const commands = useMemo(
    () => [
      { label: 'Create product', href: '/dashboard/products?new=1' },
      { label: 'Create course', href: '/dashboard/courses?new=1' },
      { label: 'Create funnel', href: '/dashboard/funnels?new=1' },
      { label: 'Create page', href: '/dashboard/pages?new=1' },
      { label: 'Create campaign', href: '/dashboard/emails?new=1' },
      { label: 'Open analytics', href: '/dashboard/analytics' },
      { label: 'Open customers', href: '/dashboard/customers' },
      { label: 'Open marketplace', href: '/dashboard/marketplace' },
      { label: 'Open Academy', href: '/dashboard/academy' },
      { label: 'Open billing', href: '/dashboard/settings/billing' },
    ],
    [],
  );

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-nuvra-600 text-sm font-bold text-white">
            N
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-100">Nuvra</span>
        </Link>
        <button
          className="btn-ghost lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        <div className="space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                isActive(item.href)
                  ? 'bg-nuvra-600/15 text-nuvra-200'
                  : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="my-3 border-t border-white/[0.07]" />
        <div className="space-y-0.5">
          {SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                isActive(item.href)
                  ? 'bg-nuvra-600/15 text-nuvra-200'
                  : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        {workspace.plan === 'FREE' ? (
          <Link
            href="/dashboard/settings/billing"
            className="mb-3 block rounded-lg border border-nuvra-500/30 bg-nuvra-500/10 p-3 text-xs text-nuvra-200 hover:bg-nuvra-500/15"
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Go Pro — keep 100 %
            </div>
            <div className="mt-1 text-nuvra-300/80">0 % platform fee on your sales + advanced tools.</div>
          </Link>
        ) : (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" /> Nuvra {workspace.plan} active — 0 % commission
          </div>
        )}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nuvra-600/30 text-xs font-semibold text-nuvra-200">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-zinc-300">{user.name}</div>
            <div className="truncate text-[11px] text-zinc-600">{workspace.name}</div>
          </div>
          <button onClick={logout} className="btn-ghost !p-1.5" title="Sign out" aria-label="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-white/[0.07] bg-ink-900 lg:block">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/[0.07] bg-ink-900">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/[0.07] bg-ink-950/85 px-4 backdrop-blur md:px-6">
          <button className="btn-ghost lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-4 w-4" />
          </button>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 flex-1 max-w-md items-center gap-2 rounded-lg border border-white/10 bg-ink-900 px-3 text-sm text-zinc-500 transition hover:border-white/20"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search anything…</span>
            <kbd className="ml-auto hidden rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline">
              ⌘K
            </kbd>
          </button>

          {testMode && (
            <span
              className="hidden items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300 sm:flex"
              title="Stripe is not configured — payments run in clearly-labeled TEST MODE. No real money moves."
            >
              <TestTube className="h-3 w-3" /> TEST MODE
            </span>
          )}

          <details className="relative">
            <summary className="btn-ghost relative cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-nuvra-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </summary>
            <div className="absolute right-0 top-11 w-80 rounded-xl border border-white/10 bg-ink-850 p-2 shadow-card">
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Notifications
              </div>
              <NotificationList />
            </div>
          </details>

          <details className="relative">
            <summary className="btn-ghost cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-nuvra-600/30 text-xs font-semibold text-nuvra-200">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <ChevronDown className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute right-0 top-11 w-52 rounded-xl border border-white/10 bg-ink-850 p-1.5 shadow-card">
              <div className="border-b border-white/[0.07] px-3 py-2">
                <div className="truncate text-xs font-medium text-zinc-300">{user.email}</div>
                <div className="text-[11px] text-zinc-600">{workspace.plan} plan</div>
              </div>
              <Link href="/dashboard/profile" className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200">
                Profile
              </Link>
              <Link href="/dashboard/settings" className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200">
                Settings
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="block rounded-md px-3 py-2 text-sm text-nuvra-300 hover:bg-white/[0.06]">
                  Admin console
                </Link>
              )}
              <button
                onClick={logout}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
              >
                Sign out
              </button>
            </div>
          </details>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>

      {/* Command palette */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh]">
          <div className="absolute inset-0" onClick={() => setPaletteOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-ink-850 shadow-card">
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pages, products, courses, customers, orders…"
                className="h-12 w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-600">ESC</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {hits.length === 0 && (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Commands
                </div>
              )}
              {(hits.length ? hits : commands.slice(0, q ? 0 : 6)).map((h, i) => (
                <Link
                  key={i}
                  href={h.href}
                  onClick={() => {
                    setPaletteOpen(false);
                    setQ('');
                  }}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.06]"
                >
                  <span>{(h as SearchHit).label ?? (h as { label: string }).label}</span>
                  <span className="text-xs text-zinc-600">{(h as SearchHit).kind ?? ''}</span>
                </Link>
              ))}
              {hits.length === 0 && q.length >= 2 && !pending && (
                <div className="px-3 py-4 text-sm text-zinc-600">No results.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationList() {
  const [items, setItems] = useState<
    { id: string; title: string; body: string | null; link: string | null; readAt: string | null }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onLoad={() => undefined}
      onClick={() => {
        if (loaded) return;
        setLoaded(true);
        fetch('/api/notifications')
          .then((r) => r.json())
          .then((d) => setItems(d.items ?? []))
          .catch(() => setLoaded(true));
      }}
    >
      {items.length === 0 ? (
        <div className="px-3 py-4 text-xs text-zinc-600">Loading notifications…</div>
      ) : (
        items.map((n) => (
          <Link
            key={n.id}
            href={n.link ?? '#'}
            className="block rounded-lg px-3 py-2.5 hover:bg-white/[0.05]"
          >
            <div className="text-xs font-medium text-zinc-300">{n.title}</div>
            {n.body ? <div className="mt-0.5 text-[11px] text-zinc-500">{n.body}</div> : null}
          </Link>
        ))
      )}
    </div>
  );
}
