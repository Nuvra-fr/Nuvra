'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { submitListingAction } from '@/server/actions/marketplace';
import { FormError } from '@/components/auth';

export default function SubmitListingButton({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (courses.length === 0) return null;

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await submitListingAction(courseId);
      if (!res.ok) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Submit listing
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">Submit to marketplace</h2>
            <p className="mt-1 text-xs text-zinc-500">Only published courses can be listed. Moderation reviews every submission.</p>
            <div className="mt-4">
              <label className="label">Course</label>
              <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit} disabled={pending}>
                {pending ? 'Submitting…' : 'Submit for review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
