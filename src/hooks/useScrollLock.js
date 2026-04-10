import { useEffect } from 'react';

/**
 * Custom hook to lock body scroll when a condition is met (e.g., modal open)
 * @param {boolean} lock - Whether to lock the scroll
 */
export const useScrollLock = (lock) => {
    useEffect(() => {
        if (lock) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        
        // Cleanup when component unmounts
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [lock]);
};
