'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { enrollFreeAction } from '@/server/actions/checkout';
import { FormError } from '@/components/auth';

export default function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <FormError error={error} />
      <button
        className="btn-primary w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await enrollFreeAction(courseId);
            if (!res.ok) setError(res.error);
            else {
              router.push(`/dashboard/learn/${courseId}`);
              router.refresh();
            }
          })
        }
      >
        {pending ? 'Enrolling…' : 'Enroll for free'}
      </button>
    </div>
  );
}
