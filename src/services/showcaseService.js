import { DB, uid } from './db.js';

/**
 * Bütün showcase elementlərini qaytarır.
 * @returns {Array}
 */
export function getAll() {
    return DB.get('showcases');
}

/**
 * Müəyyən layihəyə aid showcase-ləri createdAt azalan sırada qaytarır.
 * @param {string} projectId
 * @returns {Array}
 */
export function getByProject(projectId) {
    return DB.get('showcases')
        .filter(function(s) { return s.projectId === projectId; })
        .sort(function(a, b) { return b.createdAt - a.createdAt; });
}

/**
 * Yeni showcase elementi əlavə edir.
 * @param {{ projectId: string, userId: string, liveUrl?: string, image?: string, description?: string }} data
 * @returns {Object} Yeni əlavə edilmiş showcase elementi
 */
export function add(data) {
    const showcases = DB.get('showcases');
    const newItem = {
        id: uid(),
        projectId: data.projectId,
        userId: data.userId,
        liveUrl: data.liveUrl || null,
        image: data.image || null,
        description: data.description || null,
        createdAt: Date.now()
    };
    showcases.push(newItem);
    DB.set('showcases', showcases);
    return newItem;
}

/**
 * Showcase elementini siyahıdan çıxarır.
 * @param {string} showcaseId
 * @returns {boolean}
 */
export function remove(showcaseId) {
    const showcases = DB.get('showcases');
    const filtered = showcases.filter(function(s) { return s.id !== showcaseId; });
    DB.set('showcases', filtered);
    return true;
}

/**
 * İstifadəçinin layihənin iştirakçısı olub olmadığını yoxlayır.
 * @param {string} userId
 * @param {{ authorId: string, applicants?: Array }} project
 * @returns {boolean}
 */
export function isParticipant(userId, project) {
    if (project.authorId === userId) return true;
    const applicants = project.applicants || [];
    return applicants.some(function(a) {
        // Support both { id, status } and { userId, status } formats
        const aId = a.userId || a.id;
        return aId === userId && a.status === 'accepted';
    });
}

/**
 * URL-in etibarlı formatda olub olmadığını yoxlayır (http:// və ya https:// ilə başlamalıdır).
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
}

/**
 * Fayl ölçüsünün 2MB limitindən kiçik və ya bərabər olub olmadığını yoxlayır.
 * @param {number} sizeInBytes
 * @returns {boolean}
 */
export function isValidFileSize(sizeInBytes) {
    return sizeInBytes <= 2 * 1024 * 1024;
}
