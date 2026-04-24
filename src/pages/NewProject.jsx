import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, uid, GRADIENTS } from '../services/db';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';

export default function NewProject({ onNavigate, params }) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
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

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const steps = [
        { id: 1, name: 'Məlumat', icon: 'mdi:information-outline' },
        { id: 2, name: 'Detallar', icon: 'mdi:format-list-bulleted' },
        { id: 3, name: 'Media', icon: 'mdi:cloud-upload-outline' },
    ];

    return (
        <div className="max-w-3xl mx-auto px-6 anim-up pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate('discover')}
                    className="!w-10 !h-10 !p-0 !rounded-2xl"
                >
                    <Icon icon="mdi:arrow-left" className="text-xl" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                        {isEditing ? t('discover.project.edit', 'Layihəni redaktə et') : t('newProject.title')}
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        {isEditing ? t('discover.project.editSubtitle', 'Layihənizin detallarını yeniləyin') : t('newProject.subtitle')}
                    </p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-10 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-3xl p-4 shadow-sm">
                {steps.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <div className="flex items-center gap-3 px-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${step >= s.id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-neutral-100 dark:bg-white/5 text-neutral-400'}`}>
                                <Icon icon={step > s.id ? 'mdi:check' : s.icon} className="text-xl" />
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-brand-500' : 'text-neutral-400'}`}>Addım {s.id}</p>
                                <p className={`text-xs font-semibold ${step >= s.id ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>{s.name}</p>
                            </div>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-px bg-neutral-200 dark:bg-white/10 mx-2" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[40px] p-8 md:p-10 shadow-sm dark:shadow-2xl flex flex-col min-h-[400px]">
                
                {step === 1 && (
                    <div className="space-y-8 anim-up">
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">{t('newProject.nameLabel')}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('newProject.namePlaceholder')}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-3xl px-6 py-5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-white dark:focus:bg-black transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">{t('newProject.descLabel')}</label>
                            <textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder={t('newProject.descPlaceholder')}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-3xl px-6 py-5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-white dark:focus:bg-black transition-all h-40 resize-none leading-relaxed"
                            ></textarea>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 block">{t('newProject.colorLabel')}</label>
                            <div className="flex flex-wrap gap-4">
                                {GRADIENTS.map((g, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedGrad(g)}
                                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g} transition-all duration-300 ${selectedGrad === g ? 'ring-4 ring-brand-500/30 ring-offset-4 ring-offset-white dark:ring-offset-[#0a0a0a] scale-110' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 anim-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">{t('newProject.typeLabel', 'Layihə Növü')}</label>
                                <div className="relative z-30">
                                    <button
                                        type="button"
                                        onClick={() => { setIsTypeOpen(!isTypeOpen); setIsStageOpen(false); }}
                                        className="w-full text-left bg-black/5 dark:bg-white/5 hover:bg-white dark:hover:bg-black border border-black/8 dark:border-white/5 rounded-3xl px-6 py-5 pr-12 text-sm text-neutral-900 dark:text-white transition-all flex items-center justify-between shadow-sm"
                                    >
                                        <span className="truncate font-medium">{projectType}</span>
                                        <Icon icon="mdi:chevron-down" className={`text-xl text-neutral-400 transition-transform duration-300 ${isTypeOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isTypeOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsTypeOpen(false)} />
                                            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-[28px] shadow-2xl py-3 z-30 anim-up overflow-hidden">
                                                {['Startap', 'Açıq Mənbə', 'Şəxsi Portfel', 'Tədqiqat / Təhsil', 'Biznes'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => { setProjectType(opt); setIsTypeOpen(false); }}
                                                        className={`w-full text-left px-6 py-3.5 text-sm transition-colors ${projectType === opt ? 'bg-brand-500/10 text-brand-500 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'}`}
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
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">{t('newProject.stageLabel', 'Mərhələ')}</label>
                                <div className="relative z-30">
                                    <button
                                        type="button"
                                        onClick={() => { setIsStageOpen(!isStageOpen); setIsTypeOpen(false); }}
                                        className="w-full text-left bg-black/5 dark:bg-white/5 hover:bg-white dark:hover:bg-black border border-black/8 dark:border-white/5 rounded-3xl px-6 py-5 pr-12 text-sm text-neutral-900 dark:text-white transition-all flex items-center justify-between shadow-sm"
                                    >
                                        <span className="truncate font-medium">{stage}</span>
                                        <Icon icon="mdi:chevron-down" className={`text-xl text-neutral-400 transition-transform duration-300 ${isStageOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isStageOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsStageOpen(false)} />
                                            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0a0a0a] border border-black/8 dark:border-white/10 rounded-[28px] shadow-2xl py-3 z-30 anim-up overflow-hidden">
                                                {['Yalnız İdeya', 'Planlaşdırma / Dizayn', 'Aktiv Hazırlıq', 'MVP Hazırdır', 'Test / Bazar'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => { setStage(opt); setIsStageOpen(false); }}
                                                        className={`w-full text-left px-6 py-3.5 text-sm transition-colors ${stage === opt ? 'bg-brand-500/10 text-brand-500 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'}`}
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
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">{t('newProject.skillsLabel')}</label>
                            <div className="relative group">
                                <Icon icon="mdi:tag-outline" className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 text-lg group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder={t('newProject.skillsPlaceholder')}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-3xl pl-14 pr-6 py-5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500/50 focus:bg-white dark:focus:bg-black transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-2.5 ml-1 font-medium tracking-wide">
                                <Icon icon="mdi:information-outline" className="inline mr-1" />
                                {t('newProject.skillsHint')}
                            </p>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 anim-up">
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 block">Sənəd və ya Fayl (Könüllü)</label>
                            <div className="flex flex-col gap-6">
                                <div className="relative group">
                                    <Icon icon="mdi:link-variant" className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 text-lg group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type="url"
                                        value={documentUrl}
                                        onChange={(e) => setDocumentUrl(e.target.value)}
                                        placeholder="https://... (Xarici link)"
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-3xl pl-14 pr-6 py-5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500/50 focus:bg-white dark:focus:bg-black transition-all"
                                    />
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-black/5 dark:bg-white/10"></div>
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">və ya</span>
                                    <div className="h-px flex-1 bg-black/5 dark:bg-white/10"></div>
                                </div>

                                <div 
                                    className={`relative border-2 border-dashed rounded-[32px] p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer bg-black/[0.02] dark:bg-white/[0.02] ${documentFile ? 'border-brand-500 bg-brand-500/5' : 'border-neutral-200 dark:border-white/10 hover:border-brand-500 hover:bg-brand-500/5'}`}
                                    onClick={() => document.getElementById('projectFile')?.click()}
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 ${documentFile ? 'bg-brand-500 text-white scale-110' : 'bg-white dark:bg-[#111] text-neutral-400'}`}>
                                        <Icon icon={documentFile ? 'mdi:file-check-outline' : 'mdi:cloud-upload-outline'} className="text-3xl" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                            {documentFile ? documentFile.name : 'Fayl seçin və ya bura sürükləyin'}
                                        </p>
                                        <p className="text-[11px] text-neutral-500 mt-1 font-medium">PDF, DOCX, ZIP (Max 2MB)</p>
                                    </div>
                                    <input 
                                        id="projectFile"
                                        type="file" 
                                        className="hidden" 
                                        accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            if (file.size > 2 * 1024 * 1024) {
                                                alert("Fayl həcmi 2MB-dan böyük ola bilməz.");
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
                                    {documentFile && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDocumentFile(null); }}
                                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                                        >
                                            <Icon icon="mdi:close" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-auto pt-10 border-t border-black/8 dark:border-white/5">
                    {step > 1 ? (
                        <Button variant="secondary" onClick={prevStep} size="md" className="!px-8">
                            <Icon icon="mdi:chevron-left" className="text-lg" />
                            Geri
                        </Button>
                    ) : (
                        <div />
                    )}

                    <div className="flex gap-3">
                        {step < 3 ? (
                            <Button 
                                variant="primary" 
                                onClick={nextStep} 
                                size="md" 
                                className="!px-10 shadow-brand-500/20"
                                disabled={step === 1 && (!title.trim() || !desc.trim())}
                            >
                                Növbəti
                                <Icon icon="mdi:chevron-right" className="text-lg" />
                            </Button>
                        ) : (
                            <Button 
                                variant="primary" 
                                onClick={handleCreate} 
                                size="md" 
                                className="!px-12 shadow-brand-500/30"
                                disabled={!title.trim() || !desc.trim()}
                            >
                                <Icon icon={isEditing ? "mdi:content-save-outline" : "mdi:rocket-launch-outline"} className="text-lg" />
                                {isEditing ? t('newProject.save', 'Yadda saxla') : t('newProject.create')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
