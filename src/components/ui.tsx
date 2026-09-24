import { cn } from '@/lib/utils';

// ── Badge ─────────────────────────────────────────────
export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode;
  tone?: 'default' | 'green' | 'red' | 'amber' | 'blue' | 'purple';
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: 'border-white/10 bg-white/[0.05] text-zinc-300',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    red: 'border-red-500/30 bg-red-500/10 text-red-300',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    blue: 'border-nuvra-500/30 bg-nuvra-500/15 text-nuvra-300',
    purple: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  };
  return (
    <span className={cn('badge', tones[tone], className)}>
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────
export function Card({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={cn('card', padded && 'p-5', className)}>{children}</div>;
}

// ── Stat ──────────────────────────────────────────────
export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'positive' | 'negative' | 'neutral';
}) {
  const toneClass =
    tone === 'positive' ? 'text-emerald-400' : tone === 'negative' ? 'text-red-400' : 'text-zinc-100';
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={cn('mt-1.5 text-2xl font-semibold tabular-nums', toneClass)}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? <div className="mb-3 text-zinc-600">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-sm text-zinc-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

// ── Badge for statuses ────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const tone =
    ['PAID', 'ACTIVE', 'APPROVED', 'PUBLISHED', 'SENT', 'LIVE', 'COMPLETED', 'VERIFIED', 'PRO'].includes(s)
      ? 'green'
      : ['PENDING', 'DRAFT', 'REVIEW', 'SCHEDULED', 'QUEUED', 'PROCESSING', 'TRIALING', 'WAITING', 'PAST_DUE'].includes(s)
        ? 'amber'
        : ['FAILED', 'REFUNDED', 'REJECTED', 'SUSPENDED', 'CANCELED', 'ARCHIVED', 'BLOCKED'].includes(s)
          ? 'red'
          : s === 'TEST'
            ? 'purple'
            : 'default';
  return <Badge tone={tone}>{s.replace(/_/g, ' ')}</Badge>;
}

// ── Section header ────────────────────────────────────
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

// ── Tabs (links) ──────────────────────────────────────
export function Tabs({
  items,
  active,
}: {
  items: { href: string; label: string }[];
  active: string;
}) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/[0.07]">
      {items.map((t) => (
        <a
          key={t.href}
          href={t.href}
          className={cn(
            'whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition',
            active === t.href
              ? 'border-nuvra-500 text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300',
          )}
        >
          {t.label}
        </a>
      ))}
    </div>
  );
}

// ── Sparkline / simple bar chart (SVG, no deps) ───────
export function BarChart({
  data,
  height = 140,
  format,
}: {
  data: { label: string; value: number }[];
  height?: number;
  format?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex-1">
            <div
              className="w-full rounded-t bg-nuvra-600/70 transition group-hover:bg-nuvra-500"
              style={{ height: Math.max(3, Math.round((d.value / max) * height)) }}
              title={`${d.label}: ${format ? format(d.value) : d.value}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
        <span>{data[0]?.label ?? ''}</span>
        <span>{data[data.length - 1]?.label ?? ''}</span>
      </div>
    </div>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <div className="h-full rounded-full bg-nuvra-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function InlineAlert({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}) {
  const tones = {
    info: 'border-nuvra-500/30 bg-nuvra-500/10 text-nuvra-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    error: 'border-red-500/30 bg-red-500/10 text-red-200',
  };
  return (
    <div className={cn('rounded-lg border px-3.5 py-3 text-sm', tones[tone])} role="alert">
      {children}
    </div>
  );
}
