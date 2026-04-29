import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB } from '../services/db';
import { postsService } from '../services/postsService';
import PostCard from '../components/feed/PostCard';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

export default function Dashboard({ onNavigate }) {
    const { currentUser, refreshUser } = useAuth();
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedType, setFeedType] = useState('all');

    useEffect(() => {
        refreshUser();
        const loadPosts = async () => {
            setLoading(true);
            const allPosts = await postsService.getAll();
            if (feedType === 'following' && currentUser) {
                const myFollowing = Array.isArray(currentUser.following) ? currentUser.following : [];
                setPosts(allPosts.filter(p => myFollowing.includes(p.authorId) || p.authorId === currentUser.id));
            } else {
                setPosts(allPosts);
            }
            setLoading(false);
        };
        loadPosts();
    }, [feedType, currentUser?.id]);

    const profileCompletion = (u) => {
        if (!u) return 0;
        let score = 0, total = 5;
        if (u.avatar) score++;
        if (u.bio && u.bio.length > 0) score++;
        if (u.field) score++;
        if (u.university) score++;
        if (u.skills && u.skills.length >= 1) score++;
        return Math.round((score / total) * 100);
    };

    const getMissingItems = (u) => {
        if (!u) return [];
        const missing = [];
        if (!u.avatar) missing.push(t('dashboard.missingAvatar'));
        if (!u.bio || u.bio.length === 0) missing.push(t('dashboard.missingBio'));
        if (!u.field) missing.push(t('dashboard.missingField'));
        if (!u.university) missing.push(t('dashboard.missingUniversity'));
        if (!u.skills || u.skills.length < 1) missing.push(t('dashboard.missingSkills'));
        return missing;
    };

    const pct = profileCompletion(currentUser);
    const missingItems = getMissingItems(currentUser);

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6">


            {pct < 100 && (
                <div className="glass-card rounded-3xl p-5 mb-8 anim-up flex flex-col gap-4 border border-brand-500/20 bg-brand-500/[0.02]">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
                        <div className="flex items-center gap-4 w-full flex-1">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0">
                                <Icon icon="mdi:progress-check" className="text-brand-400 text-2xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] sm:text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-wider truncate mr-2">{t('dashboard.profileCompletion')}</span>
                                    <span className="text-xs font-bold text-brand-400 shrink-0">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${pct >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : pct >= 50 ? 'bg-gradient-to-r from-brand-400 to-purple-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} 
                                        style={{ width: `${pct}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('profile')} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl shrink-0">
                            {pct >= 80 ? t('dashboard.finish') : t('dashboard.complete')}
                        </button>
                    </div>
                    {missingItems.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1 sm:mt-0 pl-0 sm:pl-[68px]">
                            {missingItems.map((item, i) => (
                                <span key={i} className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                    <Icon icon="mdi:alert-circle-outline" className="text-xs shrink-0" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex border-b border-black/10 dark:border-white/10 mb-6 gap-6">
                <button 
                    onClick={() => setFeedType('all')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${feedType === 'all' ? 'border-brand-400 text-brand-400' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                >
                    {t('dashboard.all')}
                </button>
                <button 
                    onClick={() => setFeedType('following')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${feedType === 'following' ? 'border-brand-400 text-brand-400' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                >
                    {t('dashboard.following')}
                </button>
            </div>

            <div className="space-y-8">
                {posts.map((post, index) => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        index={index} 
                        onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} 
                        onUpdate={(updatedPost) => setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))} 
                        onNavigate={onNavigate}
                    />
                ))}
            </div>

            <div className="text-center py-12">
                <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-bold uppercase tracking-[0.2em]">{t('dashboard.allSeen')}</span>
            </div>
        </div>
    );
}
