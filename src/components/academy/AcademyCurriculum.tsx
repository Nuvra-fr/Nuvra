'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, ChevronDown, Circle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CurriculumLesson {
  id: string;
  slug: string;
  title: string;
  durationMin: number;
  type: string;
  completed: boolean;
  current: boolean;
  hasVideo: boolean;
  hasQuiz: boolean;
  hasAction: boolean;
}

export interface CurriculumModule {
  id: string;
  slug: string;
  title: string;
  position: number;
  done: number;
  total: number;
  lessons: CurriculumLesson[];
}

function LessonRow({ lesson, href }: { lesson: CurriculumLesson; href: string }) {
  return (
    <Link
      href={href}
      aria-current={lesson.current ? 'page' : undefined}
      className={cn(
        'group flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-[13px] leading-snug transition duration-200 ease-smooth',
        lesson.current
          ? 'bg-nuvra-600/20 text-zinc-100 ring-1 ring-nuvra-500/30'
          : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200',
      )}
    >
      <span className="mt-0.5 shrink-0">
        {lesson.completed ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
        ) : lesson.current ? (
          <PlayCircle className="h-3.5 w-3.5 text-nuvra-300" aria-hidden />
        ) : (
          <Circle className="h-3.5 w-3.5 text-zinc-700" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block">{lesson.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wide text-zinc-600">
          <span>{lesson.durationMin} min</span>
          {lesson.hasVideo ? <span>· vidéo</span> : null}
          {lesson.hasQuiz ? <span>· quiz</span> : null}
          {lesson.hasAction ? <span className="text-nuvra-400/70">· lab</span> : null}
        </span>
      </span>
      {lesson.completed ? <span className="sr-only">terminée</span> : null}
    </Link>
  );
}

export default function AcademyCurriculum({
  modules,
  basePath = '/dashboard/academy',
  totalDone,
  totalAll,
  courseTitle,
}: {
  modules: CurriculumModule[];
  basePath?: string;
  totalDone: number;
  totalAll: number;
  courseTitle: string;
}) {
  const pathname = usePathname();
  const currentRef = useRef<HTMLAnchorElement | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const m of modules) {
        if (m.lessons.some((l) => l.current) && next[m.id] !== true) {
          next[m.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [modules]);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [pathname]);

  return (
    <nav
      aria-label="Sommaire de la formation"
      className="card flex h-full max-h-[calc(100vh-9rem)] flex-col overflow-hidden"
    >
      <div className="card-head">
        <div className="min-w-0">
          <h2 className="section-title truncate">{courseTitle}</h2>
          <p className="section-subtitle">
            {totalDone}/{totalAll} leçons terminées
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {modules.map((m) => {
          const isOpen = open[m.id] ?? m.done > 0;
          return (
            <div key={m.id} className="mb-1.5">
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [m.id]: !isOpen }))}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition duration-200 hover:bg-white/[0.04]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-semibold text-zinc-400">
                  {m.position + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-zinc-200">
                    {m.title}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {m.done}/{m.total} leçons
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              {isOpen ? (
                <div className="mt-0.5 space-y-0.5 border-l border-white/[0.07] pl-2.5">
                  {m.lessons.map((l) => (
                    <span
                      key={l.id}
                      ref={l.current ? currentRef : undefined}
                      className="block"
                    >
                      <LessonRow
                        lesson={l}
                        href={`${basePath}/${m.slug}/lecon/${l.slug}`}
                      />
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
