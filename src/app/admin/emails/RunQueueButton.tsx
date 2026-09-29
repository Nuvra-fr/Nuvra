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
      title="Traiter maintenant les emails programmés (normalement géré par le cron CRON_SECRET)"
    >
      <Zap className="h-4 w-4" />{' '}
      {pending ? 'Traitement…' : 'Traiter la file maintenant'}
    </button>
  );
}
