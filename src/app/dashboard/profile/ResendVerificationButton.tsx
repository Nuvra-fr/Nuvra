'use client';

import { useState, useTransition } from 'react';
import { sendVerificationEmailAction } from '@/server/actions/profile';

export default function ResendVerificationButton() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return <span className="text-[11px] text-emerald-400">Sent ✓</span>;

  return (
    <button
      className="text-[11px] text-nuvra-400 hover:underline disabled:opacity-50"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await sendVerificationEmailAction();
          if (res.ok) setDone(true);
        })
      }
    >
      {pending ? 'Sending…' : 'Send link'}
    </button>
  );
}
