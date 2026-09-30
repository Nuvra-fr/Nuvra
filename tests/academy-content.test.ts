/**
 * Nuvra Academy — content contract.
 *
 * The programme is authored as typed data (src/content/academy) and projected
 * into the database. These tests are the guarantee that the 8 modules / 118
 * lessons stay complete, French, substantive and honest:
 *
 *  · the exact curriculum shape (8 modules, 118 lessons, per-module counts);
 *  · every lesson carries the full pedagogical arc (comprendre → apprendre →
 *    voir → faire → valider → passer à la suite);
 *  · no placeholder, no dead link, no invented promise;
 *  · every Nuvra Action points at a real builder route and a real check;
 *  · every quiz has explanations, a passing score and coherent answers;
 *  · every video is a production package (script, storyboard, chapters,
 *    transcript) and NEVER a fake playback URL;
 *  · the content stays French (no stray CJK / Cyrillic / Hangul).
 */
import { describe, expect, it } from 'vitest';
import { ACADEMY } from '@/content/academy';
import { buildLesson, buildLessonBody, buildModule } from '@/content/academy/builder';

const modules = ACADEMY.modules;
const lessons = modules.flatMap((m) => m.lessons);

const EXPECTED = [
  { title: expect.any(String), lessons: 10 },
  { title: expect.any(String), lessons: 14 },
  { title: expect.any(String), lessons: 15 },
  { title: expect.any(String), lessons: 17 },
  { title: expect.any(String), lessons: 15 },
  { title: expect.any(String), lessons: 15 },
  { title: expect.any(String), lessons: 15 },
  { title: expect.any(String), lessons: 17 },
];

describe('programme — 8 modules, 118 leçons', () => {
  it('exposes exactly 8 modules', () => {
    expect(modules).toHaveLength(8);
  });

  it('exposes exactly 118 leçons', () => {
    expect(lessons).toHaveLength(118);
  });

  it('respecte la répartition annoncée', () => {
    expect(modules.map((m) => ({ title: m.title, lessons: m.lessons.length }))).toEqual(
      EXPECTED,
    );
  });

  it('a des slugs uniques pour chaque module et chaque leçon', () => {
    const moduleSlugs = modules.map((m) => m.slug);
    const lessonSlugs = lessons.map((l) => l.slug);
    expect(new Set(moduleSlugs).size).toBe(moduleSlugs.length);
    expect(new Set(lessonSlugs).size).toBe(lessonSlugs.length);
  });

  it('se termine par le laboratoire Nuvra Growth System', () => {
    const last = lessons[lessons.length - 1]!;
    expect(last.slug).toBe('construire-son-systeme-de-croissance');
    const built = buildModule(modules[7]!).lessons.at(-1)!;
    expect(built.type).toBe('lab');
  });

  it('chaque module a une description, des objectifs et un livrable', () => {
    for (const m of modules) {
      expect(m.description.length, m.slug).toBeGreaterThan(60);
      expect(m.objectives.length, m.slug).toBeGreaterThanOrEqual(3);
      expect(m.deliverable.length, m.slug).toBeGreaterThan(30);
    }
  });

  it('se termine chaque module par le laboratoire annoncé', () => {
    for (const m of modules) {
      const built = buildModule(m);
      const last = built.lessons[built.lessons.length - 1]!;
      expect(last.type, m.slug).toBe('lab');
      expect(last.exercise, m.slug).toBeTruthy();
    }
  });
});

describe('chaque leçon est complète', () => {
  it('a des objectifs, une durée et une difficulté', () => {
    for (const m of modules) {
      for (const l of buildModule(m).lessons) {
        expect(l.objectives.length, l.slug).toBeGreaterThanOrEqual(2);
        expect(l.durationMin, l.slug).toBeGreaterThanOrEqual(3);
        expect(l.difficulty, l.slug).toBeTruthy();
        expect(l.completionCriteria.length, l.slug).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('contient les 6 temps du parcours pédagogique', () => {
    for (const l of lessons) {
      const body = buildLessonBody(l);
      for (const section of [
        '## Pourquoi cette leçon compte',
        '## Comprendre le concept',
        '## Exemple concret',
        '## Comment l\'appliquer',
        '## Application Nuvra',
        '## Résumé',
      ]) {
        expect(body, `${l.slug} → ${section}`).toContain(section);
      }
    }
  });

  it('a un exemple, une application et des instructions Nuvra réellement rédigés', () => {
    for (const l of lessons) {
      expect(l.example.length, l.slug).toBeGreaterThan(80);
      expect(l.apply.length, l.slug).toBeGreaterThan(80);
      expect(l.nuvra.length, l.slug).toBeGreaterThan(80);
      expect(l.intro.length, l.slug).toBeGreaterThan(60);
      expect(l.explain.length, l.slug).toBeGreaterThan(120);
    }
  });

  it('propose un exercice sur chaque leçon', () => {
    for (const l of lessons) {
      expect(l.exercise, `${l.slug} n'a pas d'exercice`).toBeTruthy();
      expect(l.exercise!.checklist.length, l.slug).toBeGreaterThanOrEqual(3);
      expect(l.exercise!.instructions.length, l.slug).toBeGreaterThan(30);
    }
  });

  it('ne contient ni placeholder ni contenu mort', () => {
    const banned = [
      'lorem ipsum',
      'coming soon',
      'bientôt disponible',
      'placeholder',
      'à compléter',
      'xxxx',
    ];
    const haystack = modules
      .flatMap((m) => {
        const built = buildModule(m);
        return built.lessons.flatMap((l) => [
          l.content,
          l.exercise ?? '',
          ...l.objectives,
          ...l.resources.map((r) => `${r.title} ${r.description}`),
        ]);
      })
      .join(' ')
      .toLowerCase();
    for (const word of banned) {
      expect(haystack.includes(word), `« ${word} » trouvé dans le contenu`).toBe(false);
    }
    // Aucune URL de démonstration n'est stockée.
    expect(haystack.includes('example.com')).toBe(false);
  });

  it('reste en français (aucun caractère CJK, cyrillique ou coréen)', () => {
    const text = JSON.stringify(ACADEMY);
    const offenders = [...text].filter((c) => {
      const code = c.codePointAt(0)!;
      return (
        (code >= 0x2e80 && code <= 0x9fff) || // CJK
        (code >= 0xac00 && code <= 0xd7af) || // Hangul
        (code >= 0x0400 && code <= 0x04ff) // Cyrillique
      );
    });
    expect(offenders, `caractères hors alphabet latin : ${offenders.join('')}`).toHaveLength(0);
  });
});

describe('actions Nuvra — vraies cibles, vraies vérifications', () => {
  const actions = lessons
    .map((l) => l.action)
    .filter((a): a is NonNullable<typeof a> => !!a);

  it('existe au moins une action par module', () => {
    for (const m of modules) {
      expect(
        m.lessons.some((l) => !!l.action),
        m.slug,
      ).toBe(true);
    }
  });

  it('pointe vers de vraies routes de l’application', () => {
    for (const a of actions) {
      expect(a.route, a.action).toMatch(/^\/dashboard\//);
      expect(a.route, a.action).not.toContain('example.com');
    }
  });

  it('déclare une entité attendue et une clé de vérification', () => {
    for (const a of actions) {
      expect(a.requiredEntity.length, a.action).toBeGreaterThan(5);
      expect(a.completionCheck.length, a.action).toBeGreaterThan(3);
      expect(a.label.length, a.action).toBeGreaterThan(5);
    }
  });
});

describe('quiz — corrigés, notés, réessayables', () => {
  const quizzes = lessons
    .map((l) => ({ slug: l.slug, quiz: l.quiz }))
    .filter((q): q is { slug: string; quiz: NonNullable<typeof q.quiz> } => !!q.quiz);

  it('contient des quiz sur les lessons clés', () => {
    expect(quizzes.length).toBeGreaterThanOrEqual(8);
  });

  it('a des questions cohérentes, expliquées et notées', () => {
    for (const { slug, quiz } of quizzes) {
      expect(quiz.questions.length, slug).toBeGreaterThanOrEqual(2);
      expect(quiz.passingScore, slug).toBeGreaterThanOrEqual(50);
      expect(quiz.passingScore, slug).toBeLessThanOrEqual(100);
      for (const q of quiz.questions) {
        expect(q.options.length, slug).toBeGreaterThanOrEqual(2);
        expect(q.answerIndex, slug).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, slug).toBeLessThan(q.options.length);
        expect(q.explanation.length, slug).toBeGreaterThan(20);
        expect(new Set(q.options).size, slug).toBe(q.options.length);
      }
    }
  });
});

describe('vidéos — packages de production, jamais de faux lecteur', () => {
  it('chaque module a un script, un storyboard, des chapitres et une transcription', () => {
    for (const m of modules) {
      expect(m.video.script.length, m.slug).toBeGreaterThan(400);
      expect(m.video.transcript.length, m.slug).toBeGreaterThan(200);
      expect(m.video.chapters.length, m.slug).toBeGreaterThan(2);
      expect(m.video.storyboard.length, m.slug).toBeGreaterThan(2);
      expect(m.video.durationSec, m.slug).toBeGreaterThan(60);
    }
  });

  it('les leçons qui déclarent une vidéo ont un package complet', () => {
    const packages = modules
      .flatMap((m) => buildModule(m).lessons)
      .map((l) => ({ slug: l.slug, video: l.video }))
      .filter((p): p is { slug: string; video: NonNullable<typeof p.video> } => !!p.video);
    expect(packages.length).toBeGreaterThan(0);
    for (const p of packages) {
      expect(p.video.script.length, p.slug).toBeGreaterThan(800);
      expect(p.video.transcript.length, p.slug).toBeGreaterThan(500);
      expect(p.video.storyboard.length, p.slug).toBeGreaterThanOrEqual(5);
      expect(p.video.chapters.length, p.slug).toBeGreaterThanOrEqual(3);
      expect(p.video.durationSec, p.slug).toBeGreaterThan(60);
    }
  });

  it('le contenu projeté ne contient aucune URL de lecture', () => {
    const built = buildLesson(lessons[0]!);
    expect(built.durationSec).toBeTypeOf('number');
    expect(JSON.stringify(modules)).not.toMatch(/playbackUrl/);
    expect(JSON.stringify(modules)).not.toMatch(/\.mp4/);
    expect(JSON.stringify(modules)).not.toMatch(/https?:\/\/(?!www\.)/);
  });
});

describe('ressources', () => {
  it('chaque ressource est titrée, décrite et pointe vers une route réelle', () => {
    const built = lessons.map((l) => buildLesson(l));
    const resources = built.flatMap((l) => l.resources);
    // every lesson carries at least one usable resource
    expect(built.every((l) => l.resources.length >= 1)).toBe(true);
    expect(resources.length).toBeGreaterThanOrEqual(118);
    for (const r of resources) {
      expect(r.title.length).toBeGreaterThan(3);
      expect(r.description.length).toBeGreaterThan(10);
      if (r.href) expect(r.href, r.title).toMatch(/^\/(dashboard|academy)/);
    }
  });
});
