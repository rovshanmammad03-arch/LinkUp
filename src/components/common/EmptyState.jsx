import React from 'react';
import { Icon } from '@iconify/react';
import Button from './Button';

export default function EmptyState({ 
  icon = 'mdi:alert-circle-outline', 
  title, 
  description, 
  actionLabel, 
  onAction,
  iconColor = 'text-neutral-300 dark:text-neutral-700'
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-neutral-50/50 dark:bg-black/50 rounded-2xl h-full w-full border border-black/5 dark:border-white/5">
      <div className="w-24 h-24 rounded-full bg-white dark:bg-[#111] shadow-xl flex items-center justify-center mb-6 border border-black/5 dark:border-white/5 relative">
        <div className="absolute inset-0 rounded-full bg-brand-500/5 dark:bg-brand-500/10 animate-pulse"></div>
        <Icon icon={icon} className={`text-5xl ${iconColor} relative z-10`} />
      </div>
      
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h2>
      
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
