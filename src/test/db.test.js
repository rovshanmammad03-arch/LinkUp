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

// ─── User Verification Functions ──────────────────────────────────────────────

import { createPendingUser, activateUser, cleanupExpiredPendingUsers } from '../services/db.js';

describe('User Verification Functions', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  describe('createPendingUser', () => {
    
    it('creates a pending user with verified=false and createdAt timestamp', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        university: 'Test University',
        field: 'Computer Science'
      };

      const result = createPendingUser(userData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.verified).toBe(false);
      expect(result.user.createdAt).toBeDefined();
      expect(typeof result.user.createdAt).toBe('number');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.user.id).toBeDefined();
    });

    it('does not create a session for pending user', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        university: 'Test University',
        field: 'Computer Science'
      };

      createPendingUser(userData);
      const session = DB.getOne('session');

      expect(session).toBeNull();
    });

    it('returns error if email already exists with verified account', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        university: 'Test University',
        field: 'Computer Science'
      };

      // Create verified user first
      DB.set('users', [{
        id: 'user1',
        email: 'test@example.com',
        verified: true,
        createdAt: Date.now()
      }]);

      const result = createPendingUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('email_exists');
    });

    it('deletes expired pending user and allows re-registration', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        university: 'Test University',
        field: 'Computer Science'
      };

      // Create expired pending user (>24 hours old)
      const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
      DB.set('users', [{
        id: 'user1',
        email: 'test@example.com',
        verified: false,
        createdAt: twentyFiveHoursAgo
      }]);

      const result = createPendingUser(userData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.verified).toBe(false);
      
      // Check old user was removed
      const users = DB.get('users');
      expect(users.length).toBe(1);
      expect(users[0].id).not.toBe('user1');
    });

    it('returns error if pending user exists and not expired', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        university: 'Test University',
        field: 'Computer Science'
      };

      // Create recent pending user
      DB.set('users', [{
        id: 'user1',
        email: 'test@example.com',
        verified: false,
        createdAt: Date.now() - (1 * 60 * 60 * 1000) // 1 hour ago
      }]);

      const result = createPendingUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('pending_user_exists');
    });

  });

  describe('activateUser', () => {
    
    it('sets verified=true and creates session', () => {
      const email = 'test@example.com';
      
      // Create pending user
      DB.set('users', [{
        id: 'user1',
        email: email,
        name: 'Test User',
        verified: false,
        createdAt: Date.now()
      }]);

      const result = activateUser(email);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.verified).toBe(true);
      
      // Check session was created
      const session = DB.getOne('session');
      expect(session).toBeDefined();
      expect(session.userId).toBe('user1');
    });

    it('deletes verification data from localStorage', () => {
      const email = 'test@example.com';
      
      // Create pending user and verification data
      DB.set('users', [{
        id: 'user1',
        email: email,
        verified: false,
        createdAt: Date.now()
      }]);
      
      localStorage.setItem('lu_verification_' + email, JSON.stringify({
        code: '123456',
        expiresAt: Date.now() + 900000
      }));

      activateUser(email);

      // Check verification data was deleted
      const verificationData = localStorage.getItem('lu_verification_' + email);
      expect(verificationData).toBeNull();
    });

    it('returns error if user not found', () => {
      const result = activateUser('nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('user_not_found');
    });

  });

  describe('cleanupExpiredPendingUsers', () => {
    
    it('removes pending users older than 24 hours', () => {
      const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
      const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
      
      DB.set('users', [
        {
          id: 'user1',
          email: 'expired@example.com',
          verified: false,
          createdAt: twentyFiveHoursAgo
        },
        {
          id: 'user2',
          email: 'recent@example.com',
          verified: false,
          createdAt: oneHourAgo
        },
        {
          id: 'user3',
          email: 'verified@example.com',
          verified: true,
          createdAt: twentyFiveHoursAgo
        }
      ]);

      const result = cleanupExpiredPendingUsers();

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);
      
      const users = DB.get('users');
      expect(users.length).toBe(2);
      expect(users.find(u => u.id === 'user1')).toBeUndefined();
      expect(users.find(u => u.id === 'user2')).toBeDefined();
      expect(users.find(u => u.id === 'user3')).toBeDefined();
    });

    it('returns deletedCount=0 if no expired users', () => {
      DB.set('users', [
        {
          id: 'user1',
          email: 'recent@example.com',
          verified: false,
          createdAt: Date.now() - (1 * 60 * 60 * 1000)
        }
      ]);

      const result = cleanupExpiredPendingUsers();

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(0);
      
      const users = DB.get('users');
      expect(users.length).toBe(1);
    });

    it('cleans up verification data for expired users', () => {
      const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
      const email = 'expired@example.com';
      
      DB.set('users', [{
        id: 'user1',
        email: email,
        verified: false,
        createdAt: twentyFiveHoursAgo
      }]);
      
      localStorage.setItem('lu_verification_' + email, JSON.stringify({
        code: '123456',
        expiresAt: Date.now() + 900000
      }));

      cleanupExpiredPendingUsers();

      // Check verification data was deleted
      const verificationData = localStorage.getItem('lu_verification_' + email);
      expect(verificationData).toBeNull();
    });

    it('preserves verified users regardless of age', () => {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      DB.set('users', [{
        id: 'user1',
        email: 'old-verified@example.com',
        verified: true,
        createdAt: thirtyDaysAgo
      }]);

      const result = cleanupExpiredPendingUsers();

      expect(result.deletedCount).toBe(0);
      
      const users = DB.get('users');
      expect(users.length).toBe(1);
      expect(users[0].id).toBe('user1');
    });

  });

});
