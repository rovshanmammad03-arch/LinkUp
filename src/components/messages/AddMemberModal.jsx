import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { DB, initials } from '../../services/db';
import { useScrollLock } from '../../hooks/useScrollLock';

export default function AddMemberModal({ projectId, currentMembers, adminId, onAdd, onClose, error, onClearError }) {
    const [search, setSearch] = useState('');

    useScrollLock(true);

    const activeMemberIds = new Set(
        currentMembers
            .filter(a => (typeof a === 'object' ? a.status : 'pending') === 'accepted')
            .map(a => typeof a === 'object' ? a.id : a)
    );

    // Yalnız adminin takipçilərini göstər
    const admin = DB.get('users').find(u => u.id === adminId);
    const followerIds = new Set(Array.isArray(admin?.followers) ? admin.followers : []);

    const candidates = DB.get('users').filter(u =>
        u.id !== adminId &&
        followerIds.has(u.id) &&
        !activeMemberIds.has(u.id) &&
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-6 w-full max-w-sm relative z-10 anim-up flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-white">Üzv Əlavə Et</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
                    >
                        <Icon icon="mdi:close" className="text-lg" />
                    </button>
                </div>

                {/* Search input */}
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 mb-4 focus-within:border-white/20 transition-colors">
                    <Icon icon="mdi:magnify" className="text-neutral-500 text-lg shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); if (onClearError) onClearError(); }}
                        placeholder="İstifadəçi axtar..."
                        className="bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none w-full"
                        autoFocus
                    />
                </div>

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-3 py-2.5 rounded-xl mb-3">
                        <Icon icon="mdi:alert-circle-outline" className="text-base shrink-0" />
                        {error}
                    </div>
                )}

                {/* Candidates list */}
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {candidates.length === 0 ? (
                        <p className="text-neutral-500 text-sm text-center py-6">
                            {search ? 'İstifadəçi tapılmadı' : followerIds.size === 0 ? 'Takipçiniz yoxdur' : 'Bütün takipçilər artıq üzvdür'}
                        </p>
                    ) : (
                        candidates.map(u => (
                            <button
                                key={u.id}
                                onClick={() => onAdd(u.id)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-all text-left group"
                            >
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${u.grad || 'from-brand-500 to-purple-500'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                    {initials(u.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                                    <p className="text-xs text-neutral-500 truncate">{u.field || u.university || ''}</p>
                                </div>
                                <Icon icon="mdi:plus" className="text-neutral-600 group-hover:text-white transition-colors text-lg shrink-0" />
                            </button>
                        ))
                    )}
                </div>

                {/* Cancel button */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
                >
                    Ləğv et
                </button>
            </div>
        </div>
    );
}
