'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createAffiliateProgramAction } from '@/server/actions/affiliates';
import { FormError } from '@/components/auth';

export default function NewAffiliateProgramButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [percent, setPercent] = useState('30');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createAffiliateProgramAction({
        name,
        commissionBps: Math.round((parseFloat(percent || '0') || 0) * 100),
      });
      if (!res.ok) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nouveau programme
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">
              Créer un programme d’affiliation
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Nom du programme</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Partenaires de formation autoFocus"
                />
              </div>
              <div>
                <label className="label">Commission %</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="90"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                />
              </div>
            </div>
            <FormError error={error} />
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={submit}
                disabled={pending || !name.trim()}
              >
                {pending ? 'Creating…' : 'Créer le programme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
