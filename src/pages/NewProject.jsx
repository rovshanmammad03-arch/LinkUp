import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, uid, GRADIENTS } from '../services/db';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

export default function NewProject({ onNavigate, params }) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [skills, setSkills] = useState('');
    const [projectType, setProjectType] = useState('Startap');
    const [stage, setStage] = useState('Yalnız İdeya');
    const [documentUrl, setDocumentUrl] = useState('');
    const [documentFile, setDocumentFile] = useState(null);
    const [selectedGrad, setSelectedGrad] = useState(GRADIENTS[0]);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isStageOpen, setIsStageOpen] = useState(false);

    const isEditing = !!params?.projectId;

    useEffect(() => {
        if (isEditing) {
            const projects = DB.get('projects');
            const projectToEdit = projects.find(p => p.id === params.projectId);
            if (projectToEdit && projectToEdit.authorId === currentUser.id) {
                setTitle(projectToEdit.title || '');
                setDesc(projectToEdit.desc || '');
                setSkills(projectToEdit.skills ? projectToEdit.skills.join(', ') : '');
                setProjectType(projectToEdit.projectType || 'Startap');
                setStage(projectToEdit.stage || 'Yalnız İdeya');
                setDocumentUrl(projectToEdit.documentUrl || '');
                setDocumentFile(projectToEdit.documentFile || null);
                setSelectedGrad(projectToEdit.grad || GRADIENTS[0]);
            } else {
                onNavigate('discover');
            }
        }
    }, [isEditing, params, currentUser, onNavigate]);

    const handleCreate = () => {
        if (!title.trim() || !desc.trim()) return;

        const projects = DB.get('projects');
        
        if (isEditing) {
            const pIdx = projects.findIndex(p => p.id === params.projectId);
            if (pIdx !== -1) {
                projects[pIdx] = {
                    ...projects[pIdx],
                    title: title.trim(),
                    desc: desc.trim(),
                    skills: skills.split(',').map(s => s.trim()).filter(s => s),
                    projectType: projectType,
                    stage: stage,
                    documentUrl: documentUrl.trim(),
                    documentFile: documentFile,
                    grad: selectedGrad
                };
                DB.set('projects', projects);
            }
        } else {
            const newProject = {
                id: 'p_' + uid(),
                title: title.trim(),
                desc: desc.trim(),
                authorId: currentUser.id,
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
                projectType: projectType,
                stage: stage,
                documentUrl: documentUrl.trim(),
                documentFile: documentFile,
                status: 'active',
                createdAt: Date.now(),
                applicants: [],
                grad: selectedGrad
            };
            DB.set('projects', [newProject, ...projects]);
        }
        
        onNavigate('discover');
    };

    return (
        <div className="max-w-3xl mx-auto px-6 anim-up">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => onNavigate('discover')}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                    <Icon icon="mdi:arrow-left" className="text-xl" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">{isEditing ? t('discover.project.edit', 'Layihəni redaktə et') : t('newProject.title')}</h1>
                    <p className="text-neutral-500 text-sm mt-1">{isEditing ? t('discover.project.editSubtitle', 'Layihənizin detallarını yeniləyin') : t('newProject.subtitle')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[32px] p-8 shadow-sm dark:shadow-2xl flex flex-col">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">{t('newProject.nameLabel')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('newProject.namePlaceholder')}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-2xl px-5 py-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-black/8 dark:focus:bg-white/10 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">{t('newProject.descLabel')}</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder={t('newProject.descPlaceholder')}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-2xl px-5 py-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-black/8 dark:focus:bg-white/10 transition-all h-32 resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">{t('newProject.urlLabel', 'Sənəd (Link və ya Fayl)')}</label>
                        <div className="flex flex-col gap-3">
                            <div className="relative group">
                                <Icon icon="mdi:link-variant" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="url"
                                    value={documentUrl}
                                    onChange={(e) => setDocumentUrl(e.target.value)}
                                    placeholder="https://... (Ətraflı məlumat linki - Könüllü)"
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-black/8 dark:focus:bg-white/10 transition-all"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></div>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">və ya</span>
                                <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></div>
                            </div>

                            <label className="flex items-center justify-center gap-2 w-full bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 border-dashed rounded-2xl px-5 py-4 text-sm font-bold cursor-pointer transition-all">
                                <Icon icon="mdi:upload" className="text-lg" />
                                <span className="truncate max-w-[200px] md:max-w-xs">{documentFile ? documentFile.name : t('newProject.uploadFile', 'Kompüterdən Fayl Yüklə (Max 2MB)')}</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (file.size > 2 * 1024 * 1024) {
                                            alert("Fayl həcmi 2MB-dan böyük ola bilməz. Zəhmət olmasa daha kiçik fayl seçin və ya xarici link istifadə edin.");
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            setDocumentFile({
                                                name: file.name,
                                                type: file.type,
                                                data: ev.target.result
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                />
                            </label>
                            {documentFile && (
                                <button 
                                    onClick={() => setDocumentFile(null)}
                                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 text-right uppercase tracking-wider mt-1 self-end"
                                >
                                    Faylı Sil
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">{t('newProject.typeLabel', 'Layihə Növü')}</label>
                            <div className="relative line-clamp-none z-20">
                                <button
                                    type="button"
                                    onClick={() => { setIsTypeOpen(!isTypeOpen); setIsStageOpen(false); }}
                                    className="w-full text-left bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/8 dark:border-white/5 rounded-2xl px-5 py-4 pr-12 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer flex items-center justify-between"
                                >
                                    <span className="truncate">{projectType}</span>
                                    <Icon icon="mdi:chevron-down" className={`absolute right-4 text-lg text-neutral-400 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isTypeOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsTypeOpen(false)} />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl py-2 z-20 anim-up overflow-hidden">
                                            {['Startap', 'Açıq Mənbə', 'Şəxsi Portfel', 'Tədqiqat / Təhsil', 'Biznes'].map((opt) => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => { setProjectType(opt); setIsTypeOpen(false); }}
                                                    className={`w-full text-left px-5 py-3 text-sm transition-colors ${projectType === opt ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">{t('newProject.stageLabel', 'Mərhələ')}</label>
                            <div className="relative line-clamp-none z-20">
                                <button
                                    type="button"
                                    onClick={() => { setIsStageOpen(!isStageOpen); setIsTypeOpen(false); }}
                                    className="w-full text-left bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/8 dark:border-white/5 rounded-2xl px-5 py-4 pr-12 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer flex items-center justify-between"
                                >
                                    <span className="truncate">{stage}</span>
                                    <Icon icon="mdi:chevron-down" className={`absolute right-4 text-lg text-neutral-400 transition-transform ${isStageOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isStageOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsStageOpen(false)} />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl py-2 z-20 anim-up overflow-hidden">
                                            {['Yalnız İdeya', 'Planlaşdırma / Dizayn', 'Aktiv Hazırlıq', 'MVP Hazırdır', 'Test / Bazar'].map((opt) => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => { setStage(opt); setIsStageOpen(false); }}
                                                    className={`w-full text-left px-5 py-3 text-sm transition-colors ${stage === opt ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">{t('newProject.skillsLabel')}</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder={t('newProject.skillsPlaceholder')}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-2xl px-5 py-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-black/8 dark:focus:bg-white/10 transition-all"
                        />
                        <p className="text-[10px] text-neutral-400 mt-1.5 ml-1">{t('newProject.skillsHint')}</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">{t('newProject.colorLabel')}</label>
                        <div className="flex flex-wrap gap-3">
                            {GRADIENTS.map((g, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedGrad(g)}
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} transition-all ${selectedGrad === g ? 'ring-4 ring-brand-500/30 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0a] scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-black/8 dark:border-white/5">
                    <button
                        onClick={() => onNavigate('discover')}
                        className="px-8 py-3.5 rounded-2xl text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                        {t('newProject.cancel')}
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-10 py-3.5 rounded-2xl text-[11px] font-bold text-white bg-brand-500 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!title.trim() || !desc.trim()}
                    >
                        {isEditing ? t('newProject.save', 'Yadda saxla') : t('newProject.create')}
                    </button>
                </div>
            </div>
        </div>
    );
}
