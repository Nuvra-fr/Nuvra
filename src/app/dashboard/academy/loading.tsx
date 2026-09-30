import { Loader2 } from 'lucide-react';

export default function AcademyLoading() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-52 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]" />
      <div className="grid gap-4 lg:grid-cols-[288px_minmax(0,1fr)]">
        <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
        <div className="space-y-3">
          <div className="h-7 w-2/3 animate-pulse rounded-lg bg-white/[0.05]" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>
      <span className="sr-only">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement de l&apos;Académie
      </span>
    </div>
  );
}
