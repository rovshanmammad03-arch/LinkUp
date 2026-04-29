import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, getUser, initials, addNotification } from '../services/db';
import { projectsService } from '../services/projectsService';
import { Icon } from '@iconify/react';
import ProjectApplicantsModal from '../components/discover/ProjectApplicantsModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Button from '../components/common/Button';
import { useScrollLock } from '../hooks/useScrollLock';
import { useTranslation } from 'react-i18next';
import EmptyState from '../components/common/EmptyState';
import { getOpenSlots, allSlotsClosed, normalizeRoleSlots } from '../services/roleSlotUtils';

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

export default function Discover({ onNavigate }) {
    const { currentUser, refreshUser } = useAuth();
    const { t } = useTranslation();
    const [tab, setTab] = useState('people');
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState('');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [selectedApplicantsProject, setSelectedApplicantsProject] = useState(null);
    const [openOptionsId, setOpenOptionsId] = useState(null);
    const [projectToDeleteId, setProjectToDeleteId] = useState(null);
    const [toast, setToast] = useState(null);

    const [levelFilter, setLevelFilter] = useState('all');
    const [fieldFilter, setFieldFilter] = useState('all');
    const [isLevelOpen, setIsLevelOpen] = useState(false);
    const [isFieldOpen, setIsFieldOpen] = useState(false);
    const [applySlotModal, setApplySlotModal] = useState(null); // { projectId, openSlots }

    useScrollLock(!!selectedApplicantsProject || !!projectToDeleteId || !!applySlotModal);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        setUsers(DB.get('users').filter(u => u.id !== currentUser?.id));
        projectsService.getAll().then(setProjects);
    }, [currentUser?.id]);

    // Get unique fields for the dropdown
    const availableFields = ['all', ...new Set(users.map(u => u.field))];
    const availableLevels = ['all', 'Başlanğıc', 'Orta', 'Qabaqcıl'];

    const handleFollow = (targetId) => {
        // ... (rest of handleFollow logic remains same)
        if (!currentUser) return;
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
            addNotification({
                toUserId: targetId,
                fromUserId: currentUser.id,
                type: 'follow',
                text: 'sizi izləməyə başladı',
                route: 'profile',
                routeParams: { userId: currentUser.id },
            });
        }

        DB.set('users', allUsers);
        setUsers(allUsers.filter(u => u.id !== currentUser.id));
        refreshUser();
    };

    const handleMessage = (targetUserId) => {
        onNavigate('messages', { userId: targetUserId });
    };

    const handleApply = async (projectId) => {
        if (!currentUser) return;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const alreadyApplied = project.applicants?.some(a =>
            (typeof a === 'object' ? a.id : a) === currentUser.id
        );
        if (alreadyApplied) {
            showToast(t('discover.project.alreadyApplied'), 'info');
            return;
        }

        const roleSlots = normalizeRoleSlots(project);
        if (roleSlots.length > 0) {
            const openSlots = getOpenSlots(roleSlots);
            setApplySlotModal({ projectId, openSlots });
            return;
        }

        const updated = await projectsService.apply(projectId, { id: currentUser.id, status: 'pending' });
        if (updated) {
            setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
            showToast(t('discover.project.applySuccess'), 'success');
            addNotification({
                toUserId: project.authorId,
                fromUserId: currentUser.id,
                type: 'project_apply',
                text: `"${project.title}" layihənizə müraciət etdi`,
                route: 'discover',
                routeParams: {},
            });
        }
    };

    const handleApplyWithSlot = async (projectId, slotId) => {
        if (!currentUser) return;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updated = await projectsService.apply(projectId, { id: currentUser.id, status: 'pending', roleSlot: slotId });
        if (updated) {
            setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
            setApplySlotModal(null);
            showToast(t('discover.project.applySuccess'), 'success');
            addNotification({
                toUserId: project.authorId,
                fromUserId: currentUser.id,
                type: 'project_apply',
                text: `"${project.title}" layihənizə müraciət etdi`,
                route: 'discover',
                routeParams: {},
            });
        }
    };

    const handleDeleteProject = (projectId) => {
        setProjectToDeleteId(projectId);
        setOpenOptionsId(null);
    };

    const confirmDelete = async () => {
        await projectsService.delete(projectToDeleteId);
        setProjects(prev => prev.filter(p => p.id !== projectToDeleteId));
        setProjectToDeleteId(null);
    };

    const handleToggleStatus = async (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const newStatus = project.status === 'active' ? 'closed' : 'active';
        const updated = await projectsService.update(projectId, { status: newStatus });
        if (updated) setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
        setOpenOptionsId(null);
    };

    const handleCompleteProject = async (projectId) => {
        const updated = await projectsService.update(projectId, { status: 'completed' });
        if (updated) setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
        setOpenOptionsId(null);
    };

    const handleViewProfile = (targetUserId) => {
        onNavigate('profile', { userId: targetUserId });
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.field.toLowerCase().includes(search.toLowerCase()) ||
            u.skills?.some(s => s.n.toLowerCase().includes(search.toLowerCase()));
        const matchesLevel = levelFilter === 'all' || u.level === levelFilter;
        const matchesField = fieldFilter === 'all' || u.field === fieldFilter;
        return matchesSearch && matchesLevel && matchesField;
    }).sort((a, b) => {
        if (sortBy === 'skills') return (b.skills?.length || 0) - (a.skills?.length || 0);
        if (sortBy === 'popular') return (b.followers?.length || 0) - (a.followers?.length || 0);
        return 0;
    });

    const filteredProjects = projects.filter(p => {
        // 'closed' layihələr kəşf etdə görünmür — yalnız sahibinə və qəbul edilmiş üzvlərə görünür
        if (p.status === 'closed') {
            const isOwner = p.authorId === currentUser?.id;
            const isAcceptedMember = (p.applicants || []).some(a =>
                typeof a === 'object' && a.id === currentUser?.id && a.status === 'accepted'
            );
            if (!isOwner && !isAcceptedMember) return false;
        }
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.desc.toLowerCase().includes(search.toLowerCase()) ||
            p.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()));
        return matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === 'popular') return (getUser(b.authorId)?.followers?.length || 0) - (getUser(a.authorId)?.followers?.length || 0);
        return 0;
    });

    const getLevelBadge = (level) => {
        switch (level) {
            case 'Qabaqcıl': return 'bg-emerald-500/10 text-emerald-500';
            case 'Orta': return 'bg-blue-500/10 text-blue-500';
            case 'Başlanğıc': return 'bg-amber-500/10 text-amber-500';
            default: return 'bg-neutral-500/10 text-neutral-500';
        }
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getApplicantCount = (applicants) => {
        return (applicants || []).length;
    };

    const hasApplied = (applicants) => {
        if (!currentUser || !applicants) return false;
        return applicants.some(a => (typeof a === 'object' ? a.id : a) === currentUser.id);
    };

    return (
        <>
            {/* Toast Bildirişi */}
            {toast && (
                <div className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold anim-up transition-all ${
                    toast.type === 'success' ? 'bg-emerald-500 text-white' :
                    toast.type === 'info' ? 'bg-neutral-800 text-white' :
                    'bg-red-500 text-white'
                }`}>
                    <Icon icon={toast.type === 'success' ? 'mdi:check-circle' : toast.type === 'info' ? 'mdi:information' : 'mdi:alert-circle'} className="text-lg shrink-0" />
                    {toast.message}
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 anim-up">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">{t('discover.title')}</h1>
                        <p className="text-neutral-500 text-base font-light">
                            {tab === 'people' ? t('discover.peopleDesc') : t('discover.projectsDesc')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-6 w-full sm:w-auto">
                        <div className="relative flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
                            <div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl border border-black/5 dark:border-white/5 transition-transform duration-300 ease-in-out"
                                style={{ transform: tab === 'people' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}
                            />
                            <button
                                onClick={() => setTab('people')}
                                className={`relative z-10 px-8 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 w-1/2 ${tab === 'people' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                            >
                                {t('discover.people')}
                            </button>
                            <button
                                onClick={() => setTab('projects')}
                                className={`relative z-10 px-8 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 w-1/2 ${tab === 'projects' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                            >
                                {t('discover.projects')}
                            </button>
                        </div>

                        {tab === 'projects' && (
                            <Button
                                onClick={() => onNavigate('new-project')}
                                variant="primary"
                                size="md"
                                className="shadow-lg shadow-brand-500/20 anim-up"
                            >
                                <Icon icon="mdi:plus" className="text-lg" /> {t('discover.createProject')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                {tab === 'people' && (
                    <div className="flex flex-col lg:flex-row gap-4 mb-12">
                        <div className="flex-1 relative group">
                            <Icon icon="mdi:magnify" className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 text-xl group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('discover.searchPlaceholder')}
                                className="w-full bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-neutral-50 dark:focus:bg-black transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Level Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsLevelOpen(!isLevelOpen)}
                                    className={`h-14 px-4 sm:px-6 flex items-center gap-3 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl min-w-[140px] sm:min-w-[180px] justify-between transition-all w-full ${isLevelOpen ? 'border-brand-500/50 ring-4 ring-brand-500/10' : 'hover:border-black/15 dark:hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Icon icon="mdi:signal-variant" className="text-neutral-400 shrink-0" />
                                        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 truncate">
                                            {levelFilter === 'all' ? t('discover.allLevels') : translateLevel(levelFilter, t)}
                                        </span>
                                    </div>
                                    <Icon icon="mdi:chevron-down" className={`text-neutral-400 transition-transform duration-300 ${isLevelOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isLevelOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsLevelOpen(false)} />
                                        <div className="absolute top-full right-0 mt-2 min-w-full bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 anim-up overflow-hidden">
                                            {availableLevels.map(lvl => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => { setLevelFilter(lvl); setIsLevelOpen(false); }}
                                                    className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${levelFilter === lvl ? 'bg-brand-500/10 text-brand-500 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                                                >
                                                    {lvl === 'all' ? t('discover.allLevels') : translateLevel(lvl, t)}
                                                    {levelFilter === lvl && <Icon icon="mdi:check" className="text-brand-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Field Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsFieldOpen(!isFieldOpen)}
                                    className={`h-14 px-4 sm:px-6 flex items-center gap-3 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl min-w-[140px] sm:min-w-[180px] justify-between transition-all w-full ${isFieldOpen ? 'border-brand-500/50 ring-4 ring-brand-500/10' : 'hover:border-black/15 dark:hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Icon icon="mdi:briefcase-outline" className="text-neutral-400 shrink-0" />
                                        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 truncate">
                                            {fieldFilter === 'all' ? t('discover.allFields') : translateField(fieldFilter, t)}
                                        </span>
                                    </div>
                                    <Icon icon="mdi:chevron-down" className={`text-neutral-400 transition-transform duration-300 ${isFieldOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isFieldOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsFieldOpen(false)} />
                                        <div className="absolute top-full right-0 mt-2 min-w-full bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 anim-up overflow-hidden">
                                            {availableFields.map(fld => (
                                                <button
                                                    key={fld}
                                                    onClick={() => { setFieldFilter(fld); setIsFieldOpen(false); }}
                                                    className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${fieldFilter === fld ? 'bg-brand-500/10 text-brand-500 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                                                >
                                                    {fld === 'all' ? t('discover.allFields') : translateField(fld, t)}
                                                    {fieldFilter === fld && <Icon icon="mdi:check" className="text-brand-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                {tab === 'people' ? (
                    filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((u, i) => {
                                const isFollowing = currentUser?.following?.includes(u.id);

                                return (
                                    <div key={u.id} className="bg-white dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-black/8 dark:border-white/10 rounded-[36px] p-5 sm:p-7 anim-up flex flex-col group hover:border-brand-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl dark:hover:shadow-brand-500/5" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div className="flex items-start justify-between mb-6 gap-3">
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${u.grad} flex items-center justify-center text-xl font-bold shrink-0 shadow-lg shadow-black/10 ring-4 ring-white dark:ring-white/5`}>
                                                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-full" /> : initials(u.name)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-brand-500 transition-colors leading-tight truncate">{u.name}</h3>
                                                    <p className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider mt-1 truncate">{u.university}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0 ${getLevelBadge(u.level)}`}>
                                                {translateLevel(u.level, t)}
                                            </span>
                                        </div>

                                    <div className="mb-4">
                                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">{translateField(u.field, t)}</p>
                                        <p className="text-[13px] text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed line-clamp-2 h-10">
                                            {u.bio || t('profile.noBio')}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8 flex-1 content-start">
                                        {u.skills?.slice(0, 4).map((sk, si) => (
                                            <span key={si} className="px-2.5 py-1 bg-black/[0.04] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-lg text-[10px] font-bold text-neutral-500 dark:text-neutral-400 group-hover:border-brand-500/20 transition-colors">
                                                {sk.n}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={() => handleViewProfile(u.id)}
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1 py-3"
                                        >
                                            {t('discover.profile')}
                                        </Button>
                                        <Button
                                            onClick={() => handleMessage(u.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="!w-11 !h-11 !p-0 !rounded-2xl"
                                        >
                                            <Icon icon="mdi:chat-processing-outline" className="text-xl" />
                                        </Button>
                                        <Button
                                            onClick={() => handleFollow(u.id)}
                                            variant={isFollowing ? "secondary" : "ghost"}
                                            size="sm"
                                            className="!w-11 !h-11 !p-0 !rounded-2xl"
                                        >
                                            <Icon icon={isFollowing ? "mdi:account-check" : "mdi:account-plus-outline"} className="text-xl" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 flex justify-center">
                        <EmptyState 
                            icon="mdi:account-search-outline"
                            title={t('discover.noUsersTitle')}
                            description={t('discover.noUsersDesc')}
                            actionLabel={t('discover.clearFilters')}
                            onAction={() => { setSearch(''); setLevelFilter('all'); setFieldFilter('all'); }}
                        />
                    </div>
                )
            ) : (
                filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {filteredProjects.map((p, i) => {
                            const author = getUser(p.authorId);
                            const applicantCount = getApplicantCount(p.applicants);
                            const alreadyApplied = hasApplied(p.applicants);
                            const isOwner = p.authorId === currentUser?.id;

                            return (
                                <div key={p.id} className="bg-white dark:bg-[#0a0a0a]/40 backdrop-blur-xl border border-black/8 dark:border-white/10 rounded-[40px] p-6 sm:p-8 group hover:border-brand-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl anim-up flex flex-col relative overflow-hidden" style={{ animationDelay: `${i * 0.05}s` }}>
                                    {/* Gradient Accent */}
                                    <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${p.grad} opacity-70`} />

                                    <div className="flex items-start justify-between mb-6 pl-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.grad} flex items-center justify-center shrink-0 shadow-lg shadow-black/10`}>
                                                <Icon icon="mdi:folder-star-outline" className="text-white text-3xl" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1.5 leading-tight group-hover:text-brand-500 transition-colors truncate">{p.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-semibold">
                                                    <button
                                                        onClick={() => onNavigate('profile', { userId: p.authorId })}
                                                        className="hover:text-brand-500 transition-colors flex items-center gap-1"
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[8px] overflow-hidden">
                                                            {author?.avatar ? <img src={author.avatar} /> : initials(author?.name)}
                                                        </div>
                                                        {author?.name}
                                                    </button>
                                                    {p.projectType && (
                                                        <span className="bg-black/[0.05] dark:bg-white/[0.05] px-2 py-0.5 rounded-md">{p.projectType}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${p.status === 'completed'
                                                ? 'text-emerald-500 bg-emerald-500/10'
                                                : p.status === 'closed'
                                                    ? 'text-amber-500 bg-amber-500/10'
                                                    : 'text-brand-500 bg-brand-500/10'
                                            }`}>
                                            {p.status === 'completed'
                                                ? t('discover.project.completed')
                                                : p.status === 'closed'
                                                    ? t('discover.project.closed', 'Bağlı')
                                                    : t('discover.project.active')}
                                        </span>
                                    </div>

                                    <p className="text-[14px] text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed mb-6 line-clamp-3 min-h-[3.75rem] pl-4">
                                        {p.desc}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6 pl-4">
                                        {p.stage && (
                                            <span className="px-3 py-1.5 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
                                                <Icon icon="mdi:rocket-outline" className="text-sm" />
                                                {p.stage}
                                            </span>
                                        )}
                                        {p.documentUrl && (
                                            <a
                                                href={p.documentUrl.startsWith('http') ? p.documentUrl : `https://${p.documentUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-all flex items-center gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Icon icon="mdi:link-variant" className="text-sm" />
                                                {t('discover.project.document', 'Sənəd')}
                                            </a>
                                        )}
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mb-8 pl-4">
                                        {p.skills?.slice(0, 4).map((sk, si) => (
                                            <span key={si} className="px-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">{sk}</span>
                                        ))}
                                    </div>

                                    {/* Role Slots */}
                                    {(() => {
                                        const roleSlots = normalizeRoleSlots(p);
                                        if (roleSlots.length === 0) return null;
                                        return (
                                            <div className="mb-6 pl-4">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                    <Icon icon="mdi:account-multiple-outline" className="text-sm" />
                                                    Rol Yuvaları
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {roleSlots.map(slot => (
                                                        <div key={slot.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl">
                                                            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">{slot.category}</span>
                                                            <span className="text-[10px] text-neutral-400 font-medium" title={`${slot.filledCount} yer tutulub, cəmi ${slot.count} yer`}>
                                                                {slot.filledCount}/{slot.count} nəfər
                                                            </span>
                                                            {slot.status === 'open' ? (
                                                                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[9px] font-bold uppercase tracking-wide">Açıq</span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-md text-[9px] font-bold uppercase tracking-wide">Dolu</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-6 border-t border-black/8 dark:border-white/10 pl-4">
                                        <div className="flex items-center gap-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5">
                                                <Icon icon="mdi:account-group-outline" className="text-base" />
                                                {applicantCount}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Icon icon="mdi:clock-outline" className="text-base" />
                                                {formatDate(p.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 relative">
                                            {isOwner ? (
                                                <>
                                                    <Button
                                                        onClick={() => setSelectedApplicantsProject(p)}
                                                        variant="secondary"
                                                        size="sm"
                                                        className="!px-4 !py-2.5 text-[10px]"
                                                    >
                                                        Müraciətlər
                                                        {applicantCount > 0 && <span className="ml-1 px-1.5 bg-brand-500 text-white rounded-full">{applicantCount}</span>}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setOpenOptionsId(openOptionsId === p.id ? null : p.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!w-10 !h-10 !p-0"
                                                    >
                                                        <Icon icon="mdi:dots-vertical" className="text-xl" />
                                                    </Button>
                                                    {openOptionsId === p.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setOpenOptionsId(null)} />
                                                            <div className="absolute bottom-full right-0 mb-3 w-52 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-[24px] shadow-2xl py-2 z-50 anim-up overflow-hidden">
                                                                <button onClick={() => { onNavigate('new-project', { projectId: p.id }); setOpenOptionsId(null); }} className="w-full px-5 py-3 flex items-center gap-3 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all text-left">
                                                                    <Icon icon="mdi:pencil-outline" className="text-lg text-brand-500" /> Redaktə et
                                                                </button>
                                                                <button onClick={() => handleToggleStatus(p.id)} className="w-full px-5 py-3 flex items-center gap-3 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all text-left">
                                                                    <Icon icon={p.status === 'active' ? "mdi:lock-outline" : "mdi:lock-open-outline"} className="text-lg text-amber-500" /> {p.status === 'active' ? 'Bağla' : 'Aç'}
                                                                </button>
                                                                <button onClick={() => handleDeleteProject(p.id)} className="w-full px-5 py-3 flex items-center gap-3 text-xs font-bold text-rose-500 hover:bg-rose-500/5 transition-all text-left">
                                                                    <Icon icon="mdi:delete-outline" className="text-lg" /> Sil
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={() => handleApply(p.id)}
                                                    disabled={alreadyApplied || p.status === 'completed' || p.status === 'closed' || allSlotsClosed(normalizeRoleSlots(p))}
                                                    variant={alreadyApplied ? "secondary" : "primary"}
                                                    size="sm"
                                                    className="!px-6 shadow-brand-500/20"
                                                >
                                                    <Icon icon={alreadyApplied ? "mdi:check-circle-outline" : "mdi:rocket-launch-outline"} className="text-base" />
                                                    {alreadyApplied
                                                        ? t('discover.project.applied')
                                                        : allSlotsClosed(normalizeRoleSlots(p))
                                                            ? 'Bütün yerlər doludur'
                                                            : t('discover.project.apply')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 flex justify-center">
                        <EmptyState 
                            icon="mdi:folder-search-outline"
                            title={t('discover.noProjectsTitle')}
                            description={t('discover.noProjectsDesc')}
                            actionLabel={t('discover.clearFilters')}
                            onAction={() => { setSearch(''); setLevelFilter('all'); setFieldFilter('all'); }}
                        />
                    </div>
                )
            )}
            </div>

            {selectedApplicantsProject && (
                <ProjectApplicantsModal
                    project={selectedApplicantsProject}
                    onClose={() => setSelectedApplicantsProject(null)}
                    onNavigate={onNavigate}
                    onProjectUpdated={(updatedProject) => {
                        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
                        setSelectedApplicantsProject(updatedProject);
                    }}
                />
            )}

            {projectToDeleteId && (
                <ConfirmModal
                    title={t('discover.project.delete')}
                    message={t('newProject.deleteConfirm')}
                    confirmText={t('post.confirmDelete')}
                    cancelText={t('post.cancel')}
                    onConfirm={confirmDelete}
                    onCancel={() => setProjectToDeleteId(null)}
                />
            )}

            {/* Rol Seçim Modalı */}
            {applySlotModal && (
                <>
                    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm" onClick={() => setApplySlotModal(null)} />
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-[32px] shadow-2xl w-full max-w-md p-8 anim-up">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Rol Seçin</h2>
                                    <p className="text-sm text-neutral-500 mt-1">Müraciət etmək istədiyiniz rolu seçin</p>
                                </div>
                                <button
                                    onClick={() => setApplySlotModal(null)}
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-neutral-400"
                                >
                                    <Icon icon="mdi:close" className="text-xl" />
                                </button>
                            </div>

                            {applySlotModal.openSlots.length === 0 ? (
                                <div className="text-center py-8">
                                    <Icon icon="mdi:lock-outline" className="text-4xl text-neutral-300 dark:text-neutral-600 mb-3 mx-auto" />
                                    <p className="text-sm font-semibold text-neutral-500">Bütün yerlər doludur</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {applySlotModal.openSlots.map(slot => (
                                        <button
                                            key={slot.id}
                                            onClick={() => handleApplyWithSlot(applySlotModal.projectId, slot.id)}
                                            className="flex items-center justify-between px-5 py-4 bg-black/[0.03] dark:bg-white/[0.03] border border-black/8 dark:border-white/8 rounded-2xl hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group text-left"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-neutral-800 dark:text-white group-hover:text-brand-500 transition-colors">{slot.category}</p>
                                                <p className="text-[11px] text-neutral-400 mt-0.5">{slot.filledCount}/{slot.count} yer dolu</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-wide">Açıq</span>
                                                <Icon icon="mdi:arrow-right" className="text-neutral-300 group-hover:text-brand-500 transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setApplySlotModal(null)}
                                className="w-full mt-4 py-3 rounded-2xl text-sm font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Ləğv et
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
