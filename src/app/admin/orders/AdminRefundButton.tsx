'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminRefundAction } from '@/server/actions/admin';

export default function AdminRefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn-ghost btn-sm !text-red-300"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            'Rembourser cette commande ? Le grand livre sera contre-passé au prorata.',
          )
        )
          return;
        startTransition(async () => {
          const res = await adminRefundAction(orderId);
          if (res.ok) router.refresh();
          else alert(res.error);
        });
      }}
    >
      {pending ? '…' : 'Rembourser'}
    </button>
  );
}
