import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DB, uid, initials } from '../../services/db';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const POST_TYPES = [
    { value: 'code', icon: 'mdi:code-braces', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { value: 'design', icon: 'mdi:palette-outline', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { value: 'project', icon: 'mdi:rocket-launch-outline', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    { value: 'other', icon: 'mdi:star-four-points-outline', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
];

export default function NewPostModal({ onClose, onPostCreated }) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [caption, setCaption] = useState('');
    const [postType, setPostType] = useState('other');
    const [image, setImage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setImage(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handlePost = () => {
        if (!caption.trim()) return;
        const posts = DB.get('posts');
        const newPost = {
            id: 'post_' + uid(),
            authorId: currentUser.id,
            caption,
            type: postType,
            image,
            likes: [],
            comments: [],
            createdAt: Date.now()
        };
        DB.set('posts', [newPost, ...posts]);
        if (onPostCreated) onPostCreated();
        onClose();
    };

    const selectedType = POST_TYPES.find(tp => tp.value === postType);

    return (
        <div className="fixed inset-0 z-[100] bg-[#080808] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <button onClick={onClose} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                    <Icon icon="mdi:arrow-left" className="text-xl" />
                    <span className="text-sm font-medium">{t('newPost.back')}</span>
                </button>
                <span className="text-sm font-semibold text-white">{t('newPost.title')}</span>
                <button
                    onClick={handlePost}
                    disabled={!caption.trim()}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    {t('newPost.publish')}
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">

                    {/* Author + textarea */}
                    <div className="flex gap-4">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${currentUser.grad} flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden`}>
                            {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : initials(currentUser.name)}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <span className="text-sm font-semibold text-white">{currentUser.name}</span>
                            <textarea
                                autoFocus
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                placeholder={t('newPost.placeholder')}
                                className="w-full bg-transparent text-[15px] text-white placeholder-neutral-600 focus:outline-none resize-none min-h-[140px] leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.imageLabel')}</label>
                        <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-2xl px-4 py-3 focus-within:border-white/20 transition-colors">
                            <Icon icon="mdi:image-outline" className="text-neutral-500 text-xl shrink-0" />
                            <input
                                type="text"
                                value={image.startsWith('data:') ? '' : image}
                                onChange={e => setImage(e.target.value)}
                                placeholder={t('newPost.imageUrlPlaceholder')}
                                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all text-xs font-semibold"
                            >
                                <Icon icon="mdi:upload-outline" className="text-base" /> {t('newPost.upload')}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        {image && (
                            <div className="mt-2 rounded-2xl overflow-hidden border border-white/8 max-h-48 relative group">
                                <img src={image} className="w-full object-cover max-h-48" onError={e => e.target.style.display='none'} />
                                <button
                                    onClick={() => setImage('')}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icon icon="mdi:close" className="text-sm" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.categoryLabel')}</label>
                        <div className="grid grid-cols-4 gap-3">
                            {POST_TYPES.map(pt => (
                                <button
                                    key={pt.value}
                                    onClick={() => setPostType(pt.value)}
                                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all active:scale-95 ${postType === pt.value ? pt.color + ' border-current' : 'bg-white/3 border-white/8 text-neutral-500 hover:border-white/15 hover:text-neutral-300'}`}
                                >
                                    <Icon icon={pt.icon} className="text-2xl" />
                                    <span className="text-[11px] font-bold uppercase tracking-wide">{t(`newPost.types.${pt.value}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
