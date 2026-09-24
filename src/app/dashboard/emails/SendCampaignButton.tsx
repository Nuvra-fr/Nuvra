'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { sendCampaignAction } from '@/server/actions/crm';
import { FormError } from '@/components/auth';

export default function SendCampaignButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        className="btn-primary !px-3 !py-1.5 !text-xs"
        disabled={pending}
        onClick={() => {
          if (!confirm('Send this campaign to the selected segment now?')) return;
          startTransition(async () => {
            const res = await sendCampaignAction(id);
            if (!res.ok) setError(res.error);
            else router.refresh();
          });
        }}
      >
        <Send className="h-3.5 w-3.5" /> {pending ? 'Sending…' : 'Send'}
      </button>
      <FormError error={error} />
    </div>
  );
}
