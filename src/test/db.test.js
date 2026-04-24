// Feature: rich-post-types, Property 9: Post data integrity
// Feature: db, Property: Post CRUD data integrity

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { DB, uid, parseTechnologies } from '../services/db.js';

// ─── localStorage mock ────────────────────────────────────────────────────────
// jsdom provides localStorage but we reset between tests

beforeEach(() => {
  localStorage.clear();
});

// ─── DB.get / DB.set round-trip ───────────────────────────────────────────────

describe('DB — get/set round-trip', () => {

  it('saxlanılan massiv eyni şəkildə oxunur', () => {
    const data = [{ id: '1', name: 'Test' }];
    DB.set('posts', data);
    expect(DB.get('posts')).toEqual(data);
  });

  it('mövcud olmayan açar üçün boş massiv qaytarır', () => {
    expect(DB.get('nonexistent_key_xyz')).toEqual([]);
  });

  it('Property: istənilən JSON-serializable massivi saxlayıb oxuya bilir', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            value: fc.integer(),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (arr) => {
          DB.set('test_prop', arr);
          const result = DB.get('test_prop');
          expect(result).toEqual(arr);
        }
      ),
      { numRuns: 200 }
    );
  });

});

// ─── Post creation data integrity ─────────────────────────────────────────────

describe('Property 9: Post yaradılarkən data bütövlüyü qorunur', () => {

  const POST_TYPES = ['code', 'design', 'project', 'learned', 'other'];

  function createPost({ type, caption, authorId, metadata = {} }) {
    const post = {
      id: uid(),
      authorId,
      caption,
      type,
      metadata,
      likes: [],
      comments: [],
      createdAt: Date.now(),
    };
    const posts = DB.get('posts');
    posts.unshift(post);
    DB.set('posts', posts);
    return post;
  }

  it('Property 9: yaradılan post bütün tələb olunan sahələri ehtiva edir', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constantFrom(...POST_TYPES),
          caption: fc.string({ minLength: 1, maxLength: 300 }),
          authorId: fc.string({ minLength: 1, maxLength: 20 }),
          metadata: fc.record({
            language: fc.option(fc.string({ minLength: 1 })),
            code: fc.option(fc.string()),
            topic: fc.option(fc.string({ minLength: 1 })),
            level: fc.option(fc.constantFrom('beginner', 'intermediate', 'advanced')),
          }),
        }),
        ({ type, caption, authorId, metadata }) => {
          const post = createPost({ type, caption, authorId, metadata });

          // Bütün məcburi sahələr mövcuddur
          expect(post.id).toBeTruthy();
          expect(post.type).toBe(type);
          expect(post.caption).toBe(caption);
          expect(post.authorId).toBe(authorId);
          expect(Array.isArray(post.likes)).toBe(true);
          expect(Array.isArray(post.comments)).toBe(true);
          expect(typeof post.createdAt).toBe('number');
          expect(post.createdAt).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: post DB-yə yazıldıqda geri oxunur', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constantFrom(...POST_TYPES),
          caption: fc.string({ minLength: 1, maxLength: 100 }),
          authorId: fc.string({ minLength: 1, maxLength: 10 }),
        }),
        ({ type, caption, authorId }) => {
          localStorage.clear();
          const post = createPost({ type, caption, authorId });
          const posts = DB.get('posts');
          const found = posts.find(p => p.id === post.id);
          expect(found).toBeDefined();
          expect(found.type).toBe(type);
          expect(found.caption).toBe(caption);
          expect(found.authorId).toBe(authorId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: çoxlu post əlavə edildikdə hamısı saxlanılır', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (count, authorId) => {
          localStorage.clear();
          const created = [];
          for (let i = 0; i < count; i++) {
            created.push(createPost({ type: 'other', caption: `Post ${i}`, authorId }));
          }
          const posts = DB.get('posts');
          expect(posts.length).toBe(count);
        }
      ),
      { numRuns: 50 }
    );
  });

});

// ─── parseTechnologies — post metadata integration ────────────────────────────

describe('parseTechnologies — post metadata integration', () => {

  it('project postunda texnologiyalar düzgün parse edilir', () => {
    const input = 'React, Node.js, TypeScript';
    const post = {
      id: uid(),
      type: 'project',
      caption: 'Test project',
      authorId: 'user_1',
      metadata: {
        projectName: 'Test App',
        technologies: parseTechnologies(input),
      },
      likes: [],
      comments: [],
      createdAt: Date.now(),
    };

    DB.set('posts', [post]);
    const saved = DB.get('posts')[0];

    expect(saved.metadata.technologies).toEqual(['React', 'Node.js', 'TypeScript']);
    expect(saved.metadata.technologies.length).toBe(3);
  });

  it('Property: boş texnologiya inputu boş massivlə saxlanılır', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', null, undefined),
        (emptyInput) => {
          const techs = parseTechnologies(emptyInput);
          expect(techs).toEqual([]);
          expect(techs.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

});
