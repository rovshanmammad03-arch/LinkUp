import React from 'react';
import { getUser, initials } from '../../services/db';
import { Icon } from '@iconify/react';
import { useScrollLock } from '../../hooks/useScrollLock';

export default function ProjectApplicantsModal({ project, onClose, onNavigate }) {
    useScrollLock(true);
    if (!project) return null;
    if (!project) return null;

    const applicants = (project.applicants || []).map(id => getUser(id)).filter(u => u);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 max-w-xl w-full relative z-10 anim-up flex flex-col shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <div>
                        <h3 className="text-2xl font-bold text-white leading-tight">Müraciətlər</h3>
                        <p className="text-neutral-500 text-xs mt-1">"{project.title}" layihəsinə gələn müraciətlər.</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <Icon icon="mdi:close" className="text-xl" />
                    </button>
                </div>

                <div className="space-y-4">
                    {applicants.length === 0 ? (
                        <div className="text-center py-12">
                            <Icon icon="mdi:account-question-outline" className="text-5xl text-neutral-700 mx-auto mb-4" />
                            <p className="text-neutral-500 text-sm">Hələ ki, heç kim müraciət etməyib.</p>
                        </div>
                    ) : (
                        applicants.map((u, i) => (
                            <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-white/10 transition-all shadow-lg" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${u.grad} flex items-center justify-center text-sm font-bold shrink-0 shadow-lg ring-2 ring-white/5`}>
                                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-full" /> : initials(u.name)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors leading-tight">{u.name}</h4>
                                        <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider mt-0.5">{u.field} · {u.university}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            onNavigate('messages', { userId: u.id });
                                            onClose();
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-[#4b6bfb]/10 text-[#4b6bfb] rounded-xl hover:bg-[#4b6bfb] hover:text-white transition-all active:scale-95"
                                        title="Mesaj Göndər"
                                    >
                                        <Icon icon="mdi:chat-processing-outline" className="text-lg" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            onNavigate('profile', { userId: u.id });
                                            onClose();
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all active:scale-95"
                                        title="Profilə Bax"
                                    >
                                        <Icon icon="mdi:account-circle-outline" className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end mt-8">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl text-[11px] font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                        Bağla
                    </button>
                </div>
            </div>
        </div>
    );
}
