'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createCampaignAction } from '@/server/actions/crm';
import { FormError } from '@/components/auth';

export default function NewCampaignDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
    segment: 'ALL',
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createCampaignAction(form);
      if (!res.ok) setError(res.error);
      else {
        setOpen(false);
        setForm({ name: '', subject: '', body: '', segment: 'ALL' });
        router.refresh();
      }
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nouvelle campagne
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">
              Nouvelle campagne email
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Nom interne</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Semaine de lancement"
                />
              </div>
              <div>
                <label className="label">Objet</label>
                <input
                  className="input"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Segment</label>
                <select
                  className="input"
                  value={form.segment}
                  onChange={(e) =>
                    setForm({ ...form, segment: e.target.value })
                  }
                >
                  <option value="ALL">Everyone</option>
                  <option value="LEADS">Prospects</option>
                  <option value="CUSTOMERS">Clients</option>
                  <option value="STUDENTS">Élèves</option>
                </select>
              </div>
              <div>
                <label className="label">
                  Body (use {'{{name}}'} for personalization)
                </label>
                <textarea
                  className="input"
                  rows={7}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
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
                disabled={pending || !form.name || !form.subject}
              >
                {pending ? 'Creating…' : 'Créer la campagne'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
