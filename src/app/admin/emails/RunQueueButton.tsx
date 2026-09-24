'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { adminRunEmailQueueAction } from '@/server/actions/admin';

export default function RunQueueButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn-secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await adminRunEmailQueueAction();
          if (!res.ok) alert(res.error);
          else router.refresh();
        })
      }
      title="Processes due scheduled emails now (normally handled by CRON_SECRET cron)"
    >
      <Zap className="h-4 w-4" /> {pending ? 'Running…' : 'Run queue now'}
    </button>
  );
}
