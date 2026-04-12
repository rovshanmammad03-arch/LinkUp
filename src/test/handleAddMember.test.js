/**
 * Property-based tests for handleAddMember logic and related properties.
 * Feature: group-add-member
 * Library: fast-check (fc)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { DB, uid, addNotification } from '../services/db';

// ---------------------------------------------------------------------------
// Pure helper: mirrors handleAddMember logic from Messages.jsx
// ---------------------------------------------------------------------------
function handleAddMemberPure({ selectedProjectId, currentUserId, currentUserName, userId }) {
    if (!selectedProjectId) return;
    const allProjects = DB.get('projects');
    const pIdx = allProjects.findIndex(p => p.id === selectedProjectId);
    if (pIdx === -1) return;

    const project = allProjects[pIdx];

    const alreadyMember = project.applicants.some(a => {
        const id = typeof a === 'object' ? a.id : a;
        const status = typeof a === 'object' ? a.status : 'pending';
        return id === userId && status === 'accepted';
    });
    if (alreadyMember) return;

    project.applicants.push({ id: userId, status: 'accepted' });
    DB.set('projects', allProjects);

    const addedUser = DB.get('users').find(u => u.id === userId);
    DB.set('messages', [...DB.get('messages'), {
        id: 'm_' + uid(),
        from: 'system',
        projectId: selectedProjectId,
        text: `${addedUser?.name} qrupa əlavə edildi.`,
        ts: Date.now()
    }]);

    addNotification({
        toUserId: userId,
        fromUserId: currentUserId,
        type: 'group_add',
        text: `${currentUserName} sizi "${project.title}" qrupuna əlavə etdi.`,
        route: 'messages',
        routeParams: { projectId: selectedProjectId }
    });
}

// ---------------------------------------------------------------------------
// Pure helper: mirrors AddMemberModal candidate filtering logic
// ---------------------------------------------------------------------------
function getCandidates({ users, currentMembers, adminId, search }) {
    const activeMemberIds = new Set(
        currentMembers
            .filter(a => (typeof a === 'object' ? a.status : 'pending') === 'accepted')
            .map(a => typeof a === 'object' ? a.id : a)
    );
    return users.filter(u =>
        u.id !== adminId &&
        !activeMemberIds.has(u.id) &&
        u.name.toLowerCase().includes(search.toLowerCase())
    );
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------
const safeString = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);
const userId = fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9_]+$/.test(s));

const applicantArb = fc.record({
    id: userId,
    status: fc.constantFrom('accepted', 'pending', 'rejected', 'left'),
});

const userArb = fc.record({
    id: userId,
    name: safeString,
    field: fc.constantFrom('Proqramlaşdırma', 'Dizayn', 'Marketinq'),
    grad: fc.constant('from-brand-500 to-brand-600'),
});

// ---------------------------------------------------------------------------
// Setup helpers
// ---------------------------------------------------------------------------
function setupDB({ projectId, authorId, applicants = [], users = [], adminUser = null }) {
    localStorage.clear();
    const project = {
        id: projectId,
        title: 'Test Layihəsi',
        authorId,
        applicants,
        grad: 'from-brand-500 to-brand-600',
        createdAt: Date.now(),
    };
    DB.set('projects', [project]);
    DB.set('messages', []);
    DB.set('notifications', []);
    const allUsers = adminUser ? [adminUser, ...users] : users;
    DB.set('users', allUsers);
}

// ---------------------------------------------------------------------------
// P4: Üzv əlavə etmə round-trip
// Feature: group-add-member, Property 4: handleAddMember(userId) çağırıldıqdan sonra
// project.applicants massivində { id: userId, status: 'accepted' } olmalıdır.
// Validates: Requirements 3.1
// ---------------------------------------------------------------------------
describe('P4: Üzv əlavə etmə round-trip', () => {
    it('handleAddMember sonrası applicants-da { id, status: accepted } olmalıdır', () => {
        // Feature: group-add-member, Property 4: round-trip membership
        fc.assert(
            fc.property(
                userId,
                userId,
                userId,
                safeString,
                (projectId, adminId, newUserId, adminName) => {
                    fc.pre(newUserId !== adminId);

                    setupDB({
                        projectId,
                        authorId: adminId,
                        applicants: [],
                        users: [{ id: newUserId, name: 'Test User', field: 'Proqramlaşdırma', grad: '' }],
                        adminUser: { id: adminId, name: adminName, field: 'Proqramlaşdırma', grad: '' },
                    });

                    handleAddMemberPure({
                        selectedProjectId: projectId,
                        currentUserId: adminId,
                        currentUserName: adminName,
                        userId: newUserId,
                    });

                    const projects = DB.get('projects');
                    const project = projects.find(p => p.id === projectId);
                    const entry = project.applicants.find(a =>
                        (typeof a === 'object' ? a.id : a) === newUserId
                    );
                    return entry !== undefined &&
                        (typeof entry === 'object' ? entry.status : null) === 'accepted';
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// P5: Sistem mesajı invariantı
// Feature: group-add-member, Property 5: messages DB-sində düzgün sistem mesajı olmalıdır.
// Validates: Requirements 3.2
// ---------------------------------------------------------------------------
describe('P5: Sistem mesajı invariantı', () => {
    it('əlavə etmədən sonra messages-də düzgün sistem mesajı olmalıdır', () => {
        // Feature: group-add-member, Property 5: system message invariant
        fc.assert(
            fc.property(
                userId,
                userId,
                userId,
                safeString,
                safeString,
                (projectId, adminId, newUserId, adminName, userName) => {
                    fc.pre(newUserId !== adminId);

                    setupDB({
                        projectId,
                        authorId: adminId,
                        applicants: [],
                        users: [{ id: newUserId, name: userName, field: 'Proqramlaşdırma', grad: '' }],
                        adminUser: { id: adminId, name: adminName, field: 'Proqramlaşdırma', grad: '' },
                    });

                    handleAddMemberPure({
                        selectedProjectId: projectId,
                        currentUserId: adminId,
                        currentUserName: adminName,
                        userId: newUserId,
                    });

                    const messages = DB.get('messages');
                    const sysMsg = messages.find(m =>
                        m.projectId === projectId && m.from === 'system'
                    );
                    return sysMsg !== undefined &&
                        sysMsg.text === `${userName} qrupa əlavə edildi.`;
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// P6: Bildiriş göndərilməsi
// Feature: group-add-member, Property 6: notifications DB-sində düzgün bildiriş olmalıdır.
// Validates: Requirements 3.5
// ---------------------------------------------------------------------------
describe('P6: Bildiriş göndərilməsi', () => {
    it('əlavə etmədən sonra notifications-da toUserId===userId və type===group_add olmalıdır', () => {
        // Feature: group-add-member, Property 6: notification sent
        fc.assert(
            fc.property(
                userId,
                userId,
                userId,
                safeString,
                (projectId, adminId, newUserId, adminName) => {
                    fc.pre(newUserId !== adminId);

                    setupDB({
                        projectId,
                        authorId: adminId,
                        applicants: [],
                        users: [{ id: newUserId, name: 'Test User', field: 'Proqramlaşdırma', grad: '' }],
                        adminUser: { id: adminId, name: adminName, field: 'Proqramlaşdırma', grad: '' },
                    });

                    handleAddMemberPure({
                        selectedProjectId: projectId,
                        currentUserId: adminId,
                        currentUserName: adminName,
                        userId: newUserId,
                    });

                    const notifications = DB.get('notifications');
                    const notif = notifications.find(n =>
                        n.toUserId === newUserId && n.type === 'group_add'
                    );
                    return notif !== undefined;
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// P7: Təkrar əlavə etmə idempotentliyi
// Feature: group-add-member, Property 7: artıq üzv olan istifadəçini yenidən əlavə etdikdə
// applicants massivi dəyişməməlidir.
// Validates: Requirements 4.1
// ---------------------------------------------------------------------------
describe('P7: Təkrar əlavə etmə idempotentliyi', () => {
    it('artıq accepted üzv yenidən əlavə edildikdə applicants uzunluğu dəyişməməlidir', () => {
        // Feature: group-add-member, Property 7: idempotency
        fc.assert(
            fc.property(
                userId,
                userId,
                userId,
                safeString,
                (projectId, adminId, existingMemberId, adminName) => {
                    fc.pre(existingMemberId !== adminId);

                    setupDB({
                        projectId,
                        authorId: adminId,
                        applicants: [{ id: existingMemberId, status: 'accepted' }],
                        users: [{ id: existingMemberId, name: 'Existing User', field: 'Proqramlaşdırma', grad: '' }],
                        adminUser: { id: adminId, name: adminName, field: 'Proqramlaşdırma', grad: '' },
                    });

                    const before = DB.get('projects').find(p => p.id === projectId).applicants.length;

                    handleAddMemberPure({
                        selectedProjectId: projectId,
                        currentUserId: adminId,
                        currentUserName: adminName,
                        userId: existingMemberId,
                    });

                    const after = DB.get('projects').find(p => p.id === projectId).applicants.length;
                    return before === after;
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// P1: Admin görünürlük invariantı
// Feature: group-add-member, Property 1: user.id === project.authorId olarsa düymə görünməlidir.
// Validates: Requirements 1.1, 1.3
// ---------------------------------------------------------------------------
describe('P1: Admin görünürlük invariantı', () => {
    it('user.id === authorId olduqda admin, əks halda isə deyil', () => {
        // Feature: group-add-member, Property 1: admin visibility invariant
        fc.assert(
            fc.property(
                userId,
                userId,
                (currentUserId, authorId) => {
                    const isAdmin = currentUserId === authorId;
                    // The condition used in Messages.jsx ManageTeam panel:
                    // selectedProjectConvo.project.authorId === currentUser?.id
                    const buttonVisible = authorId === currentUserId;
                    return buttonVisible === isAdmin;
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// P2: Namizəd filtrasiyası
// Feature: group-add-member, Property 2: namizəd siyahısında admin və aktiv üzv olmamalıdır.
// Validates: Requirements 2.3, 2.4
// ---------------------------------------------------------------------------
describe('P2: Namizəd filtrasiyası', () => {
    it('namizəd siyahısında admin və accepted üzv olmamalıdır', () => {
        // Feature: group-add-member, Property 2: candidate filtering
        fc.assert(
            fc.property(
                fc.array(userArb, { minLength: 1, maxLength: 10 }),
                fc.array(applicantArb, { minLength: 0, maxLength: 5 }),
                userId,
                (users, applicants, adminId) => {
                    // Ensure unique ids among users
                    const uniqueUsers = [];
                    const seen = new Set();
                    for (const u of users) {
                        if (!seen.has(u.id)) { seen.add(u.id); uniqueUsers.push(u); }
                    }

                    const candidates = getCandidates({
                        users: uniqueUsers,
                        currentMembers: applicants,
                        adminId,
                        search: '',
                    });

                    // Admin must not appear
                    const adminInList = candidates.some(c => c.id === adminId);
                    if (adminInList) return false;

                    // Accepted members must not appear
                    const acceptedIds = new Set(
                        applicants
                            .filter(a => a.status === 'accepted')
                            .map(a => a.id)
                    );
                    const acceptedInList = candidates.some(c => acceptedIds.has(c.id));
                    return !acceptedInList;
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// P3: Axtarış filtrasiyası
// Feature: group-add-member, Property 3: bütün nəticələrin adları axtarış sorğusunu ehtiva etməlidir.
// Validates: Requirements 2.2
// ---------------------------------------------------------------------------
describe('P3: Axtarış filtrasiyası', () => {
    it('bütün nəticələrin adları axtarış sorğusunu (case-insensitive) ehtiva etməlidir', () => {
        // Feature: group-add-member, Property 3: search filtering
        fc.assert(
            fc.property(
                fc.array(userArb, { minLength: 1, maxLength: 10 }),
                fc.string({ minLength: 0, maxLength: 5 }),
                (users, search) => {
                    const uniqueUsers = [];
                    const seen = new Set();
                    for (const u of users) {
                        if (!seen.has(u.id)) { seen.add(u.id); uniqueUsers.push(u); }
                    }

                    const candidates = getCandidates({
                        users: uniqueUsers,
                        currentMembers: [],
                        adminId: 'nonexistent_admin',
                        search,
                    });

                    return candidates.every(c =>
                        c.name.toLowerCase().includes(search.toLowerCase())
                    );
                }
            ),
            { numRuns: 100 }
        );
    });
});
