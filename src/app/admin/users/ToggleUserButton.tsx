'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminToggleUserAction } from '@/server/actions/admin';

export default function ToggleUserButton({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className={
        status === 'ACTIVE'
          ? 'btn-ghost btn-sm !text-red-300'
          : 'btn-ghost btn-sm !text-emerald-300'
      }
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await adminToggleUserAction(
            userId,
            status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
          );
          if (res.ok) router.refresh();
        })
      }
    >
      {pending ? '…' : status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
    </button>
  );
}
