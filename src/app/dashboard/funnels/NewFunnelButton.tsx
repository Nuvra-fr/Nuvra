'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createFunnelAction } from '@/server/actions/builder';
import { FormError } from '@/components/auth';

export default function NewFunnelButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createFunnelAction({ name, skeleton: true });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.push(`/dashboard/funnels/${res.id}`);
      router.refresh();
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New funnel
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">Create a funnel</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Nuvra creates a ready-made structure: Landing → Sales → Checkout → Thank you.
            </p>
            <div className="mt-4">
              <label className="label" htmlFor="fn-name">Funnel name</label>
              <input
                id="fn-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Course launch"
                autoFocus
              />
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit} disabled={pending || name.trim().length < 2}>
                {pending ? 'Creating…' : 'Create funnel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
