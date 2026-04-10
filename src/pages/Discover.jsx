import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, getUser, initials, addNotification } from '../services/db';
import { Icon } from '@iconify/react';
import NewProjectModal from '../components/discover/NewProjectModal';
import ProjectApplicantsModal from '../components/discover/ProjectApplicantsModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useScrollLock } from '../hooks/useScrollLock';
import { useTranslation } from 'react-i18next';

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
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [selectedApplicantsProject, setSelectedApplicantsProject] = useState(null);
    const [openOptionsId, setOpenOptionsId] = useState(null);
    const [projectToDeleteId, setProjectToDeleteId] = useState(null);
    
    const [levelFilter, setLevelFilter] = useState('all');
    const [fieldFilter, setFieldFilter] = useState('all');
    const [isLevelOpen, setIsLevelOpen] = useState(false);
    const [isFieldOpen, setIsFieldOpen] = useState(false);

    useScrollLock(isNewProjectModalOpen || !!selectedApplicantsProject || !!projectToDeleteId);

    useEffect(() => {
        setUsers(DB.get('users').filter(u => u.id !== currentUser?.id));
        setProjects(DB.get('projects'));
    }, [currentUser]);

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

    const handleApply = (projectId) => {
        if (!currentUser) return;
        const allProjects = DB.get('projects');
        const pIdx = allProjects.findIndex(p => p.id === projectId);
        if (pIdx === -1) return;

        if (!allProjects[pIdx].applicants) allProjects[pIdx].applicants = [];
        if (allProjects[pIdx].applicants.includes(currentUser.id)) return;

        allProjects[pIdx].applicants.push(currentUser.id);
        DB.set('projects', allProjects);
        setProjects(allProjects);
    };

    const handleDeleteProject = (projectId) => {
        setProjectToDeleteId(projectId);
        setOpenOptionsId(null);
    };

    const confirmDelete = () => {
        const allProjects = DB.get('projects');
        const updated = allProjects.filter(p => p.id !== projectToDeleteId);
        DB.set('projects', updated);
        setProjects(updated);
        setProjectToDeleteId(null);
    };

    const handleToggleStatus = (projectId) => {
        const allProjects = DB.get('projects');
        const pIdx = allProjects.findIndex(p => p.id === projectId);
        if (pIdx === -1) return;

        allProjects[pIdx].status = allProjects[pIdx].status === 'completed' ? 'active' : 'completed';
        DB.set('projects', allProjects);
        setProjects(allProjects);
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
        switch(level) {
            case 'Qabaqcıl': return 'bg-emerald-500/10 text-emerald-500';
            case 'Orta': return 'bg-blue-500/10 text-blue-500';
            case 'Başlanğıc': return 'bg-amber-500/10 text-amber-500';
            default: return 'bg-neutral-500/10 text-neutral-500';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 anim-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">{t('discover.title')}</h1>
                    <p className="text-neutral-500 text-base font-light">
                        {tab === 'people' ? t('discover.peopleDesc') : t('discover.projectsDesc')}
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-6">
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

                    {tab === 'people' ? (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button 
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className={`h-11 px-5 discover-btn-base discover-btn-glow ${isSortOpen ? 'discover-btn-active' : ''}`}
                                >
                                    <span className="text-sm font-bold">{t(`discover.sort${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}`)}</span>
                                    <Icon icon="mdi:chevron-down" className={`text-lg transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isSortOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                                        <div className="sort-menu">
                                            {[
                                                { key: 'newest', label: t('discover.sortNewest') },
                                                { key: 'popular', label: t('discover.sortPopular') },
                                                { key: 'skills', label: t('discover.sortMostSkills') },
                                            ].map((opt) => (
                                                <div 
                                                    key={opt.key}
                                                    onClick={() => { setSortBy(opt.key); setIsSortOpen(false); }}
                                                    className={`sort-item ${sortBy === opt.key ? 'selected' : ''}`}
                                                >
                                                    {opt.label}
                                                    {sortBy === opt.key && <Icon icon="mdi:check" className="text-white" />}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsNewProjectModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95 anim-up"
                        >
                            <Icon icon="mdi:plus" className="text-lg" /> {t('discover.createProject')}
                        </button>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            {tab === 'people' && (
                <div className="flex flex-col lg:flex-row gap-4 mb-12">
                    <div className="flex-1 relative group">
                        <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xl group-focus-within:text-brand-400 transition-colors" />
                        <input 
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('discover.searchPlaceholder')} 
                            className="w-full bg-white dark:bg-[#111] border border-black/8 dark:border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-brand-500/50 focus:bg-neutral-50 dark:focus:bg-[#151515] transition-all shadow-sm dark:shadow-xl dark:shadow-black/20"
                        />
                    </div>
                    <div className="flex gap-4">
                        {/* Level Filter Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsLevelOpen(!isLevelOpen)}
                                className={`h-14 px-6 discover-btn-base bg-white dark:bg-[#111] border-black/8 dark:border-white/5 rounded-2xl min-w-[200px] justify-between transition-all ${isLevelOpen ? 'border-brand-500/50 ring-4 ring-brand-500/10' : 'hover:border-black/15 dark:hover:border-white/10'}`}
                            >
                                <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{levelFilter === 'all' ? t('discover.allLevels') : translateLevel(levelFilter, t)}</span>
                                <Icon icon="mdi:chevron-down" className={`text-neutral-400 transition-transform duration-200 ${isLevelOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isLevelOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsLevelOpen(false)} />
                                    <div className="sort-menu min-w-full">
                                        {availableLevels.map(lvl => (
                                            <div 
                                                key={lvl}
                                                onClick={() => { setLevelFilter(lvl); setIsLevelOpen(false); }}
                                                className={`sort-item ${levelFilter === lvl ? 'selected' : ''}`}
                                            >
                                                {lvl === 'all' ? t('discover.allLevels') : translateLevel(lvl, t)}
                                                {levelFilter === lvl && <Icon icon="mdi:check" className="text-white" />}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* Field Filter Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsFieldOpen(!isFieldOpen)}
                                className={`h-14 px-6 discover-btn-base bg-white dark:bg-[#111] border-black/8 dark:border-white/5 rounded-2xl min-w-[200px] justify-between transition-all ${isFieldOpen ? 'border-brand-500/50 ring-4 ring-brand-500/10' : 'hover:border-black/15 dark:hover:border-white/10'}`}
                            >
                                <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{fieldFilter === 'all' ? t('discover.allFields') : translateField(fieldFilter, t)}</span>
                                <Icon icon="mdi:chevron-down" className={`text-neutral-400 transition-transform duration-200 ${isFieldOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isFieldOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsFieldOpen(false)} />
                                    <div className="sort-menu min-w-full">
                                        {availableFields.map(fld => (
                                            <div 
                                                key={fld}
                                                onClick={() => { setFieldFilter(fld); setIsFieldOpen(false); }}
                                                className={`sort-item ${fieldFilter === fld ? 'selected' : ''}`}
                                            >
                                                {fld === 'all' ? t('discover.allFields') : translateField(fld, t)}
                                                {fieldFilter === fld && <Icon icon="mdi:check" className="text-white" />}
                                            </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((u, i) => {
                        const isFollowing = currentUser?.following?.includes(u.id);

                        return (
                            <div key={u.id} className="bg-white dark:bg-[#111]/80 backdrop-blur-xl border border-black/8 dark:border-white/5 rounded-[32px] p-7 anim-up flex flex-col group hover:border-black/15 dark:hover:border-white/10 transition-all duration-300 shadow-sm dark:shadow-2xl" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${u.grad} flex items-center justify-center text-lg font-bold shrink-0 shadow-lg shadow-black/20 ring-4 ring-black/5 dark:ring-white/5`}>
                                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-full" /> : initials(u.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-300 transition-colors leading-tight">{u.name}</h3>
                                            <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider mt-1">{u.university} - {translateField(u.field, t)}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getLevelBadge(u.level)}`}>
                                        {translateLevel(u.level, t)}
                                    </span>
                                </div>

                                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-6 line-clamp-2 h-10">
                                    {u.bio || t('profile.noBio')}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8 flex-1 content-start">
                                    {u.skills?.slice(0, 4).map((sk, si) => (
                                        <span key={si} className="px-3 py-1.5 bg-neutral-100 dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                                            {sk.n}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleViewProfile(u.id)}
                                        className="flex-1 py-3 px-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl text-[11px] font-bold text-neutral-700 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all uppercase tracking-wider active:scale-95"
                                    >
                                        {t('discover.profile')}
                                    </button>
                                    <button 
                                        onClick={() => handleMessage(u.id)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-black/8 dark:border-white/8 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 hover:border-black/15 dark:hover:border-white/15 transition-all active:scale-95"
                                    >
                                        <Icon icon="mdi:chat-processing-outline" className="text-xl" />
                                    </button>
                                    <button 
                                        onClick={() => handleFollow(u.id)}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all active:scale-95 ${isFollowing ? 'border-black/15 dark:border-white/15 text-neutral-900 dark:text-white bg-black/8 dark:bg-white/8' : 'border-black/8 dark:border-white/8 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 hover:border-black/15 dark:hover:border-white/15'}`}
                                    >
                                        <Icon icon={isFollowing ? "mdi:account-check" : "mdi:account-plus-outline"} className="text-xl" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {filteredProjects.map((p, i) => {
                        const author = getUser(p.authorId);
                        return (
                            <div key={p.id} className="bg-white dark:bg-[#111]/60 backdrop-blur-xl border border-black/8 dark:border-white/5 rounded-[32px] p-7 group hover:border-black/15 dark:hover:border-white/10 transition-all anim-up shadow-sm dark:shadow-2xl flex flex-col" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-[18px] bg-gradient-to-br ${p.grad} flex items-center justify-center shrink-0 shadow-lg shadow-black/20`}>
                                            <Icon icon="mdi:folder-star-outline" className="text-white text-2xl" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 leading-tight group-hover:text-brand-500 dark:group-hover:text-brand-300 transition-colors">{p.title}</h3>
                                            <p className="text-[11px] text-neutral-500 font-medium">
                                                {author?.name} · {p.team}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${p.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-brand-600 dark:text-brand-400 bg-brand-400/10'}`}>
                                        {p.status === 'completed' ? t('discover.project.completed') : t('discover.project.active')}
                                    </span>
                                </div>
                                
                                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-6 line-clamp-2 h-10">
                                    {p.desc}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {p.skills?.slice(0, 3).map((sk, si) => (
                                        <span key={si} className="px-3 py-1.5 bg-neutral-100 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-semibold text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">{sk}</span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-end mt-auto pt-4 border-t border-black/8 dark:border-white/5 relative">
                                    {p.authorId === currentUser?.id ? (
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setOpenOptionsId(openOptionsId === p.id ? null : p.id)}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${openOptionsId === p.id ? 'bg-black/10 dark:bg-white/10 text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
                                                >
                                                    <Icon icon="mdi:dots-vertical" className="text-xl" />
                                                </button>

                                                {openOptionsId === p.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenOptionsId(null)} />
                                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl py-2 z-50 anim-up overflow-hidden">
                                                            <button 
                                                                onClick={() => handleToggleStatus(p.id)}
                                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left"
                                                            >
                                                                <Icon icon={p.status === 'completed' ? "mdi:play-circle-outline" : "mdi:check-circle-outline"} className="text-lg" />
                                                                {p.status === 'completed' ? t('discover.project.makeActive') : t('discover.project.markComplete')}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteProject(p.id)}
                                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all text-left"
                                                            >
                                                                <Icon icon="mdi:delete-outline" className="text-lg" />
                                                                {t('discover.project.delete')}
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => setSelectedApplicantsProject(p)}
                                                className="px-6 py-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-700 dark:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                                            >
                                                {t('discover.project.applications')} ({p.applicants?.length || 0})
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleApply(p.id)}
                                            className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${p.applicants?.includes(currentUser?.id) ? 'bg-black/8 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-default' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'}`}
                                        >
                                            {p.applicants?.includes(currentUser?.id) ? t('discover.project.applied') : t('discover.project.apply')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isNewProjectModalOpen && (
                <NewProjectModal 
                    onClose={() => setIsNewProjectModalOpen(false)}
                    onProjectCreated={() => {
                        setProjects(DB.get('projects'));
                    }}
                />
            )}

            {selectedApplicantsProject && (
                <ProjectApplicantsModal 
                    project={selectedApplicantsProject}
                    onClose={() => setSelectedApplicantsProject(null)}
                    onNavigate={onNavigate}
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
        </div>
    );
}
