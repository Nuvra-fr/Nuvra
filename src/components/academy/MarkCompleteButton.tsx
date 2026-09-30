'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckCircle2, Loader2, RotateCcw, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  markLessonCompleteAction,
  unmarkLessonCompleteAction,
} from '@/server/actions/academy';

export default function MarkCompleteButton({
  lessonId,
  completed,
  nextHref,
  completedLabel = 'Leçon terminée',
  pendingLabel = 'Marquer comme terminée',
}: {
  lessonId: string;
  completed: boolean;
  nextHref: string | null;
  completedLabel?: string;
  pendingLabel?: string;
}) {
  const [isDone, setIsDone] = useState(completed);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function mark() {
    setError(null);
    start(async () => {
      const res = await markLessonCompleteAction(lessonId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setIsDone(true);
      router.refresh();
    });
  }

  function unmark() {
    setError(null);
    start(async () => {
      const res = await unmarkLessonCompleteAction(lessonId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setIsDone(false);
      router.refresh();
    });
  }

  if (isDone) {
    return (
      <div className="space-y-2">
        <div
          className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span className="text-sm font-medium text-emerald-200">
            {completedLabel}
          </span>
          {nextHref ? (
            <a href={nextHref} className="btn-primary btn-sm ml-auto">
              Leçon suivante
            </a>
          ) : null}
          <button
            type="button"
            onClick={unmark}
            disabled={pending}
            className="btn-ghost btn-sm"
            title="Annuler la validation"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Undo2 className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">Annuler la validation</span>
          </button>
        </div>
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={mark}
        disabled={pending}
        className={cn('btn-primary w-full justify-center sm:w-auto')}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {pendingLabel}
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

export function QuizRetryHint({ attempts }: { attempts: number }) {
  if (attempts <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
      <RotateCcw className="h-3 w-3" /> {attempts} tentative{attempts > 1 ? 's' : ''}
    </span>
  );
}
