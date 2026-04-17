import React from 'react';
import ShowcaseItem from './ShowcaseItem';

/**
 * Layihəyə aid showcase elementlərinin siyahısını render edən komponent.
 *
 * @param {{
 *   showcases: object[],
 *   currentUserId: string | null,
 *   isOwnProfile: boolean,
 *   onDelete: (id: string) => void
 * }} props
 */
export default function ShowcaseList({ showcases, currentUserId, isOwnProfile, onDelete }) {
    if (!showcases || showcases.length === 0) {
        if (isOwnProfile) {
            return (
                <p className="text-sm text-neutral-500 italic">
                    Hələ showcase yoxdur
                </p>
            );
        }
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            {showcases.map((showcase) => (
                <ShowcaseItem
                    key={showcase.id}
                    showcase={showcase}
                    canDelete={showcase.userId === currentUserId}
                    onDelete={() => onDelete(showcase.id)}
                />
            ))}
        </div>
    );
}
