'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upgradePlanAction } from '@/server/actions/billing';

export default function UpgradeButton({
  plan,
  label,
  disabled,
}: {
  plan: 'PRO' | 'BUSINESS' | 'AGENCY';
  label: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn-primary w-full"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          await upgradePlanAction(plan);
          router.refresh();
        })
      }
    >
      {pending ? 'Redirecting…' : label}
    </button>
  );
}
