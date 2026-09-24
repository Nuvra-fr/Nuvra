'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveWorkspaceSettingsAction } from '@/server/actions/workspace';
import { FormError } from '@/components/auth';

export default function WorkspaceForm({
  initialName,
  initialSlug,
  username,
}: {
  initialName: string;
  initialSlug: string;
  username: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [handle, setHandle] = useState(username);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveWorkspaceSettingsAction({ name, slug, username: handle });
      if (!res.ok) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="card p-5">
      <div className="mb-4 text-sm font-semibold text-zinc-200">Workspace</div>
      <div className="space-y-3.5">
        <div>
          <label className="label">Workspace name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Storefront slug</label>
          <input className="input" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} />
          <p className="mt-1 text-[11px] text-zinc-600">Store URL: /s/{slug}</p>
        </div>
        <div>
          <label className="label">Nuvra Link handle</label>
          <input className="input" value={handle} onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))} />
          <p className="mt-1 text-[11px] text-zinc-600">Public profile: /@{handle}</p>
        </div>
      </div>
      <FormError error={error} />
      <div className="mt-4 flex items-center justify-end gap-3">
        {saved ? <span className="text-xs text-emerald-400">Saved ✓</span> : null}
        <button className="btn-primary !py-2" onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
