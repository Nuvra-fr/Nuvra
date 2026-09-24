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
          ? 'btn-ghost !px-2.5 !py-1 !text-xs !text-emerald-300'
          : 'btn-ghost !px-2.5 !py-1 !text-xs !text-red-300'
      }
      disabled={pending}
      onClick={() => {
        if (action === 'paid' && !confirm('Mark this payout as PAID? This writes ledger debits.')) return;
        startTransition(async () => {
          const res = await adminPayoutAction(payoutId, action);
          if (res.ok) router.refresh();
          else alert(res.error);
        });
      }}
    >
      {pending ? '…' : action === 'paid' ? 'Mark paid' : 'Fail'}
    </button>
  );
}
