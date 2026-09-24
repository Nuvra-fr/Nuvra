'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminUpdateSettingAction } from '@/server/actions/admin';
import { Card } from '@/components/ui';

const LABELS: Record<string, string> = {
  ai: 'Nuvra AI',
  marketplace: 'Marketplace',
  affiliates: 'Affiliates',
  customDomains: 'Custom domains',
  templates: 'Templates',
  advancedAnalytics: 'Advanced analytics',
  beta: 'Beta features',
};

export default function FlagsForm({ flags }: { flags: Record<string, boolean> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Card padded>
      <div className="mb-4 text-sm font-semibold text-zinc-200">Feature flags</div>
      <div className="space-y-2.5">
        {Object.entries(flags).map(([key, on]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-lg border border-white/[0.07] px-3.5 py-2.5"
          >
            <span className="text-sm text-zinc-300">{LABELS[key] ?? key}</span>
            <input
              type="checkbox"
              checked={on}
              disabled={pending}
              onChange={() =>
                startTransition(async () => {
                  const res = await adminUpdateSettingAction(`flags.${key}`, !on);
                  if (res.ok) router.refresh();
                })
              }
              className="h-4 w-4 accent-[#1B51F5]"
            />
          </label>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-zinc-600">
        Disabled features show an explicit notice in the UI — nothing disappears silently.
      </p>
    </Card>
  );
}
