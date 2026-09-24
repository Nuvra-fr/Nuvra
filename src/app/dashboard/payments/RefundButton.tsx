'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { refundOrderAction } from '@/server/actions/payments';
import { FormError } from '@/components/auth';

export default function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Customer request');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button className="btn-secondary !py-2 !text-xs" onClick={() => setOpen(true)}>
        Refund
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">Refund this order?</h2>
            <p className="mt-2 text-sm text-zinc-500">
              The ledger reversal is proportional to the original split. Course access granted by
              this order is revoked on a full refund.
            </p>
            <div className="mt-4">
              <label className="label">Reason</label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
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
                {pending ? 'Refunding…' : 'Confirm full refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
