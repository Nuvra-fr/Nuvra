'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Rocket } from 'lucide-react';
import { addFunnelStepAction, setFunnelStatusAction } from '@/server/actions/builder';
import { FormError } from '@/components/auth';

export function FunnelClientActions({
  funnelId,
  status,
  stepOptions,
}: {
  funnelId: string;
  status: string;
  stepOptions: string[][];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [stepType, setStepType] = useState('UPSELL');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  function toggleStatus() {
    setError(null);
    startTransition(async () => {
      const res = await setFunnelStatusAction(funnelId, status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED');
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  function addStep() {
    setError(null);
    startTransition(async () => {
      const res = await addFunnelStepAction(funnelId, stepType, title || stepType);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setAddOpen(false);
      setTitle('');
      router.refresh();
    });
  }

  return (
    <>
      <button className="btn-secondary" onClick={() => setAddOpen((o) => !o)}>
        <Plus className="h-4 w-4" /> Add step
      </button>
      <button className={status === 'PUBLISHED' ? 'btn-secondary' : 'btn-primary'} onClick={toggleStatus} disabled={pending}>
        <Rocket className="h-4 w-4" />
        {status === 'PUBLISHED' ? 'Unpublish funnel' : 'Publish funnel'}
      </button>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">Add funnel step</h2>
            <div className="mt-4">
              <label className="label">Step type</label>
              <select className="input" value={stepType} onChange={(e) => setStepType(e.target.value)}>
                {stepOptions.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label className="label">Page title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="One-time offer" />
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={addStep} disabled={pending}>
                {pending ? 'Adding…' : 'Add step'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
