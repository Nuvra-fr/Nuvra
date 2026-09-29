'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminPayoutAction } from '@/server/actions/admin';

export default function PayoutActionButton({
  payoutId,
  action,
}: {
  payoutId: string;
  action: 'paid' | 'failed';
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className={
        action === 'paid'
          ? 'btn-ghost btn-sm !text-emerald-300'
          : 'btn-ghost btn-sm !text-red-300'
      }
      disabled={pending}
      onClick={() => {
        if (
          action === 'paid' &&
          !confirm(
            'Marquer ce versement comme PAYÉ ? Cela écrit des débits au grand livre.',
          )
        )
          return;
        startTransition(async () => {
          const res = await adminPayoutAction(payoutId, action);
          if (res.ok) router.refresh();
          else alert(res.error);
        });
      }}
    >
      {pending ? '…' : action === 'paid' ? 'Marquer payé' : 'Fail'}
    </button>
  );
}
