import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export default function CustomSelect({ value, onChange, options, placeholder, className, containerClassName }) {
    const [isOpen, setIsOpen] = useState(false);

    const getLabel = (opt) => typeof opt === 'object' && opt !== null ? opt.label : opt;
    const getValue = (opt) => typeof opt === 'object' && opt !== null ? opt.value : opt;

    const selectedLabel = value !== undefined && value !== null
        ? getLabel(options.find(opt => getValue(opt) == value) || value)
        : placeholder;

    return (
        <div className={`relative ${isOpen ? 'z-50' : 'z-10'} ${containerClassName || 'w-full'}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between text-left focus:outline-none ${className || 'w-full bg-transparent'}`}
            >
                <span className="truncate">{selectedLabel}</span>
                <Icon icon="mdi:chevron-down" className={`text-xl opacity-50 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden max-h-60 overflow-y-auto anim-scale-in origin-top">
                        {options.map((opt, i) => {
                            const optVal = getValue(opt);
                            const optLabel = getLabel(opt);
                            const isSelected = value == optVal;
                            
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        onChange(optVal);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${isSelected ? 'bg-brand-500/10 text-brand-500 font-bold' : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {optLabel}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
