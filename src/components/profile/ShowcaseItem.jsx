import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import ConfirmModal from '../common/ConfirmModal';

/**
 * Tək bir showcase elementini render edən komponent.
 *
 * @param {{ showcase: object, canDelete: boolean, onDelete: () => void }} props
 */
export default function ShowcaseItem({ showcase, canDelete, onDelete }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const formattedDate = new Date(showcase.createdAt).toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmDelete = () => {
        setShowConfirm(false);
        if (onDelete) onDelete();
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
    };

    return (
        <>
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden flex flex-col gap-0 group transition-all hover:border-white/15">
                {/* Şəkil */}
                {showcase.image && (
                    <div className="relative overflow-hidden">
                        <img
                            src={showcase.image}
                            alt="Showcase"
                            className="w-full object-cover max-h-56 transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    </div>
                )}

                {/* Məzmun */}
                <div className="p-4 flex flex-col gap-3">
                    {/* Açıqlama */}
                    {showcase.description && (
                        <p className="text-sm text-neutral-300 leading-relaxed">
                            {showcase.description}
                        </p>
                    )}

                    {/* Alt sıra: tarix, link, sil düyməsi */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Tarix */}
                            <span className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                                <Icon icon="mdi:calendar-outline" className="text-sm shrink-0" />
                                {formattedDate}
                            </span>

                            {/* Canlı link */}
                            {showcase.liveUrl && (
                                <a
                                    href={showcase.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                                >
                                    <Icon icon="mdi:open-in-new" className="text-sm shrink-0" />
                                    Canlı bax
                                </a>
                            )}
                        </div>

                        {/* Sil düyməsi */}
                        {canDelete && (
                            <button
                                onClick={handleDeleteClick}
                                className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10"
                                aria-label="Showcase-i sil"
                            >
                                <Icon icon="mdi:delete-outline" className="text-sm" />
                                Sil
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showConfirm && (
                <ConfirmModal
                    title="Showcase-i sil"
                    message="Bu showcase elementi silinəcək. Bu əməliyyat geri qaytarıla bilməz."
                    confirmText="Sil"
                    cancelText="Ləğv et"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </>
    );
}
