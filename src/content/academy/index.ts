import type { AcademyCourseInput } from './types';
import { MODULE_1 } from './module-1';
import { MODULE_2 } from './module-2';
import { MODULE_3 } from './module-3';
import { MODULE_4 } from './module-4';
import { MODULE_5 } from './module-5';
import { MODULE_6 } from './module-6';
import { MODULE_7 } from './module-7';
import { MODULE_8 } from './module-8';

/**
 * Nuvra Academy — the full programme.
 *
 * One course, eight modules, ordered. `scripts/seed-academy.ts` projects this
 * into the database (course → modules → lessons → videos → quizzes →
 * resources) without ever overwriting content an administrator has edited:
 * rows are matched by slug and only the authored fields are upserted when the
 * lesson has never been customised.
 */
export const ACADEMY: AcademyCourseInput = {
  slug: 'nuvra-academy',
  title: 'Nuvra Academy',
  description:
    "Master Digital Business with Nuvra. Huit modules pour apprendre le marketing digital et construire réellement son activité dans Nuvra : offre, tunnel, formation, acquisition, conversion, automatisation et croissance.",
  level: 'beginner',
  category: 'Business',
  modules: [
    MODULE_1,
    MODULE_2,
    MODULE_3,
    MODULE_4,
    MODULE_5,
    MODULE_6,
    MODULE_7,
    MODULE_8,
  ],
};

export const ACADEMY_MODULES = ACADEMY.modules;
export const ACADEMY_LESSONS = ACADEMY.modules.flatMap((m) => m.lessons);

/** Free lessons readable on the public sales page. */
export const ACADEMY_PREVIEW_LESSONS = ACADEMY_LESSONS.filter((l) => l.preview);

export default ACADEMY;
