'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addDomainAction, removeDomainAction } from '@/server/actions/workspace';
import { FormError } from '@/components/auth';
import { StatusBadge } from '@/components/ui';

export default function DomainForm({ domains }: { domains: { id: string; domain: string; status: string }[] }) {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          className="input !w-72"
          placeholder="academy.yoursite.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button
          className="btn-secondary"
          disabled={pending || !domain.includes('.')}
          onClick={() =>
            startTransition(async () => {
              const res = await addDomainAction(domain);
              if (!res.ok) setError(res.error);
              else {
                setDomain('');
                router.refresh();
              }
            })
          }
        >
          Add domain
        </button>
      </div>
      <FormError error={error} />
      {domains.length > 0 && (
        <div className="mt-4 space-y-2">
          {domains.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-white/[0.07] px-3.5 py-2.5">
              <code className="text-xs text-zinc-300">{d.domain}</code>
              <div className="flex items-center gap-2">
                <StatusBadge status={d.status} />
                <button
                  className="btn-ghost !px-2 !py-1 !text-xs"
                  onClick={() =>
                    startTransition(async () => {
                      await removeDomainAction(d.id);
                      router.refresh();
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-zinc-600">
        DNS setup: point a CNAME to your Nuvra deployment, then verification marks the domain ACTIVE.
        Domain connection is a Nuvra Pro feature.
      </p>
    </div>
  );
}
