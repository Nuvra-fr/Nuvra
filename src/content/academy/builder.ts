import { LESSON_RESOURCES } from './resources';
import type {
  AcademyLessonInput,
  AcademyModuleInput,
  BuiltLesson,
  BuiltModule,
  BuiltResource,
} from './types';

/**
 * Content builder — turns the authored lesson inputs into exactly what the
 * database stores.
 *
 * Two rules drive everything here:
 *  1. A lesson always reads the same way — Comprendre → Apprendre → Voir →
 *     Faire → Valider → Passer à la suite — so a learner never has to guess
 *     what to do next.
 *  2. A video asset is only ever *scripted* until an administrator uploads a
 *     real file. The builder therefore produces script, storyboard, chapters
 *     and transcript, and never a playback URL.
 */

const fmtTime = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(5, '0')}`;
};

function paragraphs(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join('\n\n');
}

/** Assemble the canonical lesson body. */
export function buildLessonBody(input: AcademyLessonInput): string {
  const parts: string[] = [];

  parts.push(`## Pourquoi cette leçon compte\n\n${paragraphs(input.intro)}`);
  parts.push(`## Comprendre le concept\n\n${paragraphs(input.explain)}`);
  parts.push(`## Exemple concret\n\n${paragraphs(input.example)}`);
  parts.push(`## Comment l'appliquer\n\n${paragraphs(input.apply)}`);

  const nuvraBlock = [`## Application Nuvra\n\n${paragraphs(input.nuvra)}`];
  if (input.action) {
    nuvraBlock.push(
      `> **Action dans Nuvra : ${input.action.label}** — ${input.action.hint ?? 'Ouvre l’outil réel correspondant dans ton espace.'}`,
    );
  }
  parts.push(nuvraBlock.join('\n\n'));

  if (input.exercise) {
    const ex = input.exercise;
    const checklist = ex.checklist.map((c) => `- ${c}`).join('\n');
    const worksheet = ex.worksheet?.length
      ? `\n\nRenseigne tes réponses ci-dessous : ${ex.worksheet
          .map((w) => w.label.toLowerCase())
          .join(', ')}.`
      : '';
    parts.push(
      `## Exercice pratique\n\n### ${ex.title}\n\n${paragraphs(ex.instructions)}${worksheet}\n\n${checklist}`,
    );
  }

  parts.push(
    `## Résumé\n\n${input.objectives.map((o) => `- ${o}`).join('\n')}`,
  );

  if (input.quiz) {
    parts.push(
      `## Valider mes connaissances\n\n${input.quiz.questions.length} question(s), score minimum **${input.quiz.passingScore} %**. Une nouvelle tentative reste possible.`,
    );
  }

  return parts.join('\n\n');
}

/** The exercise stored on the lesson row (rendered in its own block). */
export function buildExerciseText(input: AcademyLessonInput): string | null {
  if (!input.exercise) return null;
  const ex = input.exercise;
  return [
    `### ${ex.title}`,
    paragraphs(ex.instructions),
    ex.checklist.map((c) => `- [ ] ${c}`).join('\n'),
  ].join('\n\n');
}

/**
 * Derive a real video production package from the lesson itself.
 * The narration is the lesson's own material, chapter by chapter, so a
 * producer can record it without rewriting anything.
 */
export function buildLessonVideo(input: AcademyLessonInput) {
  if (!input.video) return null;
  const minutes = input.minutes ?? 8;
  const durationSec = input.video.durationSec ?? Math.max(180, minutes * 60);
  const beat = Math.max(20, Math.floor(durationSec / 5));

  const defaultNotes = [
    'Fond noir profond, logo Nuvra encoin, titre de la leçon en apparition douce',
    'Schéma simple (2-3 blocs) expliquant le concept, pas de slide PowerPoint',
    'Capture d’écran réelle de l’interface Nuvra, zoom lent sur le menu concerné',
    'Découpe alternée : texte de la leçon à gauche, capture d’écran Nuvra à droite',
    'Carte finale : l’action à faire maintenant, une seule ligne',
  ];

  const visuals = input.video.visualNotes ?? defaultNotes;
  const sections = [
    { title: 'Pourquoi cette leçon compte', text: input.intro },
    { title: 'Comprendre le concept', text: input.explain },
    { title: 'Exemple concret', text: input.example },
    { title: 'Application Nuvra', text: input.nuvra },
    {
      title: input.exercise ? 'Exercice pratique' : 'Résumé',
      text: input.exercise
        ? `${input.exercise.title} — ${input.exercise.instructions}`
        : input.objectives.join('. '),
    },
  ];

  const chapters = input.video.chapters
    ? input.video.chapters.map(([title, time]) => ({ title, time }))
    : sections.map((s, i) => ({ title: s.title, time: i * beat }));

  const storyboard = sections.map((s, i) => ({
    time: fmtTime(i * beat),
    visual:
      visuals[i % visuals.length] ??
      'Plan sobre : fond ink-950, typographie Nuvra, accent bleu #3372FF',
    narration: `${s.title}. ${paragraphs(s.text).split('\n\n')[0] ?? ''}`,
    onScreenText: s.title,
  }));

  const script = [
    `### 00:00 — Accroche`,
    input.video.narration,
    '',
    ...sections.map(
      (s, i) =>
        `### ${fmtTime(i * beat)} — ${s.title}\n${paragraphs(s.text)}\n\n_[Plan] ${storyboard[i]!.visual}_`,
    ),
  ].join('\n');

  const transcript = [
    input.video.narration,
    '',
    ...sections.map((s) => `${s.title}. ${paragraphs(s.text)}`),
  ].join('\n ');

  return {
    title: input.title,
    description: input.short,
    durationSec,
    script,
    storyboard,
    chapters,
    transcript,
  };
}

export function buildLesson(input: AcademyLessonInput): BuiltLesson {
  const minutes = input.minutes ?? 8;
  // Resources come from two places: the lesson itself and the shared resource
  // catalogue (`resources.ts`), merged and de-duplicated by title.
  const merged = [...(input.resources ?? []), ...(LESSON_RESOURCES[input.slug] ?? [])];
  const seen = new Set<string>();
  const resources: BuiltResource[] = [];
  for (const r of merged) {
    if (seen.has(r.title)) continue;
    seen.add(r.title);
    resources.push({
      title: r.title,
      kind: r.kind,
      description: r.description,
      href: r.href ?? null,
    });
  }

  const completionCriteria = [
    ...input.objectives,
    ...(input.exercise
      ? [`Exercice réalisé : ${input.exercise.title}`]
      : []),
    ...(input.quiz
      ? [`Quiz validé à ${input.quiz.passingScore} % minimum`]
      : []),
  ];

  return {
    slug: input.slug,
    title: input.title,
    shortDescription: input.short,
    type: input.type ?? (input.video ? 'video' : 'text'),
    content: buildLessonBody(input),
    objectives: input.objectives,
    durationMin: minutes,
    durationSec: (input.video?.durationSec ?? minutes * 60) || minutes * 60,
    difficulty: input.difficulty ?? 'beginner',
    isPreview: input.preview ?? false,
    published: true,
    resources,
    exercise: buildExerciseText(input),
    nuvraAction: input.action ?? null,
    completionCriteria,
    quiz: input.quiz ?? null,
    video: buildLessonVideo(input),
  };
}

export function buildModule(input: AcademyModuleInput): BuiltModule {
  const lessons = input.lessons.map(buildLesson);
  // The last lesson of a module is its practical lab: the UI styles it
  // differently, and it is the deliverable the module announces.
  const last = lessons[lessons.length - 1];
  if (last) last.type = 'lab';
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    objectives: input.objectives,
    deliverable: input.deliverable,
    lab: input.lab,
    video: input.video,
    lessons,
  };
}

/** Total minutes of a module, video included. */
export function moduleMinutes(mod: {
  lessons: { durationMin: number }[];
  video: { durationSec: number };
}): number {
  const reading = mod.lessons.reduce((s, l) => s + (l.durationMin ?? 0), 0);
  return Math.round(reading + mod.video.durationSec / 60);
}
