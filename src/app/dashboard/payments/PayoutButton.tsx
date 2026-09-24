'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { requestPayoutAction } from '@/server/actions/payments';
import { formatCents } from '@/lib/money';
import type { LedgerAccount } from '@/lib/constants';
import { FormError } from '@/components/auth';

export default function PayoutButton({
  account,
  available,
  min,
  mode,
}: {
  account: string;
  available: number;
  min: number;
  mode: 'LIVE' | 'TEST';
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const disabled = available < min;

  return (
    <div>
      <FormError error={error} />
      <button
        className="btn-primary !py-2 !text-xs w-full"
        disabled={pending || disabled}
        title={disabled ? `Minimum payout is ${formatCents(min)}` : undefined}
        onClick={() =>
          startTransition(async () => {
            const res = await requestPayoutAction(account as LedgerAccount, mode);
            if (!res.ok) setError(res.error);
            else router.refresh();
          })
        }
      >
        {pending ? 'Requesting…' : `Request payout (${formatCents(available)})`}
      </button>
      {disabled ? (
        <p className="mt-1.5 text-center text-[10px] text-zinc-600">
          Minimum payout {formatCents(min)}
        </p>
      ) : null}
    </div>
  );
}
