'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';
import { markLessonCompleteAction } from '@/server/actions/courses';

export default function CompleteLessonButton({
  courseId,
  lessonId,
  done,
}: {
  courseId: string;
  lessonId: string;
  done: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
        <CheckCircle2 className="h-4 w-4" /> Completed
      </span>
    );
  }

  return (
    <button
      className="btn-secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markLessonCompleteAction(courseId, lessonId);
          router.refresh();
        })
      }
    >
      <Circle className="h-4 w-4" />
      {pending ? 'Saving…' : 'Mark complete'}
    </button>
  );
}
