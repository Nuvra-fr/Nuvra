'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminSaveBusinessSettingsAction } from '@/server/actions/admin';
import { FormError } from '@/components/auth';
import { Card } from '@/components/ui';

export default function BusinessSettingsForm({ initial }: { initial: Record<string, number> }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function num(key: string): number {
    return Number(form[key] ?? 0);
  }

  function set(key: string, v: string) {
    setForm({ ...form, [key]: parseFloat(v) || 0 });
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await adminSaveBusinessSettingsAction({
        academyPrice: Math.round(num('academyPrice')),
        proPrice: Math.round(num('proPrice')),
        businessPrice: Math.round(num('businessPrice')),
        freeCommissionBps: Math.round(num('freeCommissionBps')),
        resellerBps: Math.round(num('resellerBps')),
        payoutHoldDays: Math.round(num('payoutHoldDays')),
        aiFreeCredits: Math.round(num('aiFreeCredits')),
        aiProCredits: Math.round(num('aiProCredits')),
      });
      if (!res.ok) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  const fields: { key: string; label: string; step?: string }[] = [
    { key: 'academyPrice', label: 'Academy price (cents)' },
    { key: 'proPrice', label: 'Pro price (cents)' },
    { key: 'businessPrice', label: 'Business price (cents)' },
    { key: 'freeCommissionBps', label: 'Free plan commission (bps — 1000 = 10 %)' },
    { key: 'resellerBps', label: 'Reseller share (bps — 9000 = 90 %)' },
    { key: 'payoutHoldDays', label: 'Payout hold (days)' },
    { key: 'aiFreeCredits', label: 'AI credits — Free / month' },
    { key: 'aiProCredits', label: 'AI credits — Pro / month' },
  ];

  return (
    <Card padded>
      <div className="mb-4 text-sm font-semibold text-zinc-200">Business model</div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <input
              className="input !py-2 text-sm"
              type="number"
              value={form[f.key] ?? 0}
              onChange={(e) => set(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <FormError error={error} />
      <div className="mt-4 flex items-center justify-end gap-3">
        {saved ? <span className="text-xs text-emerald-400">Saved ✓</span> : null}
        <button className="btn-primary !py-2" onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </Card>
  );
}
