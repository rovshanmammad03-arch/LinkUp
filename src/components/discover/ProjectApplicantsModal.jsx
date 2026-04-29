import React, { useState } from 'react';
import { getUser, initials, DB, addNotification, uid } from '../../services/db';
import { supabase } from '../../services/supabaseClient';
import { projectsService } from '../../services/projectsService';
import { acceptApplicantWithSlot, normalizeRoleSlots } from '../../services/roleSlotUtils';
import { Icon } from '@iconify/react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useTranslation } from 'react-i18next';

export default function ProjectApplicantsModal({ project, onClose, onNavigate, onProjectUpdated }) {
    useScrollLock(true);
    const { t } = useTranslation();
    const [toast, setToast] = useState(null);

    if (!project) return null;

    const applicants = (project.applicants || []).map(id => {
        if (typeof id === 'object') return id;
        return { id, status: 'pending' };
    });

    const roleSlots = normalizeRoleSlots(project);

    const getApplicantStatus = (entry) => entry.status || 'pending';

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3500);
    };

    const handleAccept = async (applicantId) => {
        const applicantEntry = project.applicants?.find(a => {
            const id = typeof a === 'object' ? a.id : a;
            return id === applicantId;
        });
        const roleSlotId = (typeof applicantEntry === 'object' && applicantEntry !== null)
            ? (applicantEntry.roleSlot ?? null)
            : null;

        const currentSlots = normalizeRoleSlots(project);
        const { updatedSlots, slotClosed, closedSlotCategory } = acceptApplicantWithSlot(currentSlots, roleSlotId);

        const newApplicants = (project.applicants || []).map(a => {
            const id = typeof a === 'object' ? a.id : a;
            if (id === applicantId) return { id, status: 'accepted', roleSlot: roleSlotId };
            return typeof a === 'object' ? a : { id: a, status: 'pending' };
        });

        const updated = await projectsService.update(project.id, {
            applicants: newApplicants,
            roleSlots: updatedSlots,
        });

        if (slotClosed && closedSlotCategory) {
            showToast(`"${closedSlotCategory}" yuvası dolduruldu`);
        }

        // Sistem mesajı
        await supabase.from('messages').insert([{
            id: 'm_' + uid(),
            from_user: 'system',
            project_id: project.id,
            text: `${getUser(applicantId)?.name} qrupa qatıldı!`,
            ts: Date.now(),
            read: true,
        }]);

        addNotification({
            toUserId: applicantId,
            fromUserId: project.authorId,
            type: 'project_accept',
            text: `"${project.title}" layihəsinə müraciətiniz qəbul edildi.`,
            route: 'messages',
            routeParams: { projectId: project.id },
        });

        if (onProjectUpdated && updated) onProjectUpdated(updated);
    };

    const handleReject = async (applicantId) => {
        const newApplicants = (project.applicants || []).map(a => {
            const id = typeof a === 'object' ? a.id : a;
            if (id === applicantId) return { id, status: 'rejected' };
            return typeof a === 'object' ? a : { id: a, status: 'pending' };
        });

        const updated = await projectsService.update(project.id, { applicants: newApplicants });
        if (onProjectUpdated && updated) onProjectUpdated(updated);
    };

    const statusBadge = (status) => {
        if (status === 'accepted') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
        if (status === 'rejected') return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    };

    const statusLabel = (status) => {
        if (status === 'accepted') return t('discover.project.accepted');
        if (status === 'rejected') return t('discover.project.rejected');
        return t('discover.project.pending');
    };

    // Müraciətin roleSlot ID-sinə uyğun yuvanı tap
    const findSlotForApplicant = (applicantEntry) => {
        if (!applicantEntry || typeof applicantEntry !== 'object') return null;
        const roleSlotId = applicantEntry.roleSlot;
        if (!roleSlotId) return null;
        return roleSlots.find(s => s.id === roleSlotId) || null;
    };

    // Bağlı yuvaya aid gözləyən müraciət üçün "Qəbul et" düyməsini deaktiv et
    const isAcceptDisabled = (applicantEntry) => {
        if (!applicantEntry || typeof applicantEntry !== 'object') return false;
        const roleSlotId = applicantEntry.roleSlot;
        if (!roleSlotId) return false; // roleSlot: null olan köhnə format müraciətlər üçün məhdudiyyət yoxdur
        const slot = roleSlots.find(s => s.id === roleSlotId);
        return slot ? slot.status === 'closed' : false;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Toast bildirişi */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 anim-up">
                    <Icon icon="mdi:check-circle-outline" className="text-lg shrink-0" />
                    {toast}
                </div>
            )}

            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[32px] p-8 max-w-xl w-full relative z-10 anim-up flex flex-col shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/8 dark:border-white/5">
                    <div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight">{t('discover.project.applications')}</h3>
                        <p className="text-neutral-500 text-xs mt-1">"{project.title}" — {applicants.length} {t('discover.project.applicantsCount', { count: applicants.length })}</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <Icon icon="mdi:close" className="text-xl" />
                    </button>
                </div>

                {/* Rol yuvası xülasəsi */}
                {roleSlots.length > 0 && (
                    <div className="mb-6 p-4 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/5 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">Rol Yuvaları</p>
                        <div className="flex flex-wrap gap-2">
                            {roleSlots.map(slot => (
                                <div key={slot.id} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-black/8 dark:border-white/8 rounded-xl">
                                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                                        {slot.category}:
                                    </span>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400" title={`${slot.filledCount} yer tutulub, cəmi ${slot.count} yer`}>
                                        {slot.filledCount}/{slot.count} nəfər
                                    </span>
                                    {slot.status === 'open' ? (
                                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            Açıq
                                        </span>
                                    ) : (
                                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                            Dolu
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {applicants.length === 0 ? (
                        <div className="text-center py-12">
                            <Icon icon="mdi:account-question-outline" className="text-5xl text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                            <p className="text-neutral-400 dark:text-neutral-500 text-sm">{t('discover.project.noApplicants')}</p>
                        </div>
                    ) : (
                        applicants.map((entry, i) => {
                            const applicantId = typeof entry === 'object' ? entry.id : entry;
                            const status = getApplicantStatus(entry);
                            const u = getUser(applicantId);
                            if (!u) return null;

                            const matchedSlot = findSlotForApplicant(entry);
                            const acceptDisabled = isAcceptDisabled(entry);

                            return (
                                <div key={applicantId} className="p-4 bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/5 rounded-2xl group hover:border-black/15 dark:hover:border-white/10 transition-all" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${u.grad} flex items-center justify-center text-sm font-bold shrink-0 shadow-lg ring-2 ring-black/5 dark:ring-white/5`}>
                                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-full" /> : initials(u.name)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-300 transition-colors leading-tight">{u.name}</h4>
                                                <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider mt-0.5">{u.field} · {u.university}</p>
                                                {/* Rol kateqoriyası etiketi */}
                                                <p className="text-[10px] mt-1">
                                                    {matchedSlot ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 dark:text-brand-300 border border-brand-500/20 font-semibold">
                                                            <Icon icon="mdi:briefcase-outline" className="text-[10px]" />
                                                            {matchedSlot.category}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-500/10 text-neutral-500 dark:text-neutral-400 border border-neutral-500/20 font-semibold">
                                                            <Icon icon="mdi:account-outline" className="text-[10px]" />
                                                            Ümumi müraciət
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${statusBadge(status)}`}>
                                            {statusLabel(status)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <button 
                                            onClick={() => { onNavigate('profile', { userId: u.id }); onClose(); }}
                                            className="flex-1 py-2 flex items-center justify-center gap-1.5 bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all text-[11px] font-bold active:scale-95"
                                        >
                                            <Icon icon="mdi:account-circle-outline" className="text-base" />
                                            {t('discover.project.viewAuthor')}
                                        </button>
                                        {status === 'accepted' ? (
                                            <button 
                                                onClick={() => { onNavigate('messages', { projectId: project.id }); onClose(); }}
                                                className="flex-1 py-2 flex items-center justify-center gap-1.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all text-[11px] font-bold active:scale-95 shadow-sm shadow-brand-500/20"
                                            >
                                                <Icon icon="mdi:account-group-outline" className="text-base" />
                                                Qrup Çatı
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => { onNavigate('messages', { userId: u.id }); onClose(); }}
                                                className="w-9 h-9 flex items-center justify-center bg-brand-500/10 text-brand-500 rounded-xl hover:bg-brand-500 hover:text-white transition-all active:scale-95"
                                            >
                                                <Icon icon="mdi:chat-processing-outline" className="text-base" />
                                            </button>
                                        )}
                                        {status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => !acceptDisabled && handleAccept(applicantId)}
                                                    disabled={acceptDisabled}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
                                                        acceptDisabled
                                                            ? 'bg-neutral-200/50 dark:bg-white/5 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50'
                                                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                    }`}
                                                    title={acceptDisabled ? 'Bu yuva artıq doludur' : t('discover.project.accept')}
                                                >
                                                    <Icon icon="mdi:check" className="text-base" />
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(applicantId)}
                                                    className="w-9 h-9 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                                    title={t('discover.project.reject')}
                                                >
                                                    <Icon icon="mdi:close" className="text-base" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-end mt-8">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                        {t('newProject.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
