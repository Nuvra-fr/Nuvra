'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { refundOrderAction } from '@/server/actions/payments';
import { FormError } from '@/components/auth';

export default function RembourserButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Demande client');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        className="btn-secondary !py-2 !text-xs"
        onClick={() => setOpen(true)}
      >
        Rembourser
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">
              Rembourser cette commande ?
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              L&apos;écriture inverse est proportionnelle à la répartition
              d&apos;origine. Un remboursement total révoque l&apos;accès à la
              formation accordé par cette commande.
            </p>
            <div className="mt-4">
              <label className="label">Reason</label>
              <input
                className="input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <FormError error={error} />
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>
                Annuler
              </button>
              <button
                className="btn-danger"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await refundOrderAction(orderId, reason);
                    if (!res.ok) setError(res.error);
                    else {
                      setOpen(false);
                      router.refresh();
                    }
                  })
                }
              >
                {pending
                  ? 'Remboursering…'
                  : 'Confirmer le remboursement total'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
