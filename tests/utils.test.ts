import { describe, expect, it } from 'vitest';
import { cn, percent, randomCode, safeJson, slugify, initials, timeAgo } from '@/lib/utils';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify("  L'Atelier  Créatif  ")).toBe('l-atelier-creatif');
  });

  it('strips dangerous characters', () => {
    expect(slugify('../etc/passwd')).toBe('etc-passwd');
    expect(slugify('a<b>c"d')).toBe('a-b-c-d'); // separators collapse, no HTML survives
  });

  it('never returns an empty slug', () => {
    expect(slugify('!!!')).not.toBe('');
  });
});

describe('randomCode', () => {
  it('returns the requested length with url-safe chars', () => {
    const c = randomCode(12);
    expect(c).toHaveLength(12);
    expect(c).toMatch(/^[a-z0-9]+$/);
  });

  it('is unique enough across calls', () => {
    const set = new Set(Array.from({ length: 200 }, () => randomCode(10)));
    expect(set.size).toBeGreaterThan(190);
  });
});

describe('safeJson', () => {
  it('parses valid JSON', () => {
    expect(safeJson('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns the fallback on garbage or null', () => {
    expect(safeJson('not json', { ok: false })).toEqual({ ok: false });
    expect(safeJson(null, [])).toEqual([]);
    expect(safeJson(undefined, 'x')).toBe('x');
  });
});

describe('percent', () => {
  it('guards division by zero', () => {
    expect(percent(5, 0)).toBe(0);
    expect(percent(3, 4)).toBe(75);
  });
});

describe('initials', () => {
  it('takes initials of a name', () => {
    expect(initials('Camille Creator')).toBe('CC');
    expect(initials('cher')).toBe('C');
  });
});

describe('timeAgo', () => {
  it('formats past dates', () => {
    expect(timeAgo(Date.now() - 60_000)).toBe('1m ago');
    expect(timeAgo(new Date())).toBe('just now');
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
});
