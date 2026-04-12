import React from 'react';
import { getUser, initials, DB, addNotification } from '../../services/db';
import { Icon } from '@iconify/react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useTranslation } from 'react-i18next';

export default function ProjectApplicantsModal({ project, onClose, onNavigate, onProjectUpdated }) {
    useScrollLock(true);
    const { t } = useTranslation();
    if (!project) return null;

    const applicants = (project.applicants || []).map(id => {
        if (typeof id === 'object') return id;
        return { id, status: 'pending' };
    });

    const getApplicantStatus = (entry) => entry.status || 'pending';

    const handleAccept = (applicantId) => {
        const allProjects = DB.get('projects');
        const pIdx = allProjects.findIndex(p => p.id === project.id);
        if (pIdx === -1) return;

        allProjects[pIdx].applicants = allProjects[pIdx].applicants.map(a => {
            const id = typeof a === 'object' ? a.id : a;
            if (id === applicantId) return { id, status: 'accepted' };
            return typeof a === 'object' ? a : { id: a, status: 'pending' };
        });

        DB.set('projects', allProjects);

        // Send System Message to Group
        const msgs = DB.get('messages');
        msgs.push({
            id: 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            from: 'system',
            projectId: project.id,
            text: `${getUser(applicantId)?.name} qrupa qatıldı!`,
            ts: Date.now()
        });
        DB.set('messages', msgs);

        addNotification({
            toUserId: applicantId,
            fromUserId: project.authorId,
            type: 'project_accept',
            text: `"${project.title}" layihəsinə müraciətiniz qəbul edildi. Qrup çatına daxil ola bilərsiniz.`,
            route: 'messages',
            routeParams: { projectId: project.id },
        });
        if (onProjectUpdated) onProjectUpdated(allProjects[pIdx]);
    };

    const handleReject = (applicantId) => {
        const allProjects = DB.get('projects');
        const pIdx = allProjects.findIndex(p => p.id === project.id);
        if (pIdx === -1) return;

        allProjects[pIdx].applicants = allProjects[pIdx].applicants.map(a => {
            const id = typeof a === 'object' ? a.id : a;
            if (id === applicantId) return { id, status: 'rejected' };
            return typeof a === 'object' ? a : { id: a, status: 'pending' };
        });

        DB.set('projects', allProjects);
        if (onProjectUpdated) onProjectUpdated(allProjects[pIdx]);
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[32px] p-8 max-w-xl w-full relative z-10 anim-up flex flex-col shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/8 dark:border-white/5">
                    <div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight">{t('discover.project.applications')}</h3>
                        <p className="text-neutral-500 text-xs mt-1">"{project.title}" — {applicants.length} {t('discover.project.applicantsCount', { count: applicants.length })}</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <Icon icon="mdi:close" className="text-xl" />
                    </button>
                </div>

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
                                                    onClick={() => handleAccept(applicantId)}
                                                    className="w-9 h-9 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                                    title={t('discover.project.accept')}
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
