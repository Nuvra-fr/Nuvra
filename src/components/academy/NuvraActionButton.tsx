'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NuvraActionPayload {
  action: string;
  label: string;
  route: string;
  requiredEntity: string;
  completionCheck?: string;
  hint?: string;
  successLabel?: string;
  returnTo?: string;
}

/**
 * Nuvra Action — a real builder launch with a real completion check.
 *
 * The button opens the actual Nuvra route, waits for the learner to come
 * back, then asks the server whether the object now exists in their
 * workspace. Nothing turns green on optimism.
 */
export default function NuvraActionButton({
  action,
  returnTo,
  compact = false,
}: {
  action: NuvraActionPayload;
  returnTo: string;
  compact?: boolean;
}) {
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const router = useRouter();

  const check = useCallback(async () => {
    if (!action.completionCheck) return;
    setChecking(true);
    try {
      const res = await fetch(
        `/api/academy/actions?check=${encodeURIComponent(action.completionCheck)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { done: boolean; detail: string };
      setDone(data.done);
      setDetail(data.detail);
      if (data.done) router.refresh();
    } finally {
      setChecking(false);
    }
  }, [action.completionCheck, router]);

  useEffect(() => {
    void check();
  }, [check]);

  // When the learner returns from the builder, re-verify automatically.
  useEffect(() => {
    function onFocus() {
      void check();
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [check]);

  const href = `${action.route}${action.route.includes('?') ? '&' : '?'}return=${encodeURIComponent(returnTo)}`;

  return (
    <div
      className={cn(
        'rounded-2xl border',
        done
          ? 'border-emerald-500/30 bg-emerald-500/[0.07]'
          : 'border-nuvra-500/25 bg-nuvra-500/[0.07]',
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-start gap-3',
          compact ? 'p-3' : 'p-4 sm:p-5',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            done ? 'bg-emerald-500/15' : 'bg-nuvra-500/15',
          )}
        >
          {done ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-300" />
          ) : (
            <ExternalLink className="h-4 w-4 text-nuvra-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'eyebrow',
              done ? 'text-emerald-300/80' : 'text-nuvra-300/80',
            )}
          >
            Action Nuvra{action.action ? ` · ${action.action}` : ''}
          </div>
          <p
            className={cn(
              'mt-1 text-sm font-semibold',
              done ? 'text-emerald-100' : 'text-zinc-100',
            )}
          >
            {done ? action.successLabel ?? 'Objectif vérifié' : action.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            {done
              ? detail ?? `Vérifié : ${action.requiredEntity}`
              : `${action.requiredEntity}. ${action.hint ?? ''}`}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(done ? 'btn-ghost btn-sm' : 'btn-primary btn-sm')}
            >
              {done ? 'Ouvrir dans Nuvra' : action.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            {action.completionCheck ? (
              <button
                type="button"
                onClick={check}
                disabled={checking}
                className="btn-ghost btn-sm"
                title="Vérifier à nouveau"
              >
                {checking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCw className="h-3.5 w-3.5" />
                )}
                Vérifier
              </button>
            ) : null}
            <a href={returnTo} className="btn-ghost btn-sm">
              Revenir à la leçon
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
