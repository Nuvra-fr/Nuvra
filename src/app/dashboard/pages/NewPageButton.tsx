'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createPageAction } from '@/server/actions/builder';
import { FormError } from '@/components/auth';

export default function NewPageButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('LANDING');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createPageAction({ title, type });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.push(`/dashboard/pages/${res.id}`);
      router.refresh();
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New page
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">Create a page</h2>
            <div className="mt-4">
              <label className="label" htmlFor="np-title">Title</label>
              <input
                id="np-title"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summer launch"
                autoFocus
              />
            </div>
            <div className="mt-3">
              <label className="label" htmlFor="np-type">Type</label>
              <select id="np-type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="LANDING">Landing page</option>
                <option value="LINKINBIO">Nuvra Link (bio page)</option>
                <option value="CUSTOM">Custom page</option>
              </select>
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit} disabled={pending || title.trim().length < 2}>
                {pending ? 'Creating…' : 'Create & edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
