import React, { useState } from 'react';

export default function Tooltip({ children, content, position = 'bottom' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-neutral-800 dark:border-t-neutral-200 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-800 dark:border-b-neutral-200 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-neutral-800 dark:border-l-neutral-200 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-neutral-800 dark:border-r-neutral-200 border-t-transparent border-b-transparent border-l-transparent',
  };

  if (!content) return <>{children}</>;

  return (
    <div 
      className="relative flex items-center justify-center group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 whitespace-nowrap ${positions[position]} pointer-events-none animate-in fade-in zoom-in-95 duration-200`}>
          <div className="bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 dark:border-black/10 flex items-center justify-center">
            {content}
          </div>
          <div className={`absolute w-0 h-0 border-[4px] ${arrowPositions[position]}`} />
        </div>
      )}
    </div>
  );
}
