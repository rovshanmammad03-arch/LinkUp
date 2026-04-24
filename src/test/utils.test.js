// Feature: rich-post-types, Property 6: Tag parsing round-trip property tests
// Also covers initials, timeAgo, uid utility functions

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { parseTechnologies, initials, uid } from '../services/db.js';

// ─── parseTechnologies ────────────────────────────────────────────────────────

describe('parseTechnologies', () => {

  // Property 6: For any non-empty array of technology strings,
  // join then parse produces the original array
  it('Property 6: round-trip — join then parse returns original array', () => {
    fc.assert(
      fc.property(
        // Generate array of non-empty strings without commas
        fc.array(
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.includes(',')),
          { minLength: 1, maxLength: 10 }
        ),
        (techs) => {
          const joined = techs.join(', ');
          const result = parseTechnologies(joined);
          expect(result).toEqual(techs);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('boş string üçün boş massiv qaytarır', () => {
    expect(parseTechnologies('')).toEqual([]);
  });

  it('null/undefined üçün boş massiv qaytarır', () => {
    expect(parseTechnologies(null)).toEqual([]);
    expect(parseTechnologies(undefined)).toEqual([]);
  });

  it('vergüllə ayrılmış dəyərləri düzgün parse edir', () => {
    expect(parseTechnologies('React, Node.js, TypeScript')).toEqual(['React', 'Node.js', 'TypeScript']);
  });

  it('əlavə boşluqları kəsir', () => {
    expect(parseTechnologies('  React  ,  Vue  ,  Angular  ')).toEqual(['React', 'Vue', 'Angular']);
  });

  it('boş elementləri filtrləyir (ardıcıl vergüllər)', () => {
    expect(parseTechnologies('React,,Node.js')).toEqual(['React', 'Node.js']);
  });

  it('tək element üçün bir elementli massiv qaytarır', () => {
    expect(parseTechnologies('Python')).toEqual(['Python']);
  });

  it('Property: nəticə həmişə massivdir', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (input) => {
          const result = parseTechnologies(input);
          expect(Array.isArray(result)).toBe(true);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property: nəticədəki heç bir element boş string deyil', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (input) => {
          const result = parseTechnologies(input);
          for (const item of result) {
            expect(item.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property: nəticədəki heç bir element vergül ehtiva etmir', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (input) => {
          const result = parseTechnologies(input);
          for (const item of result) {
            expect(item.includes(',')).toBe(false);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

});

// ─── initials ────────────────────────────────────────────────────────────────

describe('initials', () => {

  it('tam addan 2 hərf baş hərfini qaytarır', () => {
    expect(initials('Ayxan Quliyev')).toBe('AQ');
  });

  it('tək addan 1 hərf qaytarır', () => {
    expect(initials('Leyla')).toBe('L');
  });

  it('boş string üçün boş string qaytarır', () => {
    expect(initials('')).toBe('');
  });

  it('null üçün boş string qaytarır', () => {
    expect(initials(null)).toBe('');
    expect(initials(undefined)).toBe('');
  });

  it('üç sözlü addan yalnız ilk 2 hərfi qaytarır', () => {
    expect(initials('Əli Hüseyn Məmmədov')).toBe('ƏH');
  });

  it('Property: nəticə həmişə 0-2 hərf arasındadır', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (name) => {
          const result = initials(name);
          expect(result.length).toBeGreaterThanOrEqual(0);
          expect(result.length).toBeLessThanOrEqual(2);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property: nəticə həmişə böyük hərflidir', () => {
    fc.assert(
      fc.property(
        // Only ASCII letters and spaces to keep test predictable
        fc.stringMatching(/^[a-zA-Z ]{1,30}$/).filter(s => s.trim().length > 0),
        (name) => {
          const result = initials(name);
          expect(result).toBe(result.toUpperCase());
        }
      ),
      { numRuns: 200 }
    );
  });

});

// ─── uid ─────────────────────────────────────────────────────────────────────

describe('uid', () => {

  it('boş olmayan string qaytarır', () => {
    expect(typeof uid()).toBe('string');
    expect(uid().length).toBeGreaterThan(0);
  });

  it('Property: hər çağırışda unikal ID yaradır', () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(uid());
    }
    // 1000 çağırışda ən azı 999 unikal ID olmalıdır
    expect(ids.size).toBeGreaterThanOrEqual(999);
  });

  it('Property: ID yalnız alphanumeric simvollar ehtiva edir', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const id = uid();
          expect(/^[a-z0-9]+$/.test(id)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

});
