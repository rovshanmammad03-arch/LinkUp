import { uid } from './db.js';

/**
 * Yeni rol yuvası obyekti yaradır.
 * @param {string} category - Kateqoriya adı
 * @param {number} count - Tələb olunan say (1-10)
 * @returns {{ id: string, category: string, count: number, filledCount: number, status: string }}
 */
export function createRoleSlot(category, count) {
    return {
        id: uid(),
        category,
        count,
        filledCount: 0,
        status: 'open',
    };
}

/**
 * Rol yuvasının kateqoriya adını yoxlayır.
 * Boş string və yalnız boşluqlardan ibarət dəyərləri rədd edir.
 * @param {string} category
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRoleSlotCategory(category) {
    if (!category || category.trim() === '') {
        return { valid: false, error: 'Kateqoriya adı boş ola bilməz' };
    }
    return { valid: true };
}

/**
 * Layihənin açıq rol yuvalarını qaytarır.
 * @param {Array} roleSlots
 * @returns {Array} - yalnız status: 'open' olan yuvalar
 */
export function getOpenSlots(roleSlots) {
    if (!roleSlots) return [];
    return roleSlots.filter(slot => slot.status === 'open');
}

/**
 * Bütün rol yuvalarının bağlı olub-olmadığını yoxlayır.
 * Boş massiv üçün false qaytarır.
 * @param {Array} roleSlots
 * @returns {boolean}
 */
export function allSlotsClosed(roleSlots) {
    if (!roleSlots || roleSlots.length === 0) return false;
    return roleSlots.every(slot => slot.status === 'closed');
}

/**
 * Müraciəti qəbul edərkən rol yuvasını yeniləyir.
 * filledCount artırır, lazım gəldikdə status-u 'closed'-a çevirir.
 * @param {Array} roleSlots - layihənin roleSlots massivi
 * @param {string|null} roleSlotId - müraciətin roleSlot sahəsi
 * @returns {{ updatedSlots: Array, slotClosed: boolean, closedSlotCategory: string|null }}
 */
export function acceptApplicantWithSlot(roleSlots, roleSlotId) {
    if (roleSlotId == null) {
        return { updatedSlots: roleSlots, slotClosed: false, closedSlotCategory: null };
    }

    let slotClosed = false;
    let closedSlotCategory = null;

    const updatedSlots = roleSlots.map(slot => {
        if (slot.id !== roleSlotId) return slot;

        const newFilledCount = slot.filledCount + 1;
        const newStatus = newFilledCount >= slot.count ? 'closed' : slot.status;

        if (newStatus === 'closed' && slot.status !== 'closed') {
            slotClosed = true;
            closedSlotCategory = slot.category;
        }

        return { ...slot, filledCount: newFilledCount, status: newStatus };
    });

    return { updatedSlots, slotClosed, closedSlotCategory };
}

/**
 * Layihənin roleSlots sahəsini normallaşdırır (köhnə layihələr üçün).
 * @param {object} project
 * @returns {Array} - roleSlots massivi (boş massiv əgər yoxdursa)
 */
export function normalizeRoleSlots(project) {
    if (!project || !project.roleSlots) return [];
    return project.roleSlots;
}
