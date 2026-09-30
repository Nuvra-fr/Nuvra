'use client';

import { useState, useTransition } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import LessonEditor from './LessonEditor';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import {
  adminCreateLessonAction,
  adminCreateModuleAction,
  adminDeleteLessonAction,
  adminDeleteModuleAction,
  adminMoveModuleAction,
  adminUpdateLessonAction,
  adminUpdateModuleAction,
} from '@/server/actions/academy';

export interface AdminLesson {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  type: string;
  durationMin: number;
  isPreview: boolean;
  hasQuiz: boolean;
  quizId: string | null;
  hasVideo: boolean;
  hasAction: boolean;
}

export interface AdminModule {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  published: boolean;
  position: number;
  lessons: AdminLesson[];
}

export default function CurriculumManager({
  courseId,
  modules,
  totalLessons,
}: {
  courseId: string;
  modules: AdminModule[];
  totalLessons: number;
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [newModule, setNewModule] = useState('');
  const [newLesson, setNewLesson] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? 'Action impossible');
    });
  }

  return (
    <div className="space-y-4">
      <section className="card card-body">
        <h2 className="section-title">Ajouter un module</h2>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newModule.trim()) return;
            const title = newModule.trim();
            run(async () => {
              const res = await adminCreateModuleAction({ title });
              if (res.ok) setNewModule('');
              return res;
            });
          }}
        >
          <input
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            placeholder="Titre du module"
            aria-label="Titre du nouveau module"
            className="min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-ink-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-nuvra-500/60"
          />
          <button type="submit" disabled={pending} className="btn-primary btn-sm">
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Créer
          </button>
        </form>
        <p className="mt-2 text-xs text-zinc-600">
          {modules.length} modules · {totalLessons} leçons. L&apos;ordre et la
          publication sont appliqués immédiatement.
        </p>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <ol className="space-y-3">
        {modules.map((m, i) => {
          const isOpen = open[m.id] ?? false;
          return (
            <li key={m.id} className="card overflow-hidden">
              <div className="card-head flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, [m.id]: !isOpen }))}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-semibold text-zinc-400">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-zinc-200">
                      {m.title}
                    </span>
                    <span className="text-[11px] text-zinc-600">
                      /{m.slug} · {m.lessons.length} leçons
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-zinc-600 transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                <div className="flex shrink-0 items-center gap-1.5">
                  {!m.published ? <Badge tone="amber">Brouillon</Badge> : null}
                  <button
                    type="button"
                    title="Monter"
                    aria-label={`Monter ${m.title}`}
                    disabled={i === 0 || pending}
                    onClick={() => run(() => adminMoveModuleAction(m.id, 'up'))}
                    className="btn-ghost !p-1.5"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Descendre"
                    aria-label={`Descendre ${m.title}`}
                    disabled={i === modules.length - 1 || pending}
                    onClick={() => run(() => adminMoveModuleAction(m.id, 'down'))}
                    className="btn-ghost !p-1.5"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title={m.published ? 'Dépublier' : 'Publier'}
                    aria-label={m.published ? 'Dépublier le module' : 'Publier le module'}
                    disabled={pending}
                    onClick={() =>
                      run(() => adminUpdateModuleAction(m.id, { published: !m.published }))
                    }
                    className="btn-ghost !p-1.5"
                  >
                    {m.published ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    title="Supprimer le module et ses leçons"
                    aria-label="Supprimer le module"
                    disabled={pending}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Supprimer « ${m.title} » et ses ${m.lessons.length} leçons ? La progression des apprenants est conservée dans l'historique.`,
                        )
                      ) {
                        run(() => adminDeleteModuleAction(m.id));
                      }
                    }}
                    className="btn-ghost !p-1.5 text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isOpen ? (
                <div className="border-t border-white/[0.07] p-3">
                  <div className="table-wrap">
                    <table className="data">
                      <thead>
                        <tr>
                          <th>Leçon</th>
                          <th>Type</th>
                          <th>Durée</th>
                          <th>Contenu</th>
                          <th>État</th>
                          <th aria-label="Actions" />
                        </tr>
                      </thead>
                      <tbody>
                        {m.lessons.map((l) => (
                          <tr key={l.id}>
                            <td className="font-medium text-zinc-200">
                              {l.title}
                              <div className="text-[11px] text-zinc-600">/{l.slug}</div>
                            </td>
                            <td className="text-zinc-400">{l.type}</td>
                            <td className="tabular-nums text-zinc-400">
                              {l.durationMin} min
                            </td>
                            <td>
                              <span className="flex flex-wrap gap-1">
                                {l.hasVideo ? <Badge tone="blue">vidéo</Badge> : null}
                                {l.hasQuiz ? <Badge tone="purple">quiz</Badge> : null}
                                {l.hasAction ? <Badge tone="green">action</Badge> : null}
                                {l.isPreview ? <Badge tone="amber">aperçu</Badge> : null}
                              </span>
                            </td>
                            <td>
                              {l.published ? (
                                <Badge tone="green">publiée</Badge>
                              ) : (
                                <Badge tone="amber">brouillon</Badge>
                              )}
                            </td>
                            <td>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  disabled={pending}
                                  title="Éditer le contenu"
                                  aria-label={`Éditer la leçon ${l.title}`}
                                  onClick={() => setEditing((e) => (e === l.id ? null : l.id))}
                                  className={cn('btn-ghost !p-1.5', editing === l.id && 'text-nuvra-300')}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={pending}
                                  title={l.published ? 'Dépublier' : 'Publier'}
                                  aria-label={l.published ? 'Dépublier' : 'Publier'}
                                  onClick={() =>
                                    run(() =>
                                      adminUpdateLessonAction(l.id, {
                                        published: !l.published,
                                      }),
                                    )
                                  }
                                  className="btn-ghost !p-1.5"
                                >
                                  {l.published ? (
                                    <Eye className="h-3.5 w-3.5" />
                                  ) : (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={pending}
                                  title="Supprimer"
                                  aria-label="Supprimer la leçon"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Supprimer la leçon « ${l.title} » ?`,
                                      )
                                    ) {
                                      run(() => adminDeleteLessonAction(l.id));
                                    }
                                  }}
                                  className="btn-ghost !p-1.5 text-red-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {m.lessons.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-zinc-600">
                              Aucune leçon — ajoutez la première ci-dessous.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>

                  {editing ? (
                    <LessonEditor
                      lessonId={editing}
                      onClose={() => setEditing(null)}
                    />
                  ) : null}

                  <form
                    className="mt-3 flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const title = (newLesson[m.id] ?? '').trim();
                      if (!title) return;
                      run(async () => {
                        const res = await adminCreateLessonAction({
                          moduleId: m.id,
                          title,
                          type: 'text',
                        });
                        if (res.ok) setNewLesson((n) => ({ ...n, [m.id]: '' }));
                        return res;
                      });
                    }}
                  >
                    <input
                      value={newLesson[m.id] ?? ''}
                      onChange={(e) =>
                        setNewLesson((n) => ({ ...n, [m.id]: e.target.value }))
                      }
                      placeholder="Nouvelle leçon"
                      aria-label={`Nouvelle leçon dans ${m.title}`}
                      className="min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-ink-900 px-3.5 py-2 text-sm text-zinc-200 outline-none focus:border-nuvra-500/60"
                    />
                    <button type="submit" disabled={pending} className="btn-secondary btn-sm">
                      {pending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Ajouter
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {modules.length === 0 ? (
        <div className="card card-body text-center text-sm text-zinc-500">
          <Check className="mx-auto mb-2 h-5 w-5 text-emerald-400" />
          Le programme est vide. Lancez le seed pour publier les 8 modules.
        </div>
      ) : null}

      <p className="text-xs text-zinc-600">Course id : {courseId}</p>
    </div>
  );
}
