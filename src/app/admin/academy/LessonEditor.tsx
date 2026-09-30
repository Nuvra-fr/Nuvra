'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { adminGetLessonDraftAction, adminUpdateLessonAction } from '@/server/actions/academy';

interface Draft {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  objectives: string[];
  resources: { title: string; kind: string; description: string; href: string | null }[];
  exercise: string;
  difficulty: string;
  durationMin: number;
  type: string;
  isPreview: boolean;
  published: boolean;
}

const KINDS = ['CHECKLIST', 'TEMPLATE', 'WORKBOOK', 'LINK', 'SCRIPT'] as const;

function toLines(d: Draft): {
  objectives: string;
  resources: string;
} {
  return {
    objectives: d.objectives.join('\n'),
    resources: d.resources
      .map((r) => [r.title, r.kind, r.description, r.href ?? ''].join(' | '))
      .join('\n'),
  };
}

/**
 * Lesson editor — the CMS side of the Academy.
 *
 * Everything the learner reads is editable here and stored in the database:
 * title, pitch, body (the sectioned markdown built by the content pipeline),
 * objectives, exercise, resources and publication. Nothing is stored in React.
 */
export default function LessonEditor({
  lessonId,
  onClose,
}: {
  lessonId: string;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    content: '',
    objectives: '',
    resources: '',
    exercise: '',
    difficulty: 'beginner',
    durationMin: 8,
    type: 'text',
    isPreview: false,
    published: true,
  });

  const fetchDraft = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await adminGetLessonDraftAction(lessonId);
    if (!res.ok) {
      setError(res.error ?? 'Leçon illisible');
      setLoading(false);
      return;
    }
    const d = res.data;
    setForm({
      title: d.title,
      shortDescription: d.shortDescription,
      content: d.content,
      exercise: d.exercise,
      difficulty: d.difficulty,
      durationMin: d.durationMin,
      type: d.type,
      isPreview: d.isPreview,
      published: d.published,
      ...toLines(d),
    });
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    setSaved(false);
    void fetchDraft();
  }, [fetchDraft]);

  function reload() {
    start(async () => {
      await fetchDraft();
    });
  }

  function save() {
    setError(null);
    setSaved(false);
    const objectives = form.objectives
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 10);
    const resources = form.resources
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((line) => {
        const [title = '', kind = 'TEMPLATE', description = '', href = ''] = line
          .split('|')
          .map((p) => p.trim());
        return {
          title,
          kind: (KINDS as readonly string[]).includes(kind)
            ? (kind as (typeof KINDS)[number])
            : ('TEMPLATE' as const),
          description,
          href: href || undefined,
        };
      })
      .filter((r) => r.title && r.description);
    start(async () => {
      const res = await adminUpdateLessonAction(lessonId, {
        title: form.title,
        shortDescription: form.shortDescription,
        content: form.content,
        objectives,
        resources,
        exercise: form.exercise,
        difficulty: form.difficulty as 'beginner' | 'intermediate' | 'advanced',
        durationMin: Number(form.durationMin) || 0,
        type: form.type,
        isPreview: form.isPreview,
        published: form.published,
      });
      if (!res.ok) {
        setError(res.error ?? 'Enregistrement impossible');
        return;
      }
      setSaved(true);
    });
  }

  const input =
    'w-full rounded-xl border border-white/[0.1] bg-ink-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-nuvra-500/60';

  return (
    <div className="mt-3 rounded-xl border border-nuvra-500/25 bg-ink-950/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-200">Éditer la leçon</h3>
        <button type="button" onClick={onClose} className="btn-ghost !p-1.5" aria-label="Fermer l’éditeur">
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement de la leçon…
        </p>
      ) : (
        <div className="space-y-3">
          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-title">
              Titre
            </label>
            <input
              id="le-title"
              className={input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-desc">
              Accroche (sous le titre)
            </label>
            <input
              id="le-desc"
              className={input}
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-content">
              Contenu de la leçon (markdown, sections ## )
            </label>
            <textarea
              id="le-content"
              rows={14}
              className={`${input} font-mono text-[13px] leading-relaxed`}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-obj">
                Objectifs (un par ligne)
              </label>
              <textarea
                id="le-obj"
                rows={4}
                className={input}
                value={form.objectives}
                onChange={(e) => setForm({ ...form, objectives: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-res">
                Ressources (Titre | KIND | description | lien)
              </label>
              <textarea
                id="le-res"
                rows={4}
                className={input}
                value={form.resources}
                onChange={(e) => setForm({ ...form, resources: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-zinc-600">
                KIND : {KINDS.join(', ')} · lien facultatif (/dashboard/… ou https)
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-ex">
              Exercice
            </label>
            <textarea
              id="le-ex"
              rows={4}
              className={input}
              value={form.exercise}
              onChange={(e) => setForm({ ...form, exercise: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-diff">
                Difficulté
              </label>
              <select
                id="le-diff"
                className={input}
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-dur">
                Durée (min)
              </label>
              <input
                id="le-dur"
                type="number"
                min={0}
                max={600}
                className={input}
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500" htmlFor="le-type">
                Type
              </label>
              <select
                id="le-type"
                className={input}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="text">Leçon</option>
                <option value="lab">Atelier</option>
                <option value="workshop">Workshop</option>
                <option value="quiz">Quiz</option>
                <option value="video">Vidéo</option>
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Publiée
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={form.isPreview}
                  onChange={(e) => setForm({ ...form, isPreview: e.target.checked })}
                />
                Aperçu public
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={save} disabled={pending} className="btn-primary btn-sm">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Enregistrer
            </button>
            <button type="button" onClick={reload} disabled={pending} className="btn-ghost btn-sm">
              Recharger
            </button>
            {saved ? (
              <span className="text-xs text-emerald-400">Enregistré — visible immédiatement côté apprenant.</span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
