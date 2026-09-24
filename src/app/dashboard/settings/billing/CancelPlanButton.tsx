'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelPlanAction } from '@/server/actions/billing';
import { FormError } from '@/components/auth';

export default function CancelPlanButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button className="btn-secondary !py-2 !text-xs" onClick={() => setOpen(true)}>
        Cancel subscription
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">Cancel Nuvra Pro?</h2>
            <p className="mt-2 text-sm text-zinc-500">
              You&apos;ll move back to the Free plan: the 10 % platform commission applies again to your
              sales. Your data, pages, courses and customers stay untouched — canceling is always
              possible, no retention tricks.
            </p>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Keep Pro</button>
              <button
                className="btn-danger"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await cancelPlanAction();
                    if (!res.ok) setError(res.error);
                    else {
                      setOpen(false);
                      router.refresh();
                    }
                  })
                }
              >
                {pending ? 'Canceling…' : 'Cancel subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
