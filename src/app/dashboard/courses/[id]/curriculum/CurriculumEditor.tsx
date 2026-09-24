'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2, Video, FileText, HelpCircle } from 'lucide-react';
import {
  addLessonAction,
  addModuleAction,
  deleteLessonAction,
  deleteModuleAction,
  renameModuleAction,
  updateLessonAction,
} from '@/server/actions/courses';
import { FormError } from '@/components/auth';
import { Badge, ProgressBar } from '@/components/ui';

interface LessonProp {
  id: string;
  title: string;
  type: string;
  isPreview?: boolean;
  hasQuiz?: boolean;
}
interface ModuleProp {
  id: string;
  title: string;
  lessons: LessonProp[];
}

export default function CurriculumEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: ModuleProp[];
  orphanLessons: { id: string; title: string; type: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [newModule, setNewModule] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(modules.map((m) => [m.id, true])),
  );
  const [lessonTarget, setLessonTarget] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('text');
  const [editingLesson, setEditingLesson] = useState<LessonProp | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? 'Failed');
      else router.refresh();
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>{modules.length} modules · {totalLessons} lessons</span>
            <span>{Math.min(100, totalLessons * 10)}% content readiness</span>
          </div>
          <ProgressBar value={Math.min(100, totalLessons * 10)} />
        </div>

        {modules.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                className="btn-ghost !p-1"
                onClick={() => setExpanded({ ...expanded, [m.id]: !expanded[m.id] })}
                aria-label="Toggle module"
              >
                {expanded[m.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-zinc-200 outline-none focus:text-nuvra-300"
                defaultValue={m.title}
                onBlur={(e) => {
                  if (e.target.value !== m.title) run(() => renameModuleAction(m.id, e.target.value));
                }}
                aria-label="Module title"
              />
              <Badge>{m.lessons.length} lessons</Badge>
              <button
                className="btn-ghost !p-1.5"
                onClick={() => {
                  if (confirm('Delete this module and its lessons?')) run(() => deleteModuleAction(m.id));
                }}
                aria-label="Delete module"
              >
                <Trash2 className="h-3.5 w-3.5 text-zinc-600" />
              </button>
            </div>

            {expanded[m.id] && (
              <div className="border-t border-white/[0.07]">
                {m.lessons.map((l) => (
                  <div
                    key={l.id}
                    className="group flex items-center gap-3 border-b border-white/[0.04] px-4 py-2.5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <GripVertical className="h-3.5 w-3.5 text-zinc-700" />
                    {l.type === 'video' ? (
                      <Video className="h-3.5 w-3.5 text-nuvra-400" />
                    ) : l.type === 'quiz' ? (
                      <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-zinc-500" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">{l.title}</span>
                    {l.isPreview ? <Badge tone="blue">Preview</Badge> : null}
                    {l.hasQuiz ? <Badge tone="amber">Quiz</Badge> : null}
                    <button
                      className="btn-ghost !px-2 !py-1 opacity-0 group-hover:opacity-100"
                      onClick={async () => {
                        const res = await fetch(`/api/lessons/${l.id}`)
                          .then((r) => r.json())
                          .catch(() => null);
                        setEditingLesson(l);
                        setEditTitle(l.title);
                        setEditContent(res?.content ?? '');
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-ghost !px-2 !py-1 opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        if (confirm('Delete lesson?')) run(() => deleteLessonAction(l.id));
                      }}
                      aria-label="Delete lesson"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-zinc-600" />
                    </button>
                  </div>
                ))}

                {lessonTarget === m.id ? (
                  <div className="flex flex-wrap items-center gap-2 bg-white/[0.02] px-4 py-3">
                    <input
                      className="input !w-auto flex-1 !py-2"
                      placeholder="Lesson title"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && lessonTitle.trim()) {
                          run(async () => {
                            const res = await addLessonAction(courseId, m.id, { title: lessonTitle, type: lessonType });
                            setLessonTitle('');
                            return res;
                          });
                        }
                      }}
                    />
                    <select className="input !w-auto !py-2" value={lessonType} onChange={(e) => setLessonType(e.target.value)}>
                      <option value="text">Text</option>
                      <option value="video">Video</option>
                      <option value="file">File</option>
                    </select>
                    <button
                      className="btn-primary !py-2 !text-xs"
                      disabled={!lessonTitle.trim() || pending}
                      onClick={() =>
                        run(async () => {
                          const res = await addLessonAction(courseId, m.id, { title: lessonTitle, type: lessonType });
                          if (res.ok) setLessonTitle('');
                          return res;
                        })
                      }
                    >
                      Add
                    </button>
                    <button className="btn-ghost !py-2 !text-xs" onClick={() => setLessonTarget(null)}>Done</button>
                  </div>
                ) : (
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-zinc-500 hover:bg-white/[0.03] hover:text-nuvra-300"
                    onClick={() => setLessonTarget(m.id)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add lesson
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <input
            className="input"
            placeholder="New module title…"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
          />
          <button
            className="btn-secondary whitespace-nowrap"
            disabled={!newModule.trim() || pending}
            onClick={() =>
              run(async () => {
                const res = await addModuleAction(courseId, newModule);
                if (res.ok) setNewModule('');
                return res;
              })
            }
          >
            <Plus className="h-4 w-4" /> Add module
          </button>
        </div>

        <FormError error={error} />
      </div>

      {/* Lesson editor drawer */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="absolute inset-0" onClick={() => setEditingLesson(null)} />
          <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-ink-900 p-5">
            <h3 className="text-sm font-semibold text-zinc-200">Edit lesson</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Title</label>
                <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Content (text or video URL)</label>
                <textarea
                  className="input"
                  rows={10}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write the lesson content or paste a video URL…"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={editingLesson.isPreview ?? false}
                  onChange={(e) => setEditingLesson({ ...editingLesson, isPreview: e.target.checked })}
                  className="h-4 w-4 accent-[#1B51F5]"
                />
                Free preview (visible without purchase)
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setEditingLesson(null)}>Cancel</button>
              <button
                className="btn-primary"
                disabled={pending}
                onClick={() =>
                  run(async () => {
                    const res = await updateLessonAction(editingLesson.id, {
                      title: editTitle,
                      content: editContent,
                      isPreview: editingLesson.isPreview ?? false,
                    });
                    if (res.ok) setEditingLesson(null);
                    return res;
                  })
                }
              >
                Save lesson
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
