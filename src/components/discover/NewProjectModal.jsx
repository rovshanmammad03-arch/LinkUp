import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DB, uid, GRADIENTS } from '../../services/db';
import { Icon } from '@iconify/react';
import { useScrollLock } from '../../hooks/useScrollLock';

export default function NewProjectModal({ onClose, onProjectCreated }) {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [skills, setSkills] = useState('');
    const [team, setTeam] = useState('2-3 nəfər');
    const [selectedGrad, setSelectedGrad] = useState(GRADIENTS[0]);

    useScrollLock(true);

    const handleCreate = () => {
        if (!title.trim() || !desc.trim()) return;

        const projects = DB.get('projects');
        const newProject = {
            id: 'p_' + uid(),
            title: title.trim(),
            desc: desc.trim(),
            authorId: currentUser.id,
            skills: skills.split(',').map(s => s.trim()).filter(s => s),
            team: team,
            status: 'active',
            createdAt: Date.now(),
            applicants: [],
            grad: selectedGrad
        };

        DB.set('projects', [newProject, ...projects]);
        if (onProjectCreated) onProjectCreated();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 max-w-xl w-full relative z-10 anim-up flex flex-col shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <div>
                        <h3 className="text-2xl font-bold text-white leading-tight">Layihə Yarat</h3>
                        <p className="text-neutral-500 text-xs mt-1">Komandanı topla və ideyanı reallaşdır.</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <Icon icon="mdi:close" className="text-xl" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Layihənin Adı</label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Məsələn: E-ticaret Platforması"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all shadow-inner"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Layihə Haqqında</label>
                        <textarea 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Layihənin məqsədi və hədəfləri haqqında məlumat verin..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all shadow-inner h-32 resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Lazım olan Bacarıqlar</label>
                            <input 
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="React, UI/UX, Node.js"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all shadow-inner"
                            />
                            <p className="text-[10px] text-neutral-600 mt-1.5 ml-1">Vergüllə ayırın</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Komanda Ölçüsü</label>
                            <select 
                                value={team}
                                onChange={(e) => setTeam(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all shadow-inner outline-none appearance-none cursor-pointer"
                            >
                                <option value="1-2 nəfər">1-2 nəfər</option>
                                <option value="2-3 nəfər">2-3 nəfər</option>
                                <option value="3-5 nəfər">3-5 nəfər</option>
                                <option value="5+ nəfər">5+ nəfər</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 block">Layihə Rəngi</label>
                        <div className="flex flex-wrap gap-3">
                            {GRADIENTS.map((g, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setSelectedGrad(g)}
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} transition-all ${selectedGrad === g ? 'ring-4 ring-brand-500/30 ring-offset-4 ring-offset-[#0a0a0a] scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-10">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3.5 rounded-2xl text-[11px] font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                        Ləğv et
                    </button>
                    <button 
                        onClick={handleCreate}
                        className="px-10 py-3.5 rounded-2xl text-[11px] font-bold text-white bg-brand-500 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!title.trim() || !desc.trim()}
                    >
                        Layihəni Yarat
                    </button>
                </div>
            </div>
        </div>
    );
}
