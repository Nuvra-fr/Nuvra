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
      const res = await createCourseAction({ title, price: parseFloat(price || '0') });
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
        <Plus className="h-4 w-4" /> New course
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">Create a course</h2>
            <div className="mt-4">
              <label className="label">Course title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Email marketing that converts"
                autoFocus
              />
            </div>
            <div className="mt-3">
              <label className="label">Price (USD)</label>
              <input className="input" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              <p className="mt-1 text-[11px] text-zinc-600">Set 0 for a free course.</p>
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit} disabled={pending || title.trim().length < 2}>
                {pending ? 'Creating…' : 'Create course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
