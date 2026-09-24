'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2 } from 'lucide-react';
import { deleteContactAction, updateContactAction } from '@/server/actions/crm';
import { FormError } from '@/components/auth';
import { StatusBadge, Badge } from '@/components/ui';
import { formatCents } from '@/lib/money';
import { formatDateTime } from '@/lib/utils';

export default function ContactDrawer({
  contact,
  activities,
  orders,
}: {
  contact: { id: string; email: string; name: string; status: string; tags: string[]; notes: string; phone: string };
  activities: { id: string; type: string; summary: string | null; createdAt: string }[];
  orders: { id: string; number: string; totalCents: number; status: string; mode: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(contact);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function close() {
    router.push('/dashboard/customers');
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateContactAction(contact.id, {
        name: form.name,
        status: form.status,
        tags: form.tags,
        notes: form.notes,
        phone: form.phone,
      });
      if (!res.ok) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="absolute inset-0" onClick={close} />
      <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-ink-900 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-600">Contact</div>
            <h2 className="text-lg font-semibold text-zinc-100">{form.name || form.email}</h2>
          </div>
          <button className="btn-ghost !p-1.5" onClick={close} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name</label>
              <input className="input !py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input !py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="LEAD">Lead</option>
                <option value="CUSTOMER">Customer</option>
                <option value="STUDENT">Student</option>
                <option value="UNSUBSCRIBED">Unsubscribed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input !py-2 text-sm" value={form.email} readOnly />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input !py-2 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              className="input !py-2 text-sm"
              value={form.tags.join(', ')}
              onChange={(e) =>
                setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
              }
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input !py-2 text-sm" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <FormError error={error} />

        <div className="mt-4 flex items-center justify-between">
          <button
            className="btn-danger !py-2 !text-xs"
            disabled={pending}
            onClick={() => {
              if (!confirm('Delete this contact?')) return;
              startTransition(async () => {
                const res = await deleteContactAction(contact.id);
                if (!res.ok) setError(res.error);
                else close();
              });
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <div className="flex items-center gap-3">
            {saved ? <span className="text-xs text-emerald-400">Saved ✓</span> : null}
            <button className="btn-primary !py-2" onClick={save} disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-white/[0.07] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Orders</h3>
          {orders.length === 0 ? (
            <p className="mt-2 text-xs text-zinc-600">No orders.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border border-white/[0.07] px-3 py-2 text-xs">
                  <span className="text-zinc-300">{o.number}</span>
                  <span className="tabular-nums text-zinc-400">{formatCents(o.totalCents)}</span>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-white/[0.07] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Activity</h3>
          <div className="mt-2 space-y-2">
            {activities.length === 0 ? (
              <p className="text-xs text-zinc-600">No activity yet.</p>
            ) : (
              activities.map((a) => (
                <div key={a.id} className="rounded-lg border border-white/[0.06] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <Badge>{a.type}</Badge>
                    <span className="text-[10px] text-zinc-600">{formatDateTime(a.createdAt)}</span>
                  </div>
                  {a.summary ? <div className="mt-1 text-xs text-zinc-500">{a.summary}</div> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
