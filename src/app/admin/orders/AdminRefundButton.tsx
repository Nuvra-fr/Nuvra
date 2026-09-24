'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminRefundAction } from '@/server/actions/admin';

export default function AdminRefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn-ghost !px-2.5 !py-1 !text-xs !text-red-300"
      disabled={pending}
      onClick={() => {
        if (!confirm('Refund this order? The ledger will be reversed proportionally.')) return;
        startTransition(async () => {
          const res = await adminRefundAction(orderId);
          if (res.ok) router.refresh();
          else alert(res.error);
        });
      }}
    >
      {pending ? '…' : 'Refund'}
    </button>
  );
}
