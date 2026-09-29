import Link from 'next/link';
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Programme outline — the step between the Académie cover and the lessons.
 *
 * One row per module: number, title, lesson count and completion. Rows are links
 * once the learner owns the programme; in preview mode they are plain rows so the
 * hierarchy stays honest (nothing looks clickable that is not).
 */
export interface OutlineModule {
  id: string;
  title: string;
  lessonCount: number;
  /** Completed lessons in this module (learning mode only). */
  doneCount?: number;
  /** First lesson of the module — omit in preview mode to render a static row. */
  href?: string;
  /** Learner does not own the programme yet: show the lock, not the affordance. */
  locked?: boolean;
}

export function ProgramOutline({
  modules,
  className,
}: {
  modules: OutlineModule[];
  className?: string;
}) {
  if (modules.length === 0) return null;

  return (
    <ol className={cn('divide-y divide-white/[0.05]', className)}>
      {modules.map((m, i) => {
        const done = m.doneCount ?? 0;
        const complete = m.lessonCount > 0 && done >= m.lessonCount;
        const rowClass = cn(
          'group flex items-center gap-4 px-5 py-3.5 transition duration-200 ease-smooth',
          m.href && 'hover:bg-white/[0.025]',
        );
        const inner = (
          <>
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold tabular-nums transition-colors',
                complete
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/[0.09] bg-white/[0.03] text-zinc-500',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-zinc-200">
                {m.title}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                {m.lessonCount} {m.lessonCount === 1 ? 'leçon' : 'leçons'}
                {m.doneCount !== undefined && m.doneCount > 0
                  ? ` · ${m.doneCount} terminée${m.doneCount > 1 ? 's' : ''}`
                  : ''}
              </span>
            </span>

            {complete ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : m.href ? (
              <span className="shrink-0 text-xs text-zinc-600 transition-colors group-hover:text-nuvra-300">
                Ouvrir →
              </span>
            ) : m.locked ? (
              <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
            ) : null}
          </>
        );
        return (
          <li key={m.id}>
            {m.href ? (
              <Link href={m.href} className={rowClass}>
                {inner}
              </Link>
            ) : (
              <div className={rowClass}>{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
