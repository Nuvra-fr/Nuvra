'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createCampaignAction } from '@/server/actions/crm';
import { FormError } from '@/components/auth';

export default function NewCampaignDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '', segment: 'ALL' });
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
        <Plus className="h-4 w-4" /> New campaign
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">New email campaign</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Internal name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Launch week" />
              </div>
              <div>
                <label className="label">Subject</label>
                <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label className="label">Segment</label>
                <select className="input" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                  <option value="ALL">Everyone</option>
                  <option value="LEADS">Leads</option>
                  <option value="CUSTOMERS">Customers</option>
                  <option value="STUDENTS">Students</option>
                </select>
              </div>
              <div>
                <label className="label">Body (use {'{{name}}'} for personalization)</label>
                <textarea className="input" rows={7} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              </div>
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit} disabled={pending || !form.name || !form.subject}>
                {pending ? 'Creating…' : 'Create campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
