import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25',
    secondary: 'bg-neutral-100 dark:bg-[rgba(255,255,255,0.05)] hover:bg-neutral-200 dark:hover:bg-[rgba(255,255,255,0.1)] text-neutral-800 dark:text-neutral-200',
    outline: 'border border-neutral-200 dark:border-white/10 hover:border-brand-500 hover:bg-brand-500/5 text-neutral-700 dark:text-neutral-300',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400',
    danger: 'bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
