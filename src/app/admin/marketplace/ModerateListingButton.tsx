'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminModerateListingAction } from '@/server/actions/admin';

export default function ModerateListingButton({
  id,
  action,
  label,
}: {
  id: string;
  action: 'APPROVED' | 'REJECTED';
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className={
        action === 'APPROVED'
          ? 'btn-ghost !px-2.5 !py-1 !text-xs !text-emerald-300'
          : 'btn-ghost !px-2.5 !py-1 !text-xs !text-red-300'
      }
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await adminModerateListingAction(id, action);
          if (res.ok) router.refresh();
          else alert(res.error);
        })
      }
    >
      {pending ? '…' : label}
    </button>
  );
}
