import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// ─── localStorage mock ────────────────────────────────────────────────────────
const localStorageStore = {};
const localStorageMock = {
    getItem: (key) => (key in localStorageStore ? localStorageStore[key] : null),
    setItem: (key, value) => { localStorageStore[key] = String(value); },
    removeItem: (key) => { delete localStorageStore[key]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); },
};
vi.stubGlobal('localStorage', localStorageMock);

// ─── Imports (after mock is set up) ──────────────────────────────────────────
import { DB } from '../services/db';
import { add, remove, getByProject } from '../services/showcaseService';

// ─── Reset localStorage before each test ─────────────────────────────────────
beforeEach(() => {
    localStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Project Showcase — Property-Based Tests', () => {

    // Feature: project-showcase, Property 1: Showcase Saxlama Round-Trip
    it('Property 1: Showcase Saxlama Round-Trip — əlavə edildikdən sonra DB.get showcases həmin elementi qaytarır', () => {
        // Validates: Requirements 1.3, 5.1, 5.2, 5.3
        const urlArb = fc.constantFrom(
            'https://example.com',
            'http://test.org',
            'https://portfolio.dev',
            'http://demo.io'
        );

        fc.assert(
            fc.property(
                fc.record({
                    projectId: fc.string({ minLength: 1 }),
                    userId: fc.string({ minLength: 1 }),
                    liveUrl: fc.option(urlArb),
                    description: fc.option(fc.string()),
                }),
                (input) => {
                    // Hər iterasiyadan əvvəl təmizlə
                    DB.set('showcases', []);

                    const beforeAdd = Date.now();
                    const saved = add(input);
                    const afterAdd = Date.now();

                    const showcases = DB.get('showcases');

                    // Ən azı bir element olmalıdır
                    expect(showcases.length).toBeGreaterThanOrEqual(1);

                    // Saxlanılan element tapılmalıdır
                    const found = showcases.find(s => s.id === saved.id);
                    expect(found).toBeDefined();

                    // projectId sahəsi düzgün olmalıdır
                    expect(found.projectId).toBe(input.projectId);

                    // userId sahəsi düzgün olmalıdır
                    expect(found.userId).toBe(input.userId);

                    // createdAt sahəsi mövcud olmalı və etibarlı timestamp olmalıdır
                    expect(found.createdAt).toBeGreaterThanOrEqual(beforeAdd);
                    expect(found.createdAt).toBeLessThanOrEqual(afterAdd);
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: project-showcase, Property 5: Çoxlu Showcase Əlavə Etmə İnvariantı
    it('Property 5: Çoxlu Showcase Əlavə Etmə İnvariantı — eyni layihəyə N showcase əlavə edildikdə N element qaytarılır', () => {
        // Validates: Requirements 2.4
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 10 }),
                fc.string({ minLength: 1 }),
                fc.string({ minLength: 1 }),
                (n, projectId, userId) => {
                    // Hər iterasiyadan əvvəl təmizlə
                    DB.set('showcases', []);

                    // Eyni layihəyə N showcase əlavə et
                    for (let i = 0; i < n; i++) {
                        add({ projectId, userId, description: `Showcase ${i}` });
                    }

                    const showcases = DB.get('showcases');

                    // Həmin layihəyə aid elementlər
                    const projectShowcases = showcases.filter(s => s.projectId === projectId);

                    // Tam olaraq N element olmalıdır
                    expect(projectShowcases.length).toBe(n);
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: project-showcase, Property 6: Showcase Sıralama İnvariantı
    it('Property 6: Showcase Sıralama İnvariantı — getByProject azalan createdAt sırasında qaytarır', () => {
        // Validates: Requirements 3.5
        fc.assert(
            fc.property(
                fc.array(fc.integer({ min: 0, max: 9999999999 }), { minLength: 0, maxLength: 10 }),
                fc.string({ minLength: 1 }),
                (timestamps, projectId) => {
                    // Hər iterasiyadan əvvəl təmizlə
                    DB.set('showcases', []);

                    // Müxtəlif createdAt dəyərləri ilə showcase-lər əlavə et
                    // add() Date.now() istifadə edir, ona görə birbaşa DB-yə yazırıq
                    const items = timestamps.map((ts, i) => ({
                        id: `test_${i}_${ts}`,
                        projectId,
                        userId: 'user1',
                        liveUrl: null,
                        image: null,
                        description: null,
                        createdAt: ts,
                    }));
                    DB.set('showcases', items);

                    const result = getByProject(projectId);

                    // Nəticə uzunluğu input uzunluğuna bərabər olmalıdır
                    expect(result.length).toBe(timestamps.length);

                    // Hər element özündən sonrakıdan >= createdAt olmalıdır (azalan sıra)
                    for (let i = 0; i < result.length - 1; i++) {
                        expect(result[i].createdAt).toBeGreaterThanOrEqual(result[i + 1].createdAt);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: project-showcase, Property 7: Showcase Silmə Round-Trip
    it('Property 7: Showcase Silmə Round-Trip — əlavə edildikdən sonra silinən showcase DB-də artıq olmamalıdır', () => {
        // Validates: Requirements 4.3
        fc.assert(
            fc.property(
                fc.record({
                    projectId: fc.string({ minLength: 1 }),
                    userId: fc.string({ minLength: 1 }),
                }),
                (input) => {
                    // Hər iterasiyadan əvvəl təmizlə
                    DB.set('showcases', []);

                    // Showcase əlavə et
                    const saved = add(input);

                    // Əlavə edildiyini yoxla
                    const beforeRemove = DB.get('showcases');
                    expect(beforeRemove.some(s => s.id === saved.id)).toBe(true);

                    // Showcase-i sil
                    remove(saved.id);

                    // Artıq mövcud olmamalıdır
                    const afterRemove = DB.get('showcases');
                    expect(afterRemove.some(s => s.id === saved.id)).toBe(false);
                }
            ),
            { numRuns: 100 }
        );
    });

});
