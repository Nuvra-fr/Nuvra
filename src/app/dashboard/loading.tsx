import { BrandMark } from '@/components/BrandLogo';

/**
 * Route-level loading state for the dashboard.
 *
 * Skeletons mirror the real layout (page header + stat row + table) so the page
 * does not jump when data arrives. Deliberately cheap: no animated blur, no
 * images — a single pulse, which `prefers-reduced-motion` already disables.
 */
export default function DashboardLoading() {
  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center gap-3">
        <BrandMark size="md" className="opacity-30" />
        <div className="h-5 w-40 animate-pulse rounded-full bg-white/[0.07]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4">
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="mt-3 h-7 w-28 animate-pulse rounded-full bg-white/[0.09]" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-white/[0.05]" />
          </div>
        ))}
      </div>

      <div className="card mt-6 overflow-hidden p-0">
        <div className="border-b border-white/[0.07] px-5 py-3.5">
          <div className="h-3.5 w-32 animate-pulse rounded-full bg-white/[0.07]" />
        </div>
        <div className="divide-y divide-white/[0.05]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-3.5 flex-1 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="hidden h-3.5 w-24 animate-pulse rounded-full bg-white/[0.05] sm:block" />
              <div className="h-3.5 w-16 animate-pulse rounded-full bg-white/[0.07]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
