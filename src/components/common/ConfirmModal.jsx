import React from 'react';
import { Icon } from '@iconify/react';
import { useScrollLock } from '../../hooks/useScrollLock';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Bəli', cancelText = 'Xeyr', type = 'danger' }) {
    useScrollLock(true);
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative z-10 anim-up flex flex-col shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                    <Icon icon="mdi:alert-circle-outline" className="text-3xl text-rose-500" />
                </div>
                
                <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm text-center mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onConfirm}
                        className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95 uppercase tracking-widest"
                    >
                        {confirmText}
                    </button>
                    <button 
                        onClick={onCancel}
                        className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}
