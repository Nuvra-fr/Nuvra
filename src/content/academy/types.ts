/**
 * Nuvra Academy — content model.
 *
 * The whole programme (modules, lessons, objectives, resources, exercises,
 * Nuvra Actions, quizzes, video scripts) is authored here as typed data and
 * projected into the database by `scripts/seed-academy.ts`. React components
 * never hold course copy: they read the database, which is what makes the
 * content editable from Admin without a deploy.
 *
 * Language: the seed content is French (the current audience). Adding a
 * language = adding one more content set (`fr`, then `en`…), the schema and
 * the UI already key on `slug` so translations can coexist per course.
 */

/** A pedagogical "do this inside Nuvra" step bound to a real product route. */
export interface NuvraActionSpec {
  /** Stable key, also used by completion checks. */
  action: string;
  /** Button label shown to the learner. */
  label: string;
  /** Real Nuvra route the button opens. */
  route: string;
  /** Entity the action is supposed to create or open. */
  requiredEntity: string;
  /** Key evaluated server-side to display "done". */
  completionCheck: string;
  /** One line explaining what the learner is about to do. */
  hint?: string;
}

export interface AcademyResourceSpec {
  title: string;
  kind: 'CHECKLIST' | 'TEMPLATE' | 'WORKBOOK' | 'LINK' | 'SCRIPT';
  description: string;
  /** Optional internal route (resources are stored, not uploaded binaries). */
  href?: string;
}

export interface AcademyExerciseSpec {
  title: string;
  instructions: string;
  checklist: string[];
  /** Turns the exercise into a form the learner fills in inside Academy. */
  worksheet?: { key: string; label: string; type: 'text' | 'textarea' }[];
}

export interface AcademyQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface AcademyQuizSpec {
  title: string;
  passingScore: number;
  questions: AcademyQuizQuestion[];
}

/** Per-lesson video production package (never a fake player URL). */
export interface AcademyLessonVideoInput {
  /** Narration text — also used as the transcript when no VTT exists yet. */
  narration: string;
  /** On-screen visual direction, one line per storyboard beat. */
  visualNotes?: string[];
  /** [title, seconds] pairs — the player uses them as chapters. */
  chapters?: [string, number][];
  /** Target duration; defaults to 3× the lesson reading time. */
  durationSec?: number;
}

export interface AcademyLessonInput {
  slug: string;
  title: string;
  /** One sentence shown in module pages, the sidebar and resume cards. */
  short: string;
  objectives: string[];
  minutes?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Why this lesson matters. */
  intro: string;
  /** The concept, explained simply but precisely. */
  explain: string;
  /** A concrete, relatable case. */
  example: string;
  /** How to apply it in real life (outside the tool). */
  apply: string;
  /** How to do it inside Nuvra, step by step. */
  nuvra: string;
  action?: NuvraActionSpec;
  exercise?: AcademyExerciseSpec;
  quiz?: AcademyQuizSpec;
  resources?: AcademyResourceSpec[];
  video?: AcademyLessonVideoInput;
  /** Free preview lessons are readable on the public sales page. */
  preview?: boolean;
  type?: 'text' | 'video' | 'file' | 'quiz';
}

export interface AcademyModuleInput {
  slug: string;
  title: string;
  description: string;
  objectives: string[];
  /** Outcome the learner can prove at the end of the module. */
  deliverable: string;
  lessons: AcademyLessonInput[];
  /** Module-level video: the walkthrough of the whole lab. */
  video: {
    title: string;
    description: string;
    durationSec: number;
    /** Full narration, section by section. */
    script: string;
    chapters: { title: string; time: number }[];
    transcript: string;
    storyboard: { time: string; visual: string; narration: string; onScreenText: string }[];
  };
  /** Practical lab run at the end of the module. */
  lab: {
    title: string;
    goal: string;
    steps: string[];
    action: NuvraActionSpec;
  };
}

export interface AcademyCourseInput {
  slug: string;
  title: string;
  description: string;
  level: string;
  category: string;
  modules: AcademyModuleInput[];
}

// ── Assembled (database-shaped) output ──────────────────────────────

export interface BuiltResource {
  title: string;
  kind: string;
  description: string;
  href: string | null;
}

export interface BuiltLesson {
  slug: string;
  title: string;
  shortDescription: string;
  type: string;
  content: string;
  objectives: string[];
  durationMin: number;
  durationSec: number;
  difficulty: string;
  isPreview: boolean;
  published: boolean;
  resources: BuiltResource[];
  exercise: string | null;
  nuvraAction: NuvraActionSpec | null;
  completionCriteria: string[];
  quiz: AcademyQuizSpec | null;
  video: {
    title: string;
    description: string;
    durationSec: number;
    script: string;
    storyboard: { time: string; visual: string; narration: string; onScreenText: string }[];
    chapters: { title: string; time: number }[];
    transcript: string;
  } | null;
}

export interface BuiltModule {
  slug: string;
  title: string;
  description: string;
  objectives: string[];
  deliverable: string;
  lab: AcademyModuleInput['lab'];
  video: AcademyModuleInput['video'];
  lessons: BuiltLesson[];
}
