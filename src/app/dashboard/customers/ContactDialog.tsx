'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { upsertContactAction } from '@/server/actions/crm';
import { FormError } from '@/components/auth';

export default function ContactDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await upsertContactAction({ email, name });
      if (!res.ok) setError(res.error);
      else {
        setOpen(false);
        setEmail('');
        setName('');
        router.refresh();
      }
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add contact
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">Add contact</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="label">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit} disabled={pending || !email.trim()}>
                {pending ? 'Saving…' : 'Add contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
