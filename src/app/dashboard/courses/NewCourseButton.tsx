'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { createCourseAction } from '@/server/actions/courses';
import { FormError } from '@/components/auth';

export default function NewCourseButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('49');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (searchParams.get('new') === '1') setOpen(true);
  }, [searchParams]);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createCourseAction({
        title,
        price: parseFloat(price || '0'),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.push(`/dashboard/courses/${res.id}/curriculum`);
      router.refresh();
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nouvelle formation
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">
              Créer une formation
            </h2>
            <div className="mt-4">
              <label className="label">Titre de la formation</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Email marketing qui convertit"
                autoFocus
              />
            </div>
            <div className="mt-3">
              <label className="label">Prix (USD)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-zinc-600">
                Mettez 0 pour une formation gratuite.
              </p>
            </div>
            <FormError error={error} />
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={submit}
                disabled={pending || title.trim().length < 2}
              >
                {pending ? 'Creating…' : 'Créer la formation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
