'use client';

import { useEffect, useState, useTransition } from 'react';
import { Check, Loader2, NotebookPen, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveSubmissionAction } from '@/server/actions/academy';

export interface WorkspaceField {
  id: string;
  label: string;
  hint?: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface WorkspacePayload {
  values: Record<string, string>;
  savedAt: string | null;
}

function read(key: string): WorkspacePayload {
  if (typeof window === 'undefined') return { values: {}, savedAt: null };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { values: {}, savedAt: null };
    return JSON.parse(raw) as WorkspacePayload;
  } catch {
    return { values: {}, savedAt: null };
  }
}

/**
 * Private learner workspace: worksheet answers and notes.
 *
 * Two layers on purpose —
 *   1. localStorage keeps the text while the learner types and works offline;
 *   2. the server action stores it in the database (academy_submissions), so
 *      the work follows the student across devices and is visible in Admin.
 */
export default function LessonWorkspace({
  storageKey,
  lessonId,
  kind,
  title,
  description,
  fields,
  initial,
}: {
  storageKey: string;
  lessonId: string | null;
  kind: 'WORKSHOP' | 'EXERCISE' | 'NOTE';
  title: string;
  description?: string;
  fields: WorkspaceField[];
  initial: WorkspacePayload;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial.values ?? {});
  const [savedAt, setSavedAt] = useState<string | null>(initial.savedAt);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pending, start] = useTransition();

  useEffect(() => {
    const local = read(storageKey);
    // Server copy wins only for fields the learner has not edited locally.
    setValues((prev) => {
      const merged = { ...(initial.values ?? {}) };
      for (const [k, v] of Object.entries(local.values)) {
        if (v && !merged[k]) merged[k] = v;
      }
      return Object.keys(prev).length ? { ...prev, ...merged } : merged;
    });
    if (initial.savedAt) setSavedAt(initial.savedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  function update(id: string, value: string) {
    const next = { ...values, [id]: value };
    setValues(next);
    setStatus('idle');
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ values: next, savedAt }));
    } catch {
      /* quota / private mode — the server copy is the source of truth */
    }
  }

  function save() {
    setStatus('saving');
    start(async () => {
      const res = await saveSubmissionAction({ kind, lessonId, title, payload: values });
      if (!res.ok) {
        setStatus('error');
        return;
      }
      setSavedAt(res.data.updatedAt);
      setStatus('saved');
    });
  }

  const filled = fields.filter((f) => (values[f.id] ?? '').trim().length > 0).length;

  return (
    <section className="card overflow-hidden" aria-label={title}>
      <div className="card-head">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-nuvra-400" /> {title}
          </h2>
          {description ? (
            <p className="section-subtitle">{description}</p>
          ) : null}
        </div>
        {fields.length > 0 ? (
          <span className="text-xs text-zinc-500">
            {filled}/{fields.length} renseigné{filled > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>
      <div className="card-body space-y-4">
        {fields.map((f) =>
          f.multiline ? (
            <label key={f.id} className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-200">{f.label}</span>
              {f.hint ? <span className="block text-xs text-zinc-500">{f.hint}</span> : null}
              <textarea
                value={values[f.id] ?? ''}
                onChange={(e) => update(f.id, e.target.value)}
                placeholder={f.placeholder}
                rows={4}
                className="w-full rounded-xl border border-white/[0.1] bg-ink-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition duration-200 placeholder:text-zinc-600 focus:border-nuvra-500/60"
              />
            </label>
          ) : (
            <label key={f.id} className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-200">{f.label}</span>
              {f.hint ? <span className="block text-xs text-zinc-500">{f.hint}</span> : null}
              <input
                value={values[f.id] ?? ''}
                onChange={(e) => update(f.id, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-ink-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition duration-200 placeholder:text-zinc-600 focus:border-nuvra-500/60"
              />
            </label>
          ),
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={pending} className="btn-secondary btn-sm">
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : status === 'saved' ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Enregistrer
          </button>
          <span
            className={cn(
              'text-xs',
              status === 'error'
                ? 'text-red-300'
                : savedAt
                  ? 'text-zinc-500'
                  : 'text-zinc-600',
            )}
            role="status"
          >
            {status === 'error'
              ? 'Enregistrement impossible — réessayez.'
              : savedAt
                ? `Enregistré le ${new Date(savedAt).toLocaleString('fr-FR')}`
                : 'Non enregistré'}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-600">
          Ce bloc est privé : il n&apos;est visible que par vous et par
          l&apos;administration de Nuvra.
        </p>
      </div>
    </section>
  );
}
