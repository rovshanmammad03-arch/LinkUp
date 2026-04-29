import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, uid, GRADIENTS } from '../services/db';
import { projectsService } from '../services/projectsService';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';
import CustomSelect from '../components/common/CustomSelect';
import { createRoleSlot, validateRoleSlotCategory } from '../services/roleSlotUtils';

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
    const [customType, setCustomType] = useState('');
    const [customStage, setCustomStage] = useState('');
    const [roleSlots, setRoleSlots] = useState([]);
    const [newSlotCategory, setNewSlotCategory] = useState('');
    const [newSlotCount, setNewSlotCount] = useState(1);
    const [slotError, setSlotError] = useState('');

    const isEditing = !!params?.projectId;

    useEffect(() => {
        if (isEditing) {
            projectsService.getAll().then(projects => {
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
                    setRoleSlots(projectToEdit.roleSlots || []);
                } else {
                    onNavigate('discover');
                }
            });
        }
    }, [isEditing, params, currentUser, onNavigate]);

    const handleAddSlot = () => {
        const validation = validateRoleSlotCategory(newSlotCategory);
        if (!validation.valid) {
            setSlotError(validation.error);
            return;
        }
        if (roleSlots.length >= 10) {
            setSlotError('Maksimum 10 yuva əlavə edə bilərsiniz');
            return;
        }
        const newSlot = createRoleSlot(newSlotCategory.trim(), newSlotCount);
        setRoleSlots(prev => [...prev, newSlot]);
        setNewSlotCategory('');
        setNewSlotCount(1);
        setSlotError('');
    };

    const handleRemoveSlot = (id) => {
        setRoleSlots(prev => prev.filter(slot => slot.id !== id));
    };

    const handleCreate = async () => {
        if (!title.trim() || !desc.trim()) return;

        if (isEditing) {
            await projectsService.update(params.projectId, {
                title: title.trim(),
                desc: desc.trim(),
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
                projectType,
                stage,
                documentUrl: documentUrl.trim(),
                documentFile,
                grad: selectedGrad,
                roleSlots,
            });
        } else {
            await projectsService.create({
                title: title.trim(),
                desc: desc.trim(),
                authorId: currentUser.id,
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
                projectType,
                stage,
                documentUrl: documentUrl.trim(),
                documentFile,
                grad: selectedGrad,
                roleSlots,
            });
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
            <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[32px] md:rounded-[40px] p-5 sm:p-8 md:p-10 shadow-sm dark:shadow-2xl flex flex-col min-h-[400px]">
                
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
                                <div className={`relative ${isTypeOpen ? 'z-50' : 'z-30'}`}>
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
                                                {['Startap', 'Açıq Mənbə', 'Şəxsi Portfel', 'Tədqiqat / Təhsil', 'Biznes', 'Digər'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => { setProjectType(opt); setCustomType(''); setIsTypeOpen(false); }}
                                                        className={`w-full text-left px-6 py-3.5 text-sm transition-colors ${projectType === opt ? 'bg-brand-500/10 text-brand-500 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {projectType === 'Digər' && (
                                        <input
                                            type="text"
                                            value={customType}
                                            onChange={(e) => { setCustomType(e.target.value); setProjectType(e.target.value || 'Digər'); }}
                                            placeholder="Layihə növünü yazın..."
                                            autoFocus
                                            className="mt-2 w-full bg-black/5 dark:bg-white/5 border border-brand-500/40 rounded-2xl px-5 py-3.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500/70 transition-all"
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">{t('newProject.stageLabel', 'Mərhələ')}</label>
                                <div className={`relative ${isStageOpen ? 'z-50' : 'z-20'}`}>
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
                                                {['Yalnız İdeya', 'Planlaşdırma / Dizayn', 'Aktiv Hazırlıq', 'MVP Hazırdır', 'Test / Bazar', 'Digər'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => { setStage(opt); setCustomStage(''); setIsStageOpen(false); }}
                                                        className={`w-full text-left px-6 py-3.5 text-sm transition-colors ${stage === opt ? 'bg-brand-500/10 text-brand-500 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {stage === 'Digər' && (
                                        <input
                                            type="text"
                                            value={customStage}
                                            onChange={(e) => { setCustomStage(e.target.value); setStage(e.target.value || 'Digər'); }}
                                            placeholder="Mərhələni yazın..."
                                            autoFocus
                                            className="mt-2 w-full bg-black/5 dark:bg-white/5 border border-brand-500/40 rounded-2xl px-5 py-3.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500/70 transition-all"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Rol Yuvaları Bölməsi */}
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">
                                Lazım olan bacarıqlar
                            </label>

                            {/* Yeni yuva əlavə etmə forması */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                <div className="relative w-full sm:flex-1 group">
                                    <Icon icon="mdi:account-hard-hat-outline" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={newSlotCategory}
                                        onChange={(e) => { setNewSlotCategory(e.target.value); setSlotError(''); }}
                                        placeholder="Bacarıq adı (məs. Frontend Developer)"
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-white dark:focus:bg-black transition-all min-w-0"
                                    />
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <CustomSelect
                                        value={newSlotCount}
                                        onChange={(val) => setNewSlotCount(Number(val))}
                                        options={[1,2,3,4,5,6,7,8,9,10].map(n => ({ label: `${n} nəfər`, value: n }))}
                                        className="w-full bg-transparent text-sm text-neutral-900 dark:text-white focus:outline-none"
                                        containerClassName="flex-1 sm:w-28 bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-2xl px-4 py-4 focus-within:border-brand-500/50 focus-within:bg-white dark:focus-within:bg-black transition-all cursor-pointer min-w-0"
                                    />
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleAddSlot}
                                        disabled={roleSlots.length >= 10}
                                        className="!px-5 !rounded-2xl shrink-0 flex-1 sm:flex-none justify-center"
                                    >
                                        <Icon icon="mdi:plus" className="text-lg" />
                                        Əlavə et
                                    </Button>
                                </div>
                            </div>

                            {/* Xəta mesajı */}
                            {slotError && (
                                <p className="text-xs text-rose-500 font-medium mb-3 ml-1 flex items-center gap-1">
                                    <Icon icon="mdi:alert-circle-outline" className="text-sm" />
                                    {slotError}
                                </p>
                            )}

                            {/* 10 limit xəbərdarlığı */}
                            {roleSlots.length >= 10 && (
                                <p className="text-xs text-amber-500 font-medium mb-3 ml-1 flex items-center gap-1">
                                    <Icon icon="mdi:information-outline" className="text-sm" />
                                    Maksimum 10 yuva əlavə edə bilərsiniz
                                </p>
                            )}

                            {/* Mövcud yuvalar siyahısı */}
                            {roleSlots.length > 0 && (
                                <div className="flex flex-col gap-2 mt-2">
                                    {roleSlots.map(slot => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between bg-black/[0.03] dark:bg-white/[0.04] border border-black/8 dark:border-white/8 rounded-2xl px-5 py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                                    <Icon icon="mdi:account-outline" className="text-brand-500 text-base" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{slot.category}</p>
                                                    <p className="text-[11px] text-neutral-400 font-medium">{slot.count} nəfər</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSlot(slot.id)}
                                                className="w-7 h-7 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all duration-200"
                                                aria-label="Yuvası sil"
                                            >
                                                <Icon icon="mdi:close" className="text-sm" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {roleSlots.length === 0 && (
                                <p className="text-[11px] text-neutral-400 mt-1 ml-1 font-medium tracking-wide">
                                    <Icon icon="mdi:information-outline" className="inline mr-1" />
                                    Layihəniz üçün lazım olan bacarıq kateqoriyalarını əlavə edin (könüllü)
                                </p>
                            )}
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
                <div className="flex justify-between items-center mt-auto pt-10 border-t border-black/8 dark:border-white/5 gap-2">
                    {step > 1 ? (
                        <Button variant="secondary" onClick={prevStep} size="md" className="flex-1 sm:flex-none !px-2 sm:!px-8 justify-center min-w-0">
                            <Icon icon="mdi:chevron-left" className="text-lg shrink-0" />
                            <span className="truncate">Geri</span>
                        </Button>
                    ) : (
                        <div className="flex-1 sm:flex-none" />
                    )}

                    <div className="flex gap-3 flex-[2] sm:flex-none min-w-0">
                        {step < 3 ? (
                            <Button 
                                variant="primary" 
                                onClick={nextStep} 
                                size="md" 
                                className="w-full sm:w-auto !px-2 sm:!px-10 shadow-brand-500/20 justify-center min-w-0"
                                disabled={step === 1 && (!title.trim() || !desc.trim())}
                            >
                                <span className="truncate">Növbəti</span>
                                <Icon icon="mdi:chevron-right" className="text-lg shrink-0" />
                            </Button>
                        ) : (
                            <Button 
                                variant="primary" 
                                onClick={handleCreate} 
                                size="md" 
                                className="w-full sm:w-auto !px-2 sm:!px-12 shadow-brand-500/30 justify-center min-w-0"
                                disabled={!title.trim() || !desc.trim()}
                            >
                                <Icon icon={isEditing ? "mdi:content-save-outline" : "mdi:rocket-launch-outline"} className="text-lg shrink-0" />
                                <span className="truncate">{isEditing ? t('newProject.save', 'Yadda saxla') : t('newProject.create', 'Layihəni Yarat')}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
