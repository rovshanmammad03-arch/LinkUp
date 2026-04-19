import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ─── Import the function under test ──────────────────────────────────────────
// getParticipantProjects is exported from Profile.jsx
import { getParticipantProjects } from '../pages/Profile.jsx';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const userIdArb = fc.string({ minLength: 1, maxLength: 20 });

const applicantStatusArb = fc.constantFrom('pending', 'accepted', 'rejected', 'left');

const applicantObjectArb = fc.record({
    id: userIdArb,
    status: applicantStatusArb,
});

// A project with fully controlled fields
function makeProjectArb(overrides = {}) {
    return fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        desc: fc.string({ minLength: 0, maxLength: 100 }),
        authorId: userIdArb,
        applicants: fc.array(applicantObjectArb, { minLength: 0, maxLength: 5 }),
        status: fc.constantFrom('active', 'completed'),
        createdAt: fc.integer({ min: 0, max: 9999999999999 }),
        grad: fc.constant('from-brand-500 to-purple-500'),
        skills: fc.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 0, maxLength: 5 }),
        ...overrides,
    });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('participant-project-visibility — Property-Based Tests', () => {

    // Feature: participant-project-visibility, Property 1: Ownership Inclusion
    it('Property 1: Ownership Inclusion — every project where authorId === userId is included', () => {
        fc.assert(
            fc.property(
                userIdArb,
                fc.array(makeProjectArb(), { minLength: 0, maxLength: 10 }),
                (userId, projects) => {
                    const result = getParticipantProjects(userId, projects);
                    const resultIds = new Set(result.map(p => p.id));

                    const ownedProjects = projects.filter(p => p.authorId === userId);
                    for (const owned of ownedProjects) {
                        expect(resultIds.has(owned.id)).toBe(true);
                    }
                }
            ),
            { numRuns: 200 }
        );
    });

    // Feature: participant-project-visibility, Property 2: Accepted Applicant Inclusion
    it('Property 2: Accepted Applicant Inclusion — every project with accepted applicant entry is included', () => {
        fc.assert(
            fc.property(
                userIdArb,
                fc.array(makeProjectArb(), { minLength: 0, maxLength: 10 }),
                (userId, projects) => {
                    const result = getParticipantProjects(userId, projects);
                    const resultIds = new Set(result.map(p => p.id));

                    const acceptedProjects = projects.filter(p =>
                        p.applicants.some(a =>
                            typeof a === 'object' && a !== null &&
                            a.id === userId && a.status === 'accepted'
                        )
                    );
                    for (const accepted of acceptedProjects) {
                        expect(resultIds.has(accepted.id)).toBe(true);
                    }
                }
            ),
            { numRuns: 200 }
        );
    });

    // Feature: participant-project-visibility, Property 3: Non-Accepted Statuses Are Excluded
    it('Property 3: Non-Accepted Statuses Are Excluded — pending/rejected/left applicants are not included', () => {
        fc.assert(
            fc.property(
                userIdArb,
                fc.constantFrom('pending', 'rejected', 'left'),
                makeProjectArb(),
                (userId, nonAcceptedStatus, project) => {
                    // Build a project where userId is a non-accepted applicant and NOT the author
                    const testProject = {
                        ...project,
                        id: 'test_non_accepted_' + userId,
                        authorId: userId + '_other', // ensure not the author
                        applicants: [{ id: userId, status: nonAcceptedStatus }],
                    };

                    const result = getParticipantProjects(userId, [testProject]);
                    expect(result.length).toBe(0);
                }
            ),
            { numRuns: 200 }
        );
    });

    // Feature: participant-project-visibility, Property 4: No Duplicate Projects
    it('Property 4: No Duplicate Projects — result contains each project at most once', () => {
        fc.assert(
            fc.property(
                userIdArb,
                fc.array(makeProjectArb(), { minLength: 0, maxLength: 10 }),
                (userId, projects) => {
                    const result = getParticipantProjects(userId, projects);
                    const ids = result.map(p => p.id);
                    const uniqueIds = new Set(ids);
                    expect(ids.length).toBe(uniqueIds.size);
                }
            ),
            { numRuns: 200 }
        );
    });

    // Feature: participant-project-visibility, Property 4 (edge case): user is both author and accepted applicant
    it('Property 4 (edge): user is both author and accepted applicant — project appears exactly once', () => {
        fc.assert(
            fc.property(
                userIdArb,
                makeProjectArb(),
                (userId, project) => {
                    const testProject = {
                        ...project,
                        authorId: userId,
                        applicants: [{ id: userId, status: 'accepted' }],
                    };

                    const result = getParticipantProjects(userId, [testProject]);
                    expect(result.length).toBe(1);
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: participant-project-visibility, Property 5: Sort Order Invariant
    it('Property 5: Sort Order Invariant — result is sorted by createdAt descending', () => {
        fc.assert(
            fc.property(
                userIdArb,
                fc.array(makeProjectArb(), { minLength: 2, maxLength: 10 }),
                (userId, projects) => {
                    const result = getParticipantProjects(userId, projects);
                    for (let i = 0; i < result.length - 1; i++) {
                        expect(result[i].createdAt).toBeGreaterThanOrEqual(result[i + 1].createdAt);
                    }
                }
            ),
            { numRuns: 200 }
        );
    });

    // Feature: participant-project-visibility, Property 6: Legacy Format Exclusion
    it('Property 6: Legacy Format Exclusion — plain string applicant entries are not treated as accepted', () => {
        fc.assert(
            fc.property(
                userIdArb,
                makeProjectArb(),
                (userId, project) => {
                    // Build a project where userId appears only as a legacy string applicant (not author)
                    const testProject = {
                        ...project,
                        id: 'test_legacy_' + userId,
                        authorId: userId + '_other', // not the author
                        applicants: [userId], // legacy string format
                    };

                    const result = getParticipantProjects(userId, [testProject]);
                    expect(result.length).toBe(0);
                }
            ),
            { numRuns: 200 }
        );
    });

    // Feature: participant-project-visibility, Property 6 (mixed): legacy + object entries
    it('Property 6 (mixed): only object-format entries are evaluated for accepted status', () => {
        fc.assert(
            fc.property(
                userIdArb,
                makeProjectArb(),
                (userId, project) => {
                    // Mix: legacy string for userId + object entry for a different user
                    const testProject = {
                        ...project,
                        id: 'test_mixed_' + userId,
                        authorId: userId + '_other',
                        applicants: [
                            userId, // legacy string — should be ignored
                            { id: userId + '_other2', status: 'accepted' }, // different user
                        ],
                    };

                    const result = getParticipantProjects(userId, [testProject]);
                    // userId is not the author and not an accepted object-format applicant
                    expect(result.length).toBe(0);
                }
            ),
            { numRuns: 200 }
        );
    });

});
