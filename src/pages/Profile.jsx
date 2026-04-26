import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, initials, addNotification } from '../services/db';
import { Icon } from '@iconify/react';
import { useScrollLock } from '../hooks/useScrollLock';
import PostCard from '../components/feed/PostCard';
import ConfirmModal from '../components/common/ConfirmModal';
import Button from '../components/common/Button';
import ProjectApplicantsModal from '../components/discover/ProjectApplicantsModal';
import { useTranslation } from 'react-i18next';

const SKILL_LEVEL_KEYS = ['beginner', 'intermediate', 'advanced'];
const SKILL_LEVELS_AZ = ['Başlanğıc', 'Orta', 'Qabaqcıl'];
const LINK_TYPES = ['Portfolio', 'GitHub', 'LinkedIn', 'Twitter', 'Kaggle', 'Behance', 'Digər'];

/**
 * Returns all projects where the user is either the author OR an accepted applicant.
 * Handles both legacy (string) and new (object) applicant formats.
 * Deduplicates and sorts by createdAt descending.
 *
 * @param {string} userId
 * @param {Array} allProjects
 * @returns {Array}
 */
export function getParticipantProjects(userId, allProjects) {
    if (!userId || !Array.isArray(allProjects)) return [];

    const seen = new Set();
    const result = [];

    for (const project of allProjects) {
        if (seen.has(project.id)) continue;

        // Check 1: user is the author
        if (project.authorId === userId) {
            seen.add(project.id);
            result.push(project);
            continue;
        }

        // Check 2: user is an accepted applicant (object format only)
        const applicants = project.applicants || [];
        for (const applicant of applicants) {
            if (typeof applicant !== 'object' || applicant === null) {
                // Legacy string format — skip (treat as pending, not accepted)
                continue;
            }
            if (applicant.id === userId && applicant.status === 'accepted') {
                seen.add(project.id);
                result.push(project);
                break;
            }
        }
    }

    // Sort by createdAt descending (newest first)
    result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return result;
}

// Maps stored AZ value → translation key
function translateField(field, t) {
    const map = {
        'Proqramlaşdırma': t('auth.fields.programming'),
        'Dizayn': t('auth.fields.design'),
        'Marketinq': t('auth.fields.marketing'),
        'Digər': t('auth.fields.other'),
    };
    return map[field] || field;
}

function translateLevel(level, t) {
    const map = {
        'Başlanğıc': t('discover.levels.beginner'),
        'Orta': t('discover.levels.intermediate'),
        'Qabaqcıl': t('discover.levels.advanced'),
    };
    return map[level] || level;
}

export default function Profile({ params, onNavigate }) {
    const { currentUser, setCurrentUser, refreshUser } = useAuth();
    const { t } = useTranslation();
    const [tab, setTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [userProjects, setUserProjects] = useState([]);
    const [openProjectOptionsId, setOpenProjectOptionsId] = useState(null);
    const [projectToDeleteId, setProjectToDeleteId] = useState(null);
    const [selectedApplicantsProject, setSelectedApplicantsProject] = useState(null);
    const [stats, setStats] = useState({ posts: 0, following: 0, followers: 0 });
    const [editOpen, setEditOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [userList, setUserList] = useState({ open: false, type: '', data: [] });
    const [targetUser, setTargetUser] = useState(null);

    // Edit form state
    const [form, setForm] = useState({});
    const [skills, setSkills] = useState([]);
    const [links, setLinks] = useState([]);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('Orta');
    const [newLinkType, setNewLinkType] = useState('Portfolio');
    const [newLinkVal, setNewLinkVal] = useState('');

    // Custom Dropdown States
    const [isLevelOpen, setIsLevelOpen] = useState(false);
    const [isNewSkillLevelOpen, setIsNewSkillLevelOpen] = useState(false);
    const [isNewLinkTypeOpen, setIsNewLinkTypeOpen] = useState(false);

    useScrollLock(editOpen || !!selectedPost || userList.open || !!projectToDeleteId || !!selectedApplicantsProject);

    const isOwnProfile = !params?.userId || params.userId === currentUser?.id;

    useEffect(() => {
        if (isOwnProfile) {
            setTargetUser(currentUser);
        } else {
            const user = DB.get('users').find(u => u.id === params.userId);
            setTargetUser(user);
        }
    }, [params?.userId, currentUser]);

    useEffect(() => {
        if (!targetUser) return;
        
        const allPosts = DB.get('posts');
        let filtered = [];
        
        if (tab === 'posts') {
            filtered = allPosts.filter(p => p.authorId === targetUser.id);
        } else if (tab === 'liked') {
            filtered = allPosts.filter(p => p.likes?.includes(targetUser.id));
        }
        
        setPosts(filtered);

        // Load this user's projects (authored + accepted participant)
        const allProjects = DB.get('projects');
        setUserProjects(getParticipantProjects(targetUser.id, allProjects));

        // Stats are based on user's own posts, regardless of active tab view
        setStats({
            posts: allPosts.filter(p => p.authorId === targetUser.id).length,
            following: targetUser.following?.length || 0,
            followers: targetUser.followers?.length || 0
        });
    }, [targetUser?.id, tab]);

    const handleFollow = (uid) => {
        const targetId = uid || targetUser.id;
        if (!currentUser || targetId === currentUser.id) return;
        
        const allUsers = DB.get('users');
        const meIdx = allUsers.findIndex(u => u.id === currentUser.id);
        const targetIdx = allUsers.findIndex(u => u.id === targetId);
        
        if (meIdx === -1 || targetIdx === -1) return;

        const isFollowing = allUsers[meIdx].following?.includes(targetId);

        if (isFollowing) {
            allUsers[meIdx].following = allUsers[meIdx].following.filter(id => id !== targetId);
            allUsers[targetIdx].followers = allUsers[targetIdx].followers?.filter(id => id !== currentUser.id) || [];
        } else {
            allUsers[meIdx].following = [...(allUsers[meIdx].following || []), targetId];
            allUsers[targetIdx].followers = [...(allUsers[targetIdx].followers || []), currentUser.id];
        }

        DB.set('users', allUsers);
        
        // Update local state for targetUser if we are on their page
        if (targetId === targetUser.id) {
            setTargetUser({ ...allUsers[targetIdx] });
        }
        
        // Update userList data if modal is open to reflect live changes
        if (userList.open) {
            setUserList(prev => ({ ...prev })); // Trigger re-render
        }
        
        refreshUser();
    };

    const openUserList = (type) => {
        const ids = type === 'followers' ? (targetUser.followers || []) : (targetUser.following || []);
        setUserList({
            open: true,
            type: type === 'followers' ? t('profile.followersTitle') : t('profile.followingTitle'),
            data: ids
        });
    };

    const openEdit = () => {
        setForm({
            name: currentUser?.name || '',
            bio: currentUser?.bio || '',
            field: currentUser?.field || '',
            university: currentUser?.university || '',
            level: currentUser?.level || 'Orta',
        });
        setSkills([...(currentUser?.skills || [])]);
        setLinks([...(currentUser?.links || [])]);
        setEditOpen(true);
    };

    const saveEdit = () => {
        const users = DB.get('users');
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx === -1) return;
        users[idx] = {
            ...users[idx],
            ...form,
            skills,
            links,
        };
        DB.set('users', users);
        setCurrentUser({ ...users[idx] });
        setEditOpen(false);
    };

    const handleAvatarUpload = () => {
        if (!isOwnProfile) return;
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const users = DB.get('users');
                const idx = users.findIndex(u => u.id === currentUser.id);
                users[idx].avatar = ev.target.result;
                DB.set('users', users);
                setCurrentUser({ ...users[idx] });
            };
            reader.readAsDataURL(file);
        };
        inp.click();
    };

    const handleCoverUpload = () => {
        if (!isOwnProfile) return;
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const users = DB.get('users');
                const idx = users.findIndex(u => u.id === currentUser.id);
                users[idx].cover = ev.target.result;
                DB.set('users', users);
                setCurrentUser({ ...users[idx] });
            };
            reader.readAsDataURL(file);
        };
        inp.click();
    };

    const handleToggleProjectStatus = (projectId) => {
        const allProjects = DB.get('projects');
        const pIdx = allProjects.findIndex(p => p.id === projectId);
        if (pIdx === -1) return;
        const current = allProjects[pIdx].status;
        allProjects[pIdx].status = current === 'active' ? 'closed' : 'active';
        DB.set('projects', allProjects);
        setUserProjects(getParticipantProjects(targetUser.id, allProjects));
    };

    const handleCompleteProject = (projectId) => {
        const allProjects = DB.get('projects');
        const pIdx = allProjects.findIndex(p => p.id === projectId);
        if (pIdx === -1) return;
        allProjects[pIdx].status = 'completed';
        DB.set('projects', allProjects);
        setUserProjects(getParticipantProjects(targetUser.id, allProjects));
    };

    const confirmDeleteProject = () => {
        const allProjects = DB.get('projects');
        const updated = allProjects.filter(p => p.id !== projectToDeleteId);
        DB.set('projects', updated);
        setUserProjects(getParticipantProjects(targetUser?.id, updated));
        // Layihəyə aid showcases-ləri sil
        const orphanShowcases = DB.get('showcases');
        DB.set('showcases', orphanShowcases.filter(s => s.projectId !== projectToDeleteId));
        // Layihəyə aid qrup mesajlarını sil
        const allMessages = DB.get('messages');
        DB.set('messages', allMessages.filter(m => m.projectId !== projectToDeleteId));
        setProjectToDeleteId(null);
    };

    const handleApply = (projectId) => {
        if (!currentUser) return;
        const allProjects = DB.get('projects');
        const pIdx = allProjects.findIndex(p => p.id === projectId);
        if (pIdx === -1) return;
        if (!allProjects[pIdx].applicants) allProjects[pIdx].applicants = [];
        const alreadyApplied = allProjects[pIdx].applicants.some(a =>
            (typeof a === 'object' ? a.id : a) === currentUser.id
        );
        if (alreadyApplied) return;
        allProjects[pIdx].applicants.push({ id: currentUser.id, status: 'pending' });
        DB.set('projects', allProjects);
        setUserProjects(getParticipantProjects(targetUser.id, allProjects));
        addNotification({
            toUserId: allProjects[pIdx].authorId,
            fromUserId: currentUser.id,
            type: 'project_apply',
            text: `"${allProjects[pIdx].title}" layihənizə müraciət etdi`,
            route: 'discover',
            routeParams: {},
        });
    };

    const addSkill = () => {
        const name = newSkillName.trim();
        if (!name) return;
        if (skills.some(s => s.n.toLowerCase() === name.toLowerCase())) return;
        setSkills([...skills, { n: name, l: newSkillLevel }]);
        setNewSkillName('');
        setIsNewSkillLevelOpen(false);
    };

    const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));

    const addLink = () => {
        const val = newLinkVal.trim();
        if (!val) return;
        setLinks([...links, { t: newLinkType, v: val }]);
        setNewLinkVal('');
        setIsNewLinkTypeOpen(false);
    };

    const removeLink = (i) => setLinks(links.filter((_, idx) => idx !== i));

    if (!targetUser) return <div className="p-20 text-center text-neutral-500">{t('profile.loading')}</div>;

    const isFollowing = currentUser?.following?.includes(targetUser.id);

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 md:px-6 anim-up">
                {/* Cover & Avatar */}
                <div className="relative mb-4 md:mb-6">
                    {/* Cover */}
                    <div 
                        className={`relative h-48 md:h-64 w-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 group ${isOwnProfile ? 'cursor-pointer' : ''}`} 
                        onClick={handleCoverUpload}
                    >
                        {targetUser?.cover ? (
                            <img src={targetUser.cover} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${targetUser?.grad} opacity-80`} />
                        )}
                        {/* Hover overlay */}
                        {isOwnProfile && (
                            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[1px]">
                                <Icon icon="mdi:image-edit-outline" className="text-white text-3xl drop-shadow-lg" />
                                <span className="text-white text-xs font-semibold drop-shadow-lg">{t('profile.editCover')}</span>
                            </div>
                        )}
                    </div>

                    {/* Avatar — overlaps cover bottom */}
                    <div className="absolute -bottom-12 md:-bottom-14 left-4 md:left-8">
                        <div
                            onClick={handleAvatarUpload}
                            className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br ${targetUser?.grad} border-4 border-white dark:border-neutral-950 flex items-center justify-center text-3xl md:text-4xl font-bold shadow-2xl shrink-0 group relative ${isOwnProfile ? 'cursor-pointer overflow-hidden' : ''}`}
                        >
                            {targetUser?.avatar ? (
                                <img src={targetUser.avatar} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                initials(targetUser?.name)
                            )}
                            {isOwnProfile && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Icon icon="mdi:camera" className="text-white text-2xl drop-shadow-lg" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Name row + Actions — below cover, never overlapping */}
                <div className="flex items-end justify-between pl-32 md:pl-40 pr-2 mb-6 min-h-[3.5rem]">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-0.5">
                            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white truncate max-w-[180px] sm:max-w-none">{targetUser?.name}</h1>
                            <Icon icon="mdi:check-decagram" className="text-brand-400 text-lg md:text-xl shrink-0" />
                        </div>
                        <p className="text-neutral-500 text-[11px] md:text-sm font-medium">{translateField(targetUser?.field, t)} · {targetUser?.university}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {isOwnProfile ? (
                            <Button onClick={openEdit} variant="secondary" size="sm" className="md:size-md">
                                <Icon icon="mdi:pencil-outline" className="text-brand-500" />
                                <span className="hidden sm:inline">{t('profile.editProfile')}</span>
                            </Button>
                        ) : (
                            <>
                                <Button onClick={() => onNavigate('messages', { userId: targetUser.id })} variant="secondary" size="sm" className="md:size-md">
                                    <Icon icon="mdi:chat-processing-outline" className="text-brand-500 text-lg" />
                                    <span className="hidden sm:inline">{t('profile.startChat')}</span>
                                </Button>
                                <Button onClick={() => handleFollow()} variant={isFollowing ? "danger" : "primary"} size="sm" className="md:size-md">
                                    <Icon icon={isFollowing ? "mdi:account-check" : "mdi:account-plus"} className="text-lg" />
                                    <span className="hidden sm:inline">{isFollowing ? t('profile.followingStatus') : t('profile.follow')}</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats for Mobile */}
                <div className="md:hidden glass-card rounded-2xl p-4 mb-6 flex justify-around border border-black/5 dark:border-white/5">
                    <div className="text-center">
                        <span className="block text-lg font-bold text-neutral-900 dark:text-white">{stats.posts}</span>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{t('profile.statPosts')}</span>
                    </div>
                    <div className="w-px bg-black/5 dark:bg-white/5" />
                    <button onClick={() => openUserList('followers')} className="text-center">
                        <span className="block text-lg font-bold text-neutral-900 dark:text-white">{stats.followers}</span>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{t('profile.followers')}</span>
                    </button>
                    <div className="w-px bg-black/5 dark:bg-white/5" />
                    <button onClick={() => openUserList('following')} className="text-center">
                        <span className="block text-lg font-bold text-neutral-900 dark:text-white">{stats.following}</span>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{t('profile.following')}</span>
                    </button>
                </div>

                {/* Stats + Content grid */}
                <div className="grid md:grid-cols-[1fr,2fr] gap-8">
                    {/* Sidebar: single card, clear sections */}
                    <div className="space-y-5">
                        <div className="glass-card rounded-3xl overflow-hidden flex flex-col divide-y divide-black/8 dark:divide-white/[0.07] border border-black/[0.06] dark:border-white/[0.08]">
                            {/* About */}
                            <div className="px-5 py-5">
                                <h3 className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-[0.14em] mb-3">
                                    {t('profile.about_me')}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                    {targetUser?.bio || t('profile.noBio')}
                                </p>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/8 dark:border-white/[0.08] px-3.5 py-3 min-h-[3.25rem]">
                                        <Icon icon="mdi:school-outline" className="text-xl text-brand-400 shrink-0" />
                                        <span className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                                            {targetUser?.university || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/8 dark:border-white/[0.08] px-3.5 py-3 min-h-[3.25rem]">
                                        <Icon icon="mdi:briefcase-outline" className="text-xl text-brand-400 shrink-0" />
                                        <span className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                                            {translateLevel(targetUser?.level, t)} · {translateField(targetUser?.field, t)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            {targetUser?.skills?.length > 0 && (
                                <div className="px-5 py-5">
                                    <h3 className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-[0.14em] mb-3">
                                        {t('profile.skills')}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {targetUser.skills.map((s, i) => {
                                            const levelColor = s.l === 'Başlanğıc' || s.l === 'beginner' ? 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20' 
                                                             : s.l === 'Orta' || s.l === 'intermediate' ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                                                             : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
                                            return (
                                            <span
                                                key={i}
                                                className="text-xs px-3 py-1.5 rounded-xl bg-black/[0.06] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-200 flex items-center gap-2"
                                            >
                                                <span className="font-medium">{s.n}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold uppercase tracking-widest ${levelColor}`}>
                                                    {s.l}
                                                </span>
                                            </span>
                                        )})}
                                    </div>
                                </div>
                            )}

                            {/* Links */}
                            {targetUser?.links?.length > 0 && (
                                <div className="px-5 py-5">
                                    <h3 className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-[0.14em] mb-3">
                                        {t('profile.links')}
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {targetUser.links.map((l, i) => (
                                            <a
                                                key={i}
                                                href={`https://${l.v.replace(/^https?:\/\//, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 bg-black/[0.04] dark:bg-white/[0.05] border border-black/8 dark:border-white/[0.08] text-xs text-neutral-700 dark:text-neutral-200 hover:border-brand-500/40 hover:bg-brand-500/[0.06] dark:hover:bg-brand-500/10 transition-all"
                                            >
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500 dark:text-brand-400">
                                                    <Icon icon="mdi:link-variant" className="text-lg" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                                        {l.t}
                                                    </span>
                                                    <span className="block truncate text-brand-600 dark:text-brand-400 group-hover:text-brand-500 dark:group-hover:text-brand-300">
                                                        {l.v.replace(/^https?:\/\//, '')}
                                                    </span>
                                                </span>
                                                <Icon
                                                    icon="mdi:open-in-new"
                                                    className="text-neutral-400 group-hover:text-brand-400 shrink-0 text-base"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stats — minimal row at card footer (hidden on mobile, replaced by mobile stats card above) */}
                            <div className="hidden md:flex items-stretch px-1 py-2.5 sm:px-2 bg-black/[0.02] dark:bg-white/[0.02]">
                                <div className="flex min-h-[2.75rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-center">
                                    <span className="text-base font-semibold tabular-nums leading-none text-neutral-900 dark:text-white">
                                        {stats.posts}
                                    </span>
                                    <span className="max-w-full truncate text-[10px] leading-tight text-neutral-500 dark:text-neutral-500">
                                        {t('profile.statPosts')}
                                    </span>
                                </div>
                                <div className="w-px shrink-0 bg-black/10 dark:bg-white/10" aria-hidden />
                                <button
                                    type="button"
                                    className="group flex min-h-[2.75rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500/50"
                                    onClick={() => openUserList('followers')}
                                >
                                    <span className="text-base font-semibold tabular-nums leading-none text-neutral-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                        {stats.followers}
                                    </span>
                                    <span className="max-w-full truncate text-[10px] leading-tight text-neutral-500 underline decoration-transparent underline-offset-2 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-400 group-hover:decoration-brand-500/40">
                                        {t('profile.followers')}
                                    </span>
                                </button>
                                <div className="w-px shrink-0 bg-black/10 dark:bg-white/10" aria-hidden />
                                <button
                                    type="button"
                                    className="group flex min-h-[2.75rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500/50"
                                    onClick={() => openUserList('following')}
                                >
                                    <span className="text-base font-semibold tabular-nums leading-none text-neutral-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                        {stats.following}
                                    </span>
                                    <span className="max-w-full truncate text-[10px] leading-tight text-neutral-500 underline decoration-transparent underline-offset-2 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-400 group-hover:decoration-brand-500/40">
                                        {t('profile.following')}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="min-w-0">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-4 md:gap-8 border-b border-black/8 dark:border-white/5 mb-8 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setTab('posts')}
                            className={`pb-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all relative shrink-0 ${tab === 'posts' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                        >
                            <Icon icon="mdi:view-grid-outline" className={tab === 'posts' ? 'text-brand-400' : ''} />
                            {t('profile.posts')}
                            {tab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                        </button>
                        <button
                            onClick={() => setTab('projects')}
                            className={`pb-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all relative shrink-0 ${tab === 'projects' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                        >
                            <Icon icon="mdi:folder-star-outline" className={tab === 'projects' ? 'text-emerald-400' : ''} />
                            {t('profile.projects')}
                            {tab === 'projects' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                        </button>
                        {isOwnProfile && (
                            <button
                                onClick={() => setTab('liked')}
                                className={`pb-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all relative shrink-0 ${tab === 'liked' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                            >
                                <Icon icon="mdi:heart-outline" className={tab === 'liked' ? 'text-rose-500' : ''} />
                                {t('profile.liked')}
                                {tab === 'liked' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                            </button>
                        )}
                    </div>

                    {tab === 'projects' ? (
                        <div className="grid grid-cols-1 gap-4 anim-up">
                            {userProjects.length > 0 ? (
                                userProjects.map((p, i) => {
                                    const isOwner = p.authorId === currentUser?.id;
                                    const isParticipant = !isOwner && (p.applicants || []).some(a => {
                                        if (typeof a !== 'object' || a === null) return false;
                                        return a.id === currentUser?.id && a.status === 'accepted';
                                    });
                                    return (
                                    <div
                                        key={p.id}
                                        className={`bg-white dark:bg-[#111]/80 border rounded-[28px] p-6 group transition-all shadow-sm dark:shadow-xl anim-up ${
                                            p.status === 'completed'
                                                ? 'border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/50 dark:hover:border-emerald-500/30'
                                                : p.status === 'closed'
                                                ? 'border-amber-500/30 dark:border-amber-500/20 hover:border-amber-500/50 dark:hover:border-amber-500/30'
                                                : 'border-black/8 dark:border-white/5 hover:border-black/15 dark:hover:border-white/10'
                                        }`}
                                        style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.grad} flex items-center justify-center shrink-0 shadow-lg shadow-black/20`}>
                                                    <Icon icon="mdi:folder-star-outline" className="text-white text-xl" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors leading-tight">{p.title}</h3>
                                                    {p.projectType && (
                                                        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{p.projectType}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                                    p.status === 'completed'
                                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                                        : p.status === 'closed'
                                                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20'
                                                        : 'text-brand-600 dark:text-brand-400 bg-brand-400/10 border border-brand-500/20'
                                                }`}>
                                                    {p.status === 'completed' 
                                                        ? t('discover.project.completed') 
                                                        : p.status === 'closed'
                                                        ? t('discover.project.closed', 'Bağlı')
                                                        : t('discover.project.active')}
                                                </span>
                                                {isParticipant && (
                                                    <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                                                        {t('profile.participant') || 'İştirakçı'}
                                                    </span>
                                                )}
                                                {isOwner && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setOpenProjectOptionsId(openProjectOptionsId === p.id ? null : p.id)}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all ${
                                                                openProjectOptionsId === p.id
                                                                    ? 'bg-black/10 dark:bg-white/10 border-black/15 dark:border-white/15 text-neutral-900 dark:text-white'
                                                                    : 'border-black/8 dark:border-white/8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                                            }`}
                                                        >
                                                            <Icon icon="mdi:dots-vertical" className="text-base" />
                                                        </button>
                                                        {openProjectOptionsId === p.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setOpenProjectOptionsId(null)} />
                                                                <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl py-2 z-50 anim-up overflow-hidden">
                                                                    <button
                                                                        onClick={() => { onNavigate('new-project', { projectId: p.id }); setOpenProjectOptionsId(null); }}
                                                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold text-brand-500 dark:text-brand-400 hover:bg-brand-500/10 transition-all text-left"
                                                                    >
                                                                        <Icon icon="mdi:pencil-outline" className="text-lg" />
                                                                        {t('profile.editProject')}
                                                                    </button>
                                                                    {/* active ↔ closed toggle */}
                                                                    {p.status !== 'completed' && (
                                                                        <button
                                                                            onClick={() => { handleToggleProjectStatus(p.id); setOpenProjectOptionsId(null); }}
                                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left"
                                                                        >
                                                                            <Icon icon={p.status === 'active' ? 'mdi:lock-outline' : 'mdi:lock-open-outline'} className="text-lg" />
                                                                            {p.status === 'active'
                                                                                ? t('discover.project.closeApply', 'Müraciəti Bağla')
                                                                                : t('discover.project.openApply', 'Müraciəti Aç')}
                                                                        </button>
                                                                    )}
                                                                    {/* closed → completed */}
                                                                    {p.status === 'closed' && (
                                                                        <button
                                                                            onClick={() => { handleCompleteProject(p.id); setOpenProjectOptionsId(null); }}
                                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all text-left"
                                                                        >
                                                                            <Icon icon="mdi:check-circle-outline" className="text-lg" />
                                                                            {t('discover.project.markComplete')}
                                                                        </button>
                                                                    )}
                                                                    {/* completed → active */}
                                                                    {p.status === 'completed' && (
                                                                        <button
                                                                            onClick={() => { handleToggleProjectStatus(p.id); setOpenProjectOptionsId(null); }}
                                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left"
                                                                        >
                                                                            <Icon icon="mdi:play-circle-outline" className="text-lg" />
                                                                            {t('discover.project.makeActive')}
                                                                        </button>
                                                                    )}
                                                                    <div className="mx-3 my-1 border-t border-black/5 dark:border-white/5" />
                                                                    <button
                                                                        onClick={() => { setProjectToDeleteId(p.id); setOpenProjectOptionsId(null); }}
                                                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all text-left"
                                                                    >
                                                                        <Icon icon="mdi:delete-outline" className="text-lg" />
                                                                        {t('discover.project.delete')}
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-4 line-clamp-2">{p.desc}</p>

                                        {p.skills?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {p.skills.slice(0, 5).map((sk, si) => (
                                                    <span key={si} className="px-3 py-1 bg-neutral-100 dark:bg-black/30 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                                                        {sk}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
                                            <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Icon icon="mdi:account-group-outline" className="text-sm" />
                                                    {t('discover.project.applicantsCount', { count: (p.applicants || []).filter(a => typeof a === 'object' && a !== null && a.status === 'accepted').length })}
                                                </span>
                                                {p.team && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:account-multiple-outline" className="text-sm" />
                                                        {p.team}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Sahibi: müraciətlər modalını aç */}
                                            {isOwner && (
                                                <button
                                                    onClick={() => setSelectedApplicantsProject(p)}
                                                    className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center gap-1 uppercase tracking-wider"
                                                >
                                                    <Icon icon="mdi:open-in-new" className="text-xs" />
                                                    {t('discover.project.applications')}
                                                </button>
                                            )}
                                            {/* Ziyarətçi: birbaşa müraciət et */}
                                            {!isOwner && !isParticipant && currentUser && (() => {
                                                const alreadyApplied = (p.applicants || []).some(a =>
                                                    (typeof a === 'object' ? a.id : a) === currentUser.id
                                                );
                                                const canApply = p.status === 'active';
                                                return (
                                                    <button
                                                        onClick={() => canApply && !alreadyApplied && handleApply(p.id)}
                                                        disabled={!canApply || alreadyApplied}
                                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 uppercase tracking-wider ${
                                                            alreadyApplied
                                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                                                : !canApply
                                                                ? 'bg-black/5 dark:bg-white/5 text-neutral-400 cursor-not-allowed'
                                                                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20'
                                                        }`}
                                                    >
                                                        <Icon icon={alreadyApplied ? 'mdi:check-circle-outline' : 'mdi:send-outline'} className="text-sm" />
                                                        {alreadyApplied
                                                            ? t('discover.project.applied')
                                                            : !canApply
                                                            ? t('discover.project.closed', 'Bağlı')
                                                            : t('discover.project.apply')}
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    );
                                })
                            ) : (
                                <div className="bg-black/3 dark:bg-white/5 border border-black/10 dark:border-white/10 border-dashed rounded-[40px] py-20 flex flex-col items-center justify-center gap-4 text-neutral-400 dark:text-neutral-500">
                                    <Icon icon="mdi:folder-off-outline" className="text-5xl opacity-20" />
                                    <p className="text-sm font-light">{t('profile.noProjectsYet')}</p>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => onNavigate('new-project')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                        >
                                            <Icon icon="mdi:plus" className="text-base" />
                                            {t('discover.createProject')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 anim-up">
                            {posts.length > 0 ? (
                                posts.map((p, i) => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPost(p)}
                                        className="aspect-square bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-[32px] overflow-hidden group relative cursor-pointer shadow-sm dark:shadow-lg hover:border-black/15 dark:hover:border-white/10 transition-all"
                                    >
                                        {p.image ? (
                                            <img src={p.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-brand-500/5 text-brand-400/40 p-6 text-center">
                                                <Icon icon={p.type === 'code' ? 'mdi:code-braces' : p.type === 'design' ? 'mdi:palette-outline' : 'mdi:format-quote-close'} className="text-4xl mb-3" />
                                                <p className="text-[10px] font-medium leading-relaxed italic line-clamp-3">"{p.caption}"</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 backdrop-blur-[2px]">
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <Icon icon="mdi:heart" className="text-xl text-rose-500" />
                                                {p.likes?.length || 0}
                                            </div>
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <Icon icon="mdi:comment" className="text-xl text-brand-400" />
                                                {p.comments?.length || 0}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 bg-black/3 dark:bg-white/5 border border-black/10 dark:border-white/10 border-dashed rounded-[40px] py-20 flex flex-col items-center justify-center gap-4 text-neutral-400 dark:text-neutral-500">
                                    <Icon icon={tab === 'posts' ? "mdi:image-off-outline" : "mdi:heart-off-outline"} className="text-5xl opacity-20" />
                                    <p className="text-sm font-light">
                                        {tab === 'posts' ? t('profile.noPostsYet') : t('profile.noLikesYet')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Redesigned Modal */}
            {editOpen && (
                <div
                    className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}
                >
                    <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl my-auto" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{t('profile.myProfile')}</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="px-8 py-4 space-y-6">
                            {/* Ad ve Soyad */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1">{t('profile.nameLabel')}</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:border-brand-500/50 outline-none transition-all"
                                    placeholder={t('profile.namePlaceholder')}
                                />
                            </div>

                            {/* Uni & Field Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1">{t('profile.universityLabel')}</label>
                                    <input
                                        value={form.university}
                                        onChange={e => setForm({ ...form, university: e.target.value })}
                                        className="w-full bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:border-brand-500/50 outline-none transition-all"
                                        placeholder={t('auth.university')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1">{t('profile.fieldLabel')}</label>
                                    <input
                                        value={form.field}
                                        onChange={e => setForm({ ...form, field: e.target.value })}
                                        className="w-full bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:border-brand-500/50 outline-none transition-all"
                                        placeholder={t('auth.field')}
                                    />
                                </div>
                            </div>

                            {/* Level Custom Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1">{t('profile.levelLabel')}</label>
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsLevelOpen(!isLevelOpen)}
                                        className={`w-full bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white flex items-center justify-between transition-all hover:border-black/15 dark:hover:border-white/10 ${isLevelOpen ? 'border-brand-500/50 ring-2 ring-brand-500/10' : ''}`}
                                    >
                                        <span>{translateLevel(form.level, t)}</span>
                                        <Icon icon="mdi:chevron-down" className={`text-neutral-400 transition-transform ${isLevelOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isLevelOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsLevelOpen(false)} />
                                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 rounded-xl overflow-hidden z-50 shadow-xl dark:shadow-2xl anim-up">
                                                {SKILL_LEVELS_AZ.map(l => (
                                                    <div 
                                                        key={l}
                                                        onClick={() => {
                                                            setForm({ ...form, level: l });
                                                            setIsLevelOpen(false);
                                                        }}
                                                        className={`px-4 py-3 text-sm cursor-pointer transition-all flex items-center justify-between group ${form.level === l ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'}`}
                                                    >
                                                        {translateLevel(l, t)}
                                                        {form.level === l && <Icon icon="mdi:check" className="text-brand-500 dark:text-brand-400" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1">{t('profile.bioLabel')}</label>
                                <textarea
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                    className="w-full bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:border-brand-500/50 outline-none transition-all resize-none h-24"
                                    placeholder={t('profile.bioPlaceholder')}
                                />
                            </div>

                            {/* Skills */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1">{t('profile.skillsLabel')}</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {skills.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-[#171717] border border-black/8 dark:border-white/5 rounded-lg text-[12px] text-neutral-700 dark:text-neutral-300">
                                            {s.n} · {s.l}
                                            <button onClick={() => removeSkill(i)} className="hover:text-red-500 transition-colors">✕</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={newSkillName}
                                        onChange={e => setNewSkillName(e.target.value)}
                                        className="flex-1 bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white focus:border-brand-500/50 outline-none"
                                        placeholder={t('profile.skillNamePlaceholder')}
                                    />
                                    {/* New Skill Level Custom Dropdown */}
                                    <div className="relative w-32">
                                        <button 
                                            onClick={() => setIsNewSkillLevelOpen(!isNewSkillLevelOpen)}
                                            className={`w-full h-full bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white flex items-center justify-between hover:border-black/15 dark:hover:border-white/10 ${isNewSkillLevelOpen ? 'border-brand-500/50' : ''}`}
                                        >
                                            <span className="truncate">{translateLevel(newSkillLevel, t)}</span>
                                            <Icon icon="mdi:chevron-down" className="text-neutral-400 shrink-0" />
                                        </button>
                                        
                                        {isNewSkillLevelOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsNewSkillLevelOpen(false)} />
                                                <div className="absolute bottom-full left-0 w-40 mb-2 bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 rounded-xl overflow-hidden z-50 shadow-xl dark:shadow-2xl anim-up">
                                                    {SKILL_LEVELS_AZ.map(l => (
                                                        <div 
                                                            key={l}
                                                            onClick={() => {
                                                                setNewSkillLevel(l);
                                                                setIsNewSkillLevelOpen(false);
                                                            }}
                                                            className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-all ${newSkillLevel === l ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'}`}
                                                        >
                                                            {translateLevel(l, t)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={addSkill}
                                        className="w-10 h-10 shrink-0 bg-brand-600 hover:bg-brand-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
                                    >
                                        <Icon icon="mdi:plus" className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1">{t('profile.linksLabel')}</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {links.map((l, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-[#171717] border border-black/8 dark:border-white/5 rounded-lg text-[12px] text-neutral-700 dark:text-neutral-300">
                                            {l.t}: {l.v}
                                            <button onClick={() => removeLink(i)} className="hover:text-red-500 transition-colors">✕</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {/* Link Type Custom Dropdown */}
                                    <div className="relative w-32">
                                        <button 
                                            onClick={() => setIsNewLinkTypeOpen(!isNewLinkTypeOpen)}
                                            className={`w-full h-full bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white flex items-center justify-between hover:border-black/15 dark:hover:border-white/10 ${isNewLinkTypeOpen ? 'border-brand-500/50' : ''}`}
                                        >
                                            <span className="truncate">{newLinkType}</span>
                                            <Icon icon="mdi:chevron-down" className="text-neutral-400 shrink-0" />
                                        </button>
                                        
                                        {isNewLinkTypeOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsNewLinkTypeOpen(false)} />
                                                <div className="absolute bottom-full left-0 w-40 mb-2 bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 rounded-xl overflow-hidden z-50 shadow-xl dark:shadow-2xl anim-up h-48 overflow-y-auto custom-scrollbar">
                                                    {LINK_TYPES.map(lt => (
                                                        <div 
                                                            key={lt}
                                                            onClick={() => {
                                                                setNewLinkType(lt);
                                                                setIsNewLinkTypeOpen(false);
                                                            }}
                                                            className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-all ${newLinkType === lt ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'}`}
                                                        >
                                                            {lt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        value={newLinkVal}
                                        onChange={e => setNewLinkVal(e.target.value)}
                                        className="flex-1 bg-black/5 dark:bg-[#121212] border border-black/8 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white focus:border-brand-500/50 outline-none"
                                        placeholder="github.com/username"
                                    />
                                    <button
                                        onClick={addLink}
                                        className="w-10 h-10 shrink-0 bg-brand-600 hover:bg-brand-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
                                    >
                                        <Icon icon="mdi:plus" className="text-xl" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-8 py-8 flex gap-4 mt-2">
                            <button
                                onClick={saveEdit}
                                className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/10"
                            >
                                {t('profile.save')}
                            </button>
                            <button
                                onClick={() => {
                                    setEditOpen(false);
                                    setIsLevelOpen(false);
                                    setIsNewSkillLevelOpen(false);
                                    setIsNewLinkTypeOpen(false);
                                }}
                                className="flex-1 bg-transparent border border-black/10 dark:border-white/10 text-neutral-700 dark:text-white font-bold py-3.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            >
                                {t('profile.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <div
                    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedPost(null); }}
                >
                    <div className="w-full max-w-lg anim-up">
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={() => setSelectedPost(null)}
                                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                            >
                                <Icon icon="mdi:close" className="text-2xl" />
                            </button>
                        </div>
                        <PostCard 
                            post={selectedPost} 
                            onUpdate={(updatedPost) => {
                                setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                                setSelectedPost(updatedPost);
                            }}
                            onDelete={(id) => {
                                setPosts(prev => prev.filter(p => p.id !== id));
                                setSelectedPost(null);
                            }}
                            onNavigate={onNavigate}
                        />
                    </div>
                </div>
            )}

            {/* User List Modal (Followers/Following) */}
            {userList.open && (
                <div
                    className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setUserList({ ...userList, open: false }); }}
                >
                    <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl anim-up h-[500px]">
                        <div className="px-6 py-5 border-b border-black/8 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest">{userList.type}</h3>
                            <button onClick={() => setUserList({ ...userList, open: false })} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                                <Icon icon="mdi:close" className="text-xl" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                            {userList.data.length > 0 ? userList.data.map(uid => {
                                const u = DB.get('users').find(x => x.id === uid);
                                if (!u) return null;
                                const isMe = u.id === currentUser?.id;
                                const isFollowed = currentUser?.following?.includes(u.id);
                                
                                return (
                                    <div key={uid} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors group">
                                        <div 
                                            className="flex items-center gap-3 flex-1 cursor-pointer"
                                            onClick={() => {
                                                setUserList({ ...userList, open: false });
                                                onNavigate('profile', { userId: u.id });
                                            }}
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${u.grad} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg`}>
                                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-xl" /> : initials(u.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">{u.name}</div>
                                                <div className="text-[10px] text-neutral-500 truncate">{u.field}</div>
                                            </div>
                                        </div>
                                        
                                        {!isMe && (
                                            <button 
                                                onClick={() => handleFollow(u.id)}
                                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isFollowed ? 'bg-black/5 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 border border-black/10 dark:border-white/10' : 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'}`}
                                            >
                                                {isFollowed ? 'Ləğv Et' : 'İzlə'}
                                            </button>
                                        )}
                                    </div>
                                );
                            }) : (
                                <div className="h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 gap-3 opacity-40">
                                    <Icon icon="mdi:account-group-outline" className="text-5xl" />
                                    <p className="text-xs font-medium uppercase tracking-widest text-center px-10 leading-loose">Hələ heç bir istifadəçi yoxdur</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {projectToDeleteId && (
                <ConfirmModal
                    title={t('discover.project.delete')}
                    message={t('newProject.deleteConfirm')}
                    confirmText={t('post.confirmDelete')}
                    cancelText={t('post.cancel')}
                    onConfirm={confirmDeleteProject}
                    onCancel={() => setProjectToDeleteId(null)}
                />
            )}
            {selectedApplicantsProject && (
                <ProjectApplicantsModal
                    project={selectedApplicantsProject}
                    onClose={() => setSelectedApplicantsProject(null)}
                    onNavigate={onNavigate}
                    onProjectUpdated={(updatedProject) => {
                        setUserProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
                        setSelectedApplicantsProject(updatedProject);
                    }}
                />
            )}
        </>
    );
}
