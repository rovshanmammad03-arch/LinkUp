import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '@iconify/react';
import { getUser, timeAgo, initials, DB, addNotification } from '../../services/db';
import CommentsModal from './CommentsModal';
import SharePostModal from './SharePostModal';
import { useScrollLock } from '../../hooks/useScrollLock';
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

const POST_COLORS = [
    'from-brand-600 via-purple-600 to-pink-500',
    'from-cyan-600 via-blue-600 to-brand-600',
    'from-amber-500 via-orange-500 to-rose-500',
    'from-green-600 via-teal-600 to-cyan-500',
    'from-rose-500 via-pink-500 to-purple-500',
    'from-indigo-600 via-brand-600 to-cyan-500'
];

const POST_ICONS = {
    design: 'mdi:palette-outline',
    code: 'mdi:code-braces',
    project: 'mdi:rocket-launch-outline',
    other: 'mdi:star-four-points-outline'
};

const POST_LABELS = {
    design: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    code: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    project: 'bg-green-500/10 text-green-400 border-green-500/20',
    other: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
};

export default function PostCard({ post, index, onDelete, onUpdate, onNavigate }) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const author = getUser(post.authorId);
    if (!author) return null;

    const [liked, setLiked] = useState(post.likes?.includes(currentUser?.id));
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!showDropdown) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [editCaption, setEditCaption] = useState(post.caption || '');

    useScrollLock(showComments || showDeleteModal || showEditModal || showShareModal);

    const handleEditPost = () => {
        const posts = DB.get('posts');
        const pIndex = posts.findIndex(p => p.id === post.id);
        if (pIndex > -1) {
            posts[pIndex].caption = editCaption;
            DB.set('posts', posts);
            if (onUpdate) onUpdate(posts[pIndex]);
        }
        setShowEditModal(false);
    };

    const handleDeletePost = () => {
        const posts = DB.get('posts');
        const updatedPosts = posts.filter(p => p.id !== post.id);
        DB.set('posts', updatedPosts);
        if (onDelete) onDelete(post.id);
        setShowDropdown(false);
        setShowDeleteModal(false);
    };

    const toggleLike = () => {
        if (!currentUser) return;
        const posts = DB.get('posts');
        const p = posts.find(x => x.id === post.id);
        if (!p) return;
        
        if (!p.likes) p.likes = [];
        const idx = p.likes.indexOf(currentUser.id);
        if (idx === -1) {
            p.likes.push(currentUser.id);
            setLiked(true);
            setLikeCount(prev => prev + 1);
            addNotification({
                toUserId: post.authorId,
                fromUserId: currentUser.id,
                type: 'like',
                text: 'paylaşımını bəyəndi',
                route: 'dashboard',
            });
        } else {
            p.likes.splice(idx, 1);
            setLiked(false);
            setLikeCount(prev => prev - 1);
        }
        DB.set('posts', posts);
    };

    const handleCommentAdded = () => {
        const posts = DB.get('posts');
        const p = posts.find(x => x.id === post.id);
        if (p) setCommentCount(p.comments?.length || 0);
    };

    const colorIdx = Math.abs(post.authorId.charCodeAt(post.authorId.length - 1)) % POST_COLORS.length;
    const placeholderGrad = POST_COLORS[colorIdx];
    const postIcon = POST_ICONS[post.type] || POST_ICONS.other;
    const postLabelClass = POST_LABELS[post.type] || POST_LABELS.other;

    return (
        <>
            <div className="glass-card rounded-3xl overflow-hidden anim-up" style={{ animationDelay: `${index * 0.08}s` }}>
                {/* Header */}
                <div className="p-4 pb-3 flex items-center justify-between">
                    <button 
                        onClick={() => onNavigate && onNavigate('profile', { userId: post.authorId })} 
                        className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0 p-0 text-left"
                    >
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${author.grad} flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0`}>
                            {author.avatar ? <img src={author.avatar} className="w-full h-full object-cover" /> : initials(author.name)}
                        </div>
                        <div className="min-w-0 flex flex-col gap-0.5 items-start">
                            <div className="text-sm font-medium text-neutral-900 dark:text-white truncate leading-tight">{author.name}</div>
                            <div className="text-[10px] text-neutral-500 font-light leading-tight">{translateField(author.field, t)} · {timeAgo(post.createdAt, t)}</div>
                        </div>
                    </button>
                    {post.authorId === currentUser?.id && (
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setShowDropdown(!showDropdown)} className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
                                <Icon icon="mdi:dots-horizontal" className="text-lg" />
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                                    <button 
                                        onClick={() => {
                                            setShowDropdown(false);
                                            setEditCaption(post.caption || '');
                                            setShowEditModal(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <Icon icon="mdi:pencil-outline" className="text-base" /> {t('post.edit')}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowDropdown(false);
                                            setShowDeleteModal(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Icon icon="mdi:delete-outline" className="text-base" /> {t('post.delete')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-4 pb-3">
                    {post.image ? (
                        <div className="relative rounded-2xl overflow-hidden group">
                            <img src={post.image} className="w-full object-cover max-h-[450px]" alt="Post" />
                            <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${postLabelClass}`}>
                                {post.type}
                            </div>
                        </div>
                    ) : (
                        <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${placeholderGrad} flex flex-col items-center justify-center gap-3 relative overflow-hidden group`}>
                            <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0"></div>
                            <Icon icon={postIcon} className="text-4xl text-white/40 relative z-10" />
                            <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest relative z-10">{post.type || t('post.noCaption')}</span>
                            <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${postLabelClass} relative z-10`}>
                                {post.type}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-3 flex items-center gap-5">
                    <button 
                        onClick={toggleLike}
                        className={`flex items-center gap-2 transition-all ${liked ? 'text-rose-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-rose-400'}`}
                    >
                        <Icon icon={liked ? "mdi:heart" : "mdi:heart-outline"} className={`text-xl ${liked ? 'scale-110' : ''}`} />
                        <span className="text-xs font-semibold">{likeCount}</span>
                    </button>
                    <button 
                        onClick={() => setShowComments(true)}
                        className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 hover:text-brand-400 transition-all"
                    >
                        <Icon icon="mdi:comment-outline" className="text-xl" />
                        <span className="text-xs font-semibold">{commentCount}</span>
                    </button>
                    <button 
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 hover:text-green-400 transition-all"
                    >
                        <Icon icon="mdi:share-outline" className="text-xl" />
                    </button>
                </div>

                {/* Caption */}
                <div className="px-5 pb-5">
                    <p className="text-[13px] text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
                        <button 
                            onClick={() => onNavigate && onNavigate('profile', { userId: post.authorId })} 
                            className="font-bold text-neutral-900 dark:text-white mr-1 hover:underline bg-transparent border-0 p-0 cursor-pointer"
                        >
                            {author.name}
                        </button>
                        {post.caption}
                    </p>
                    {commentCount > 0 && (
                        <button 
                            onClick={() => setShowComments(true)}
                            className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mt-3"
                        >
                            {t('post.viewComments', { count: commentCount })}
                        </button>
                    )}
                </div>
            </div>

            {showComments && (
                <CommentsModal
                    postId={post.id}
                    onClose={() => setShowComments(false)}
                    onCommentAdded={handleCommentAdded}
                />
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full relative z-10 anim-up flex flex-col items-center text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <Icon icon="mdi:alert-circle-outline" className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{t('post.deleteTitle')}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 pb-6 border-b border-black/5 dark:border-white/5 w-full">
                            {t('post.deleteConfirm')}
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 dark:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                {t('post.cancel')}
                            </button>
                            <button 
                                onClick={handleDeletePost}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                            >
                                {t('post.confirmDelete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
                    <div className="bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl p-5 max-w-lg w-full relative z-10 anim-up flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/10 dark:border-white/10">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('post.editTitle')}</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                <Icon icon="mdi:close" className="text-xl" />
                            </button>
                        </div>
                        <textarea 
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            placeholder={t('post.editPlaceholder')}
                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500 transition-colors mb-4 resize-none h-32"
                        ></textarea>
                        <div className="flex justify-end gap-3 w-full">
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="px-5 py-2 rounded-xl text-sm font-semibold text-neutral-700 dark:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                {t('post.cancel')}
                            </button>
                            <button 
                                onClick={handleEditPost}
                                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!editCaption.trim() || editCaption === post.caption}
                            >
                                {t('post.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showShareModal && (
                <SharePostModal
                    post={post}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </>
    );
}
