// Feature: project-showcase — Property-Based Tests
// Properties: URL Validation, File Size Validation, Participant Check,
//             Showcase Add/Remove Round-Trip, Sort Order, Multiple Showcases

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { isValidUrl, isValidFileSize, showcaseService } from '../services/db.js';

beforeEach(() => {
  localStorage.clear();
});

// ─── Feature: project-showcase, Property 2: URL Validasiyası ─────────────────

describe('isValidUrl — URL Validasiyası', () => {

  it('http:// ilə başlayan URL qəbul edilir', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('https:// ilə başlayan URL qəbul edilir', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('http/https olmayan URL rədd edilir', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('www.example.com')).toBe(false);
  });

  it('boş string rədd edilir', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('null/undefined rədd edilir', () => {
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
  });

  // Feature: project-showcase, Property 2
  it('Property 2: http/https ilə başlamayan istənilən string false qaytarır', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !s.startsWith('http://') && !s.startsWith('https://')),
        (url) => {
          expect(isValidUrl(url)).toBe(false);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property 2 (positive): http/https ilə başlayan istənilən string true qaytarır', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('http://', 'https://'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (prefix, rest) => {
          expect(isValidUrl(prefix + rest)).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });

});

// ─── Feature: project-showcase, Property 3: Fayl Ölçüsü Validasiyası ─────────

describe('isValidFileSize — Fayl Ölçüsü Validasiyası', () => {

  const TWO_MB = 2 * 1024 * 1024; // 2097152 bytes

  it('2MB-dan kiçik ölçü qəbul edilir', () => {
    expect(isValidFileSize(0)).toBe(true);
    expect(isValidFileSize(1024)).toBe(true);
    expect(isValidFileSize(TWO_MB - 1)).toBe(true);
  });

  it('dəqiq 2MB qəbul edilir', () => {
    expect(isValidFileSize(TWO_MB)).toBe(true);
  });

  it('2MB-dan böyük ölçü rədd edilir', () => {
    expect(isValidFileSize(TWO_MB + 1)).toBe(false);
    expect(isValidFileSize(5 * 1024 * 1024)).toBe(false);
  });

  it('mənfi ölçü rədd edilir', () => {
    expect(isValidFileSize(-1)).toBe(false);
  });

  it('string ölçü rədd edilir', () => {
    expect(isValidFileSize('1024')).toBe(false);
    expect(isValidFileSize(null)).toBe(false);
  });

  // Feature: project-showcase, Property 3
  it('Property 3: 2MB-dan böyük ölçülər həmişə rədd edilir', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: TWO_MB + 1, max: 10 * 1024 * 1024 }),
        (size) => {
          expect(isValidFileSize(size)).toBe(false);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property 3 (positive): 0-2MB arasındakı ölçülər həmişə qəbul edilir', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: TWO_MB }),
        (size) => {
          expect(isValidFileSize(size)).toBe(true);
        }
      ),
      { numRuns: 300 }
    );
  });

});

// ─── Feature: project-showcase, Property 4: İştirakçılıq Hüququ ──────────────

describe('showcaseService.isParticipant — İştirakçılıq Hüququ', () => {

  it('layihənin müəllifi həmişə iştirakçıdır', () => {
    const project = { authorId: 'user1', applicants: [] };
    expect(showcaseService.isParticipant('user1', project)).toBe(true);
  });

  it('qəbul edilmiş müraciətçi iştirakçıdır', () => {
    const project = {
      authorId: 'owner',
      applicants: [{ id: 'user2', status: 'accepted' }],
    };
    expect(showcaseService.isParticipant('user2', project)).toBe(true);
  });

  it('rədd edilmiş müraciətçi iştirakçı deyil', () => {
    const project = {
      authorId: 'owner',
      applicants: [{ id: 'user3', status: 'rejected' }],
    };
    expect(showcaseService.isParticipant('user3', project)).toBe(false);
  });

  it('gözlənilən müraciətçi iştirakçı deyil', () => {
    const project = {
      authorId: 'owner',
      applicants: [{ id: 'user4', status: 'pending' }],
    };
    expect(showcaseService.isParticipant('user4', project)).toBe(false);
  });

  it('null/undefined vəziyyətlər idarə edilir', () => {
    expect(showcaseService.isParticipant(null, { authorId: 'a', applicants: [] })).toBe(false);
    expect(showcaseService.isParticipant('user', null)).toBe(false);
  });

  // Feature: project-showcase, Property 4
  it('Property 4: yalnız müəllif və qəbul edilmiş müraciətçilər true qaytarır', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 15 }),
        fc.record({
          authorId: fc.string({ minLength: 1, maxLength: 15 }),
          applicants: fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 15 }),
              status: fc.constantFrom('pending', 'accepted', 'rejected', 'left'),
            }),
            { minLength: 0, maxLength: 5 }
          ),
        }),
        (userId, project) => {
          const result = showcaseService.isParticipant(userId, project);
          const isAuthor = project.authorId === userId;
          const isAccepted = project.applicants.some(
            a => typeof a === 'object' && a.id === userId && a.status === 'accepted'
          );
          expect(result).toBe(isAuthor || isAccepted);
        }
      ),
      { numRuns: 300 }
    );
  });

});

// ─── Feature: project-showcase, Property 1: Showcase Saxlama Round-Trip ───────

describe('showcaseService — Showcase Saxlama Round-Trip', () => {

  // Property 1
  it('Property 1: əlavə edilmiş showcase DB-də projectId, createdAt ilə saxlanılır', () => {
    fc.assert(
      fc.property(
        fc.record({
          projectId: fc.string({ minLength: 1, maxLength: 20 }),
          userId: fc.string({ minLength: 1, maxLength: 20 }),
          liveUrl: fc.option(fc.constant('https://example.com')),
          description: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
        }),
        (data) => {
          localStorage.clear();
          const saved = showcaseService.add(data);

          expect(saved.id).toBeTruthy();
          expect(saved.projectId).toBe(data.projectId);
          expect(saved.userId).toBe(data.userId);
          expect(typeof saved.createdAt).toBe('number');
          expect(saved.createdAt).toBeGreaterThan(0);

          // DB-dən geri oxu
          const inDB = DB_get_showcases();
          const found = inDB.find(s => s.id === saved.id);
          expect(found).toBeDefined();
          expect(found.projectId).toBe(data.projectId);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 5: Çoxlu Showcase
  it('Property 5: eyni layihəyə N showcase əlavə edildikdə hamısı saxlanılır', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.string({ minLength: 1, maxLength: 15 }),
        (count, projectId) => {
          localStorage.clear();
          for (let i = 0; i < count; i++) {
            showcaseService.add({ projectId, userId: 'user1', description: `Showcase ${i}` });
          }
          const result = showcaseService.getByProject(projectId);
          expect(result.length).toBe(count);
        }
      ),
      { numRuns: 50 }
    );
  });

  // Property 6: Sıralama
  it('Property 6: getByProject createdAt azalan sırada qaytarır', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 8 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (count, projectId) => {
          localStorage.clear();
          for (let i = 0; i < count; i++) {
            showcaseService.add({ projectId, userId: 'user1', description: `s${i}` });
          }
          const result = showcaseService.getByProject(projectId);
          for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].createdAt).toBeGreaterThanOrEqual(result[i + 1].createdAt);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  // Property 7: Silmə
  it('Property 7: əlavə edilib silinən showcase DB-də artıq olmur', () => {
    fc.assert(
      fc.property(
        fc.record({
          projectId: fc.string({ minLength: 1, maxLength: 15 }),
          userId: fc.string({ minLength: 1, maxLength: 15 }),
          description: fc.string({ minLength: 0, maxLength: 50 }),
        }),
        (data) => {
          localStorage.clear();
          const saved = showcaseService.add(data);
          showcaseService.remove(saved.id);
          const all = showcaseService.getAll();
          expect(all.find(s => s.id === saved.id)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

});

// ─── helper ───────────────────────────────────────────────────────────────────
function DB_get_showcases() {
  try { return JSON.parse(localStorage.getItem('lu_showcases')) || []; } catch { return []; }
}
