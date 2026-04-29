import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DB, uid, initials, parseTechnologies } from '../../services/db';
import { postsService } from '../../services/postsService';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import CustomSelect from '../common/CustomSelect';

const POST_TYPES = [
    { value: 'code', icon: 'mdi:code-braces', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { value: 'design', icon: 'mdi:palette-outline', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
    { value: 'project', icon: 'mdi:rocket-launch-outline', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
    { value: 'learned', icon: 'mdi:lightbulb-outline', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { value: 'other', icon: 'mdi:star-four-points-outline', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
];

const CODE_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Dart', 'Java', 'C++', 'HTML', 'CSS', 'SQL', 'Bash'];

function CodeTypeForm({ metadata, onChange }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.codeLanguageLabel')}</label>
                <div className="bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <CustomSelect
                        value={metadata.language ?? 'JavaScript'}
                        onChange={val => onChange({ ...metadata, language: val })}
                        options={CODE_LANGUAGES}
                        className="w-full bg-transparent text-sm text-neutral-900 dark:text-white focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <textarea
                        value={metadata.code ?? ''}
                        onChange={e => onChange({ ...metadata, code: e.target.value })}
                        placeholder={t('newPost.codePlaceholder')}
                        className="w-full bg-transparent font-mono text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none resize-none min-h-[200px] bg-black/5 dark:bg-black/50"
                    />
                </div>
            </div>
        </div>
    );
}

const DESIGN_TOOLS = ['Figma', 'Adobe XD', 'Sketch', 'Illustrator', 'Photoshop', 'Canva', 'Framer', 'Webflow'];

function DesignTypeForm({ metadata, onChange }) {
    const { t } = useTranslation();
    const tools = metadata.tools ?? [];

    const toggleTool = (tool) => {
        const next = tools.includes(tool)
            ? tools.filter(t => t !== tool)
            : [...tools, tool];
        onChange({ ...metadata, tools: next });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.designLinkLabel')}</label>
                <div className="flex items-center gap-3 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <Icon icon="mdi:link-variant" className="text-neutral-400 dark:text-neutral-500 text-xl shrink-0" />
                    <input
                        type="url"
                        value={metadata.designLink ?? ''}
                        onChange={e => onChange({ ...metadata, designLink: e.target.value })}
                        placeholder={t('newPost.designLinkPlaceholder')}
                        className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.toolsLabel')}</label>
                <div className="flex flex-wrap gap-2">
                    {DESIGN_TOOLS.map(tool => (
                        <button
                            key={tool}
                            type="button"
                            onClick={() => toggleTool(tool)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                                tools.includes(tool)
                                    ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                                    : 'bg-black/3 dark:bg-white/3 border-black/8 dark:border-white/8 text-neutral-500 dark:text-neutral-400 hover:border-black/15 dark:hover:border-white/15 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                        >
                            {tool}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProjectTypeForm({ metadata, onChange }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.projectNameLabel')}</label>
                <div className="flex items-center gap-3 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <input
                        type="text"
                        value={metadata.projectName ?? ''}
                        onChange={e => onChange({ ...metadata, projectName: e.target.value })}
                        placeholder={t('newPost.projectNamePlaceholder')}
                        className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.projectDescLabel')}</label>
                <div className="bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <textarea
                        value={metadata.description ?? ''}
                        onChange={e => onChange({ ...metadata, description: e.target.value })}
                        className="w-full bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none resize-none min-h-[80px]"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.technologiesLabel')}</label>
                <div className="flex items-center gap-3 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <input
                        type="text"
                        value={metadata.technologiesInput ?? ''}
                        onChange={e => onChange({ ...metadata, technologiesInput: e.target.value, technologies: parseTechnologies(e.target.value) })}
                        placeholder={t('newPost.technologiesPlaceholder')}
                        className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.githubLabel')}</label>
                <div className="flex items-center gap-3 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <Icon icon="mdi:github" className="text-neutral-400 dark:text-neutral-500 text-xl shrink-0" />
                    <input
                        type="url"
                        value={metadata.githubUrl ?? ''}
                        onChange={e => onChange({ ...metadata, githubUrl: e.target.value })}
                        className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.demoLabel')}</label>
                <div className="flex items-center gap-3 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <Icon icon="mdi:link-variant" className="text-neutral-400 dark:text-neutral-500 text-xl shrink-0" />
                    <input
                        type="url"
                        value={metadata.demoUrl ?? ''}
                        onChange={e => onChange({ ...metadata, demoUrl: e.target.value })}
                        className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEVEL_STYLES = {
    beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function LearnedTypeForm({ metadata, onChange }) {
    const { t } = useTranslation();
    const level = metadata.level ?? 'beginner';

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.topicLabel')}</label>
                <div className="flex items-center gap-3 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <input
                        type="text"
                        value={metadata.topic ?? ''}
                        onChange={e => onChange({ ...metadata, topic: e.target.value })}
                        placeholder={t('newPost.topicPlaceholder')}
                        className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.levelLabel')}</label>
                <div className="flex gap-2">
                    {LEVELS.map(lvl => (
                        <button
                            key={lvl}
                            type="button"
                            onClick={() => onChange({ ...metadata, level: lvl })}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                                level === lvl
                                    ? LEVEL_STYLES[lvl]
                                    : 'bg-black/3 dark:bg-white/3 border-black/8 dark:border-white/8 text-neutral-500 dark:text-neutral-400 hover:border-black/15 dark:hover:border-white/15 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                        >
                            {t(`post.levels.${lvl}`)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.notesLabel')}</label>
                <div className="bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <textarea
                        value={metadata.notes ?? ''}
                        onChange={e => onChange({ ...metadata, notes: e.target.value })}
                        placeholder={t('newPost.notesPlaceholder')}
                        className="w-full bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none resize-none min-h-[80px]"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.sourceLinkLabel')}</label>
                <div className="flex items-center gap-3 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                    <Icon icon="mdi:link-variant" className="text-neutral-400 dark:text-neutral-500 text-xl shrink-0" />
                    <input
                        type="url"
                        value={metadata.sourceUrl ?? ''}
                        onChange={e => onChange({ ...metadata, sourceUrl: e.target.value })}
                        className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}

export default function NewPostModal({ onClose, onPostCreated }) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [caption, setCaption] = useState('');
    const [postType, setPostType] = useState('other');
    const [image, setImage] = useState('');
    const [metadata, setMetadata] = useState({});
    const [posting, setPosting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setImage(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handlePost = async () => {
        if (!caption.trim() || posting) return;
        setPosting(true);
        try {
            await postsService.create({
                authorId: currentUser.id,
                caption,
                type: postType,
                image,
                metadata,
            });
            if (onPostCreated) onPostCreated();
            onClose();
        } catch (err) {
            console.error('Post create error:', err);
        } finally {
            setPosting(false);
        }
    };

    const isPublishDisabled = () => {
        if (!caption.trim()) return true;
        if (postType === 'code') return !metadata.code?.trim();
        if (postType === 'design') return !image && !metadata.designLink?.trim() && !metadata.tools?.length;
        if (postType === 'project') return !metadata.projectName?.trim();
        if (postType === 'learned') return !metadata.topic?.trim();
        return false;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#080808] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 dark:border-white/5">
                <button onClick={onClose} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <Icon icon="mdi:arrow-left" className="text-xl" />
                    <span className="text-sm font-medium">{t('newPost.back')}</span>
                </button>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">{t('newPost.title')}</span>
                <Button
                    onClick={handlePost}
                    disabled={isPublishDisabled() || posting}
                    variant="primary"
                    size="sm"
                >
                    {posting ? 'Göndərilir...' : t('newPost.publish')}
                </Button>
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
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{currentUser.name}</span>
                            <textarea
                                autoFocus
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                placeholder={t('newPost.placeholder')}
                                className="w-full bg-transparent text-[15px] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none resize-none min-h-[140px] leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.imageLabel')}</label>
                        {!image ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-black/10 dark:border-white/10 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-black/3 dark:bg-white/3 hover:bg-brand-500/5"
                            >
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#111] shadow-md flex items-center justify-center">
                                    <Icon icon="mdi:cloud-upload-outline" className="text-2xl text-brand-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">Cihazdan şəkil seç</p>
                                    <p className="text-xs text-neutral-500 mt-1">və ya bura klikləyin</p>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                        ) : (
                            <div className="rounded-2xl overflow-hidden border border-black/8 dark:border-white/8 relative group bg-black/5 dark:bg-white/5 flex justify-center p-2 min-h-[160px]">
                                <img src={image} className="max-w-full object-contain max-h-[300px] rounded-xl" onError={e => e.target.style.display='none'} />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm">
                                        <Icon icon="mdi:swap-horizontal" className="text-lg" /> Dəyiş
                                    </Button>
                                    <Button onClick={() => setImage('')} variant="danger" size="sm">
                                        <Icon icon="mdi:delete-outline" className="text-lg" /> Sil
                                    </Button>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-px bg-black/5 dark:bg-white/5 flex-1"></div>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">URL İLƏ ƏLAVƏ ET</span>
                            <div className="h-px bg-black/5 dark:bg-white/5 flex-1"></div>
                        </div>
                        <div className="flex items-center gap-3 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-2xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors mt-2">
                            <Icon icon="mdi:link-variant" className="text-neutral-400 dark:text-neutral-500 text-xl shrink-0" />
                            <input
                                type="text"
                                value={image.startsWith('data:') ? '' : image}
                                onChange={e => setImage(e.target.value)}
                                placeholder={t('newPost.imageUrlPlaceholder')}
                                className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('newPost.categoryLabel')}</label>
                        <div className="grid grid-cols-4 gap-3">
                            {POST_TYPES.map(pt => (
                                <button
                                    key={pt.value}
                                    onClick={() => { setPostType(pt.value); setMetadata({}); }}
                                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all active:scale-95 ${postType === pt.value ? pt.color + ' border-current' : 'bg-black/3 dark:bg-white/3 border-black/8 dark:border-white/8 text-neutral-400 dark:text-neutral-500 hover:border-black/15 dark:hover:border-white/15 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                                >
                                    <Icon icon={pt.icon} className="text-2xl" />
                                    <span className="text-[11px] font-bold uppercase tracking-wide">{t(`newPost.types.${pt.value}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {postType === 'code' && (
                        <CodeTypeForm metadata={metadata} onChange={setMetadata} />
                    )}

                    {postType === 'design' && (
                        <DesignTypeForm metadata={metadata} onChange={setMetadata} />
                    )}

                    {postType === 'project' && (
                        <ProjectTypeForm metadata={metadata} onChange={setMetadata} />
                    )}

                    {postType === 'learned' && (
                        <LearnedTypeForm metadata={metadata} onChange={setMetadata} />
                    )}

                </div>
            </div>
        </div>
    );
}
