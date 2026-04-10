import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '@iconify/react';
import { DB, getUser, timeAgo, initials, addNotification } from '../../services/db';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useTranslation } from 'react-i18next';

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function CommentsModal({ postId, onClose, onCommentAdded }) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [post, setPost] = useState(null);
    const [text, setText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [expandedReplies, setExpandedReplies] = useState({});
    const listRef = useRef(null);

    useScrollLock(true);

    const loadPost = () => {
        const posts = DB.get('posts');
        const p = posts.find(x => x.id === postId);
        setPost(p);
    };

    useEffect(() => { loadPost(); }, [postId]);

    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [post]);

    const submitComment = (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || !currentUser) return;

        const posts = DB.get('posts');
        const p = posts.find(x => x.id === postId);
        if (!p) return;
        if (!p.comments) p.comments = [];

        p.comments.push({
            id: uid(),
            userId: currentUser.id,
            text: trimmed,
            ts: Date.now(),
            parentId: replyingTo?.commentId || null,
        });

        DB.set('posts', posts);
        setText('');
        setReplyingTo(null);
        loadPost();
        if (onCommentAdded) onCommentAdded();

        addNotification({
            toUserId: replyingTo ? getUser(replyingTo.commentId)?.id || p.authorId : p.authorId,
            fromUserId: currentUser.id,
            type: replyingTo ? 'reply' : 'comment',
            text: replyingTo ? 'şərhinə cavab verdi' : 'paylaşımına şərh yazdı',
            route: 'dashboard',
        });
    };

    const deleteComment = (commentId) => {
        const posts = DB.get('posts');
        const p = posts.find(x => x.id === postId);
        if (!p) return;
        p.comments = p.comments.filter(c => c.id !== commentId);
        DB.set('posts', posts);
        loadPost();
        if (onCommentAdded) onCommentAdded();
    };

    const toggleReplies = (commentId) => {
        setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    if (!post) return null;

    const roots = (post.comments || []).filter(c => !c.parentId);
    const replies = (post.comments || []).filter(c => c.parentId);

    return (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl" style={{ animation: 'fadeInUp 0.25s ease-out' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-black/8 dark:border-white/5 shrink-0">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Icon icon="mdi:comment-multiple-outline" className="text-brand-400 text-xl" />
                        {t('comments.title')}
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <Icon icon="mdi:close" className="text-xl" />
                    </button>
                </div>

                {/* Comments List */}
                <div ref={listRef} className="flex-1 overflow-y-auto p-5 space-y-6" style={{ scrollbarWidth: 'thin' }}>
                    {roots.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <Icon icon="mdi:comment-processing-outline" className="text-4xl text-neutral-300 dark:text-neutral-700 mb-3" />
                            <span className="text-neutral-400 dark:text-neutral-500 text-sm">{t('comments.empty')}</span>
                        </div>
                    ) : (
                        roots.map(c => {
                            const cu = getUser(c.userId);
                            const isMyComment = c.userId === currentUser?.id;
                            const childReplies = replies.filter(r => r.parentId === c.id);
                            const showReplies = expandedReplies[c.id];

                            return (
                                <div key={c.id} className="group">
                                    <div className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cu?.grad || 'from-neutral-500 to-neutral-600'} flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5`}>
                                            {cu?.avatar ? <img src={cu.avatar} className="w-full h-full object-cover rounded-full" /> : initials(cu?.name || '??')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-medium text-neutral-900 dark:text-white">{cu?.name || t('comments.unknown')}</span>
                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{timeAgo(c.ts, t)}</span>
                                            </div>
                                            <p className="text-[13px] text-neutral-600 dark:text-neutral-300 font-light leading-relaxed break-words">{c.text}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <button
                                                    onClick={() => setReplyingTo({ commentId: c.id, name: cu?.name || '' })}
                                                    className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-brand-400 font-medium transition-colors"
                                                >
                                                    {t('comments.reply')}
                                                </button>
                                                {isMyComment && (
                                                    <button onClick={() => deleteComment(c.id)} className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-red-400 transition-colors">
                                                        {t('comments.delete')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {childReplies.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => toggleReplies(c.id)}
                                                className="flex items-center gap-2 ml-11 mt-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 hover:text-brand-400 transition-colors"
                                            >
                                                <div className="w-5 h-px bg-black/10 dark:bg-white/10"></div>
                                                <span>{showReplies ? t('comments.hideReplies') : t('comments.showReplies', { count: childReplies.length })}</span>
                                                <Icon icon="mdi:chevron-down" className={`transition-transform ${showReplies ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showReplies && (
                                                <div className="ml-11 mt-3 space-y-4">
                                                    {childReplies.map(r => {
                                                        const rcu = getUser(r.userId);
                                                        const isMyReply = r.userId === currentUser?.id;
                                                        return (
                                                            <div key={r.id} className="flex gap-3">
                                                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${rcu?.grad || 'from-neutral-500 to-neutral-600'} flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5`}>
                                                                    {rcu?.avatar ? <img src={rcu.avatar} className="w-full h-full object-cover rounded-full" /> : initials(rcu?.name || '??')}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-[12px] font-medium text-neutral-900 dark:text-white">{rcu?.name || t('comments.unknown')}</span>
                                                                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500">{timeAgo(r.ts, t)}</span>
                                                                    </div>
                                                                    <p className="text-[12px] text-neutral-600 dark:text-neutral-300 font-light leading-relaxed break-words">{r.text}</p>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <button onClick={() => setReplyingTo({ commentId: c.id, name: rcu?.name || '' })} className="text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-brand-400 transition-colors">
                                                                            {t('comments.reply')}
                                                                        </button>
                                                                        {isMyReply && (
                                                                            <button onClick={() => deleteComment(r.id)} className="text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-red-400 transition-colors">
                                                                                {t('comments.delete')}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-black/8 dark:border-white/5 shrink-0">
                    {replyingTo && (
                        <div className="flex items-center justify-between px-3 py-2 bg-brand-500/5 rounded-t-xl border-b border-black/5 dark:border-white/5 mb-0 -mb-px">
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                <Icon icon="mdi:reply" className="text-brand-400" />
                                <span className="text-brand-400">@{replyingTo.name}</span> {t('comments.replyingTo')}
                            </span>
                            <button onClick={() => setReplyingTo(null)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                                <Icon icon="mdi:close" className="text-sm" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={submitComment} className="flex gap-2 pt-2">
                        <input
                            autoFocus
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder={t('comments.placeholder')}
                            className="input-field flex-1 text-sm py-2.5 px-3"
                        />
                        <button type="submit" className="btn-secondary btn-sm px-4 flex items-center justify-center">
                            <Icon icon="mdi:send" className="text-lg" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
