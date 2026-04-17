import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../context/AuthContext';
import { useScrollLock } from '../../hooks/useScrollLock';
import * as showcaseService from '../../services/showcaseService';

const MAX_DESCRIPTION_LENGTH = 300;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function ShowcaseModal({ projectId, onClose, onSaved }) {
    const { currentUser } = useAuth();
    const fileInputRef = useRef(null);

    const [liveUrl, setLiveUrl] = useState('');
    const [description, setDescription] = useState('');
    const [imageBase64, setImageBase64] = useState(null);
    const [imagePreviewName, setImagePreviewName] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useScrollLock(true);

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                const canvas = document.createElement('canvas');
                const MAX_DIM = 1200;
                let { width, height } = img;
                if (width > MAX_DIM || height > MAX_DIM) {
                    if (width > height) { height = Math.round(height * MAX_DIM / width); width = MAX_DIM; }
                    else { width = Math.round(width * MAX_DIM / height); height = MAX_DIM; }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                // Quality 0.7 — yaxşı keyfiyyət, kiçik ölçü
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
            img.src = url;
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!showcaseService.isValidFileSize(file.size)) {
            setErrors(prev => ({ ...prev, image: 'Şəkil 2MB-dan kiçik olmalıdır' }));
            e.target.value = '';
            return;
        }

        setErrors(prev => ({ ...prev, image: undefined }));
        setImagePreviewName(file.name);

        try {
            const compressed = await compressImage(file);
            setImageBase64(compressed);
        } catch {
            // Sıxışdırma uğursuz olsa orijinalı istifadə et
            const reader = new FileReader();
            reader.onload = (ev) => setImageBase64(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageBase64(null);
        setImagePreviewName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Check if all fields are empty
        const trimmedUrl = liveUrl.trim();
        const trimmedDesc = description.trim();
        if (!trimmedUrl && !trimmedDesc && !imageBase64) {
            newErrors.general = 'Ən azı bir sahəni doldurun';
            setErrors(newErrors);
            return;
        }

        // Validate URL if provided
        if (trimmedUrl && !showcaseService.isValidUrl(trimmedUrl)) {
            newErrors.liveUrl = 'URL http:// və ya https:// ilə başlamalıdır';
        }

        // Validate description length
        if (description.length > MAX_DESCRIPTION_LENGTH) {
            newErrors.description = `Açıqlama ${MAX_DESCRIPTION_LENGTH} simvoldan uzun ola bilməz`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const showcase = showcaseService.add({
                projectId,
                userId: currentUser.id,
                liveUrl: trimmedUrl || undefined,
                image: imageBase64 || undefined,
                description: trimmedDesc || undefined,
            });
            onSaved(showcase);
        } catch (err) {
            console.error('Showcase saxlanılarkən xəta baş verdi:', err);
            const isQuota = err && (err.name === 'QuotaExceededError' || err.code === 22);
            setErrors({
                general: isQuota
                    ? 'Yaddaş dolu. Şəkilsiz cəhd edin və ya köhnə məlumatları silin.'
                    : 'Xəta baş verdi. Yenidən cəhd edin.'
            });
        } finally {
            setLoading(false);
        }
    };

    const descLength = description.length;
    const isDescOverLimit = descLength > MAX_DESCRIPTION_LENGTH;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative z-10 anim-up flex flex-col shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Showcase Əlavə Et</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
                    >
                        <Icon icon="mdi:close" className="text-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* General error */}
                    {errors.general && (
                        <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                            {errors.general}
                        </div>
                    )}

                    {/* Live URL field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Canlı Link <span className="normal-case font-normal text-neutral-600">(könüllü)</span>
                        </label>
                        <div className={`flex items-center gap-3 bg-white/3 border rounded-2xl px-4 py-3 focus-within:border-white/20 transition-colors ${errors.liveUrl ? 'border-rose-500/40' : 'border-white/8'}`}>
                            <Icon icon="mdi:link-variant" className="text-neutral-400 text-xl shrink-0" />
                            <input
                                type="text"
                                value={liveUrl}
                                onChange={e => {
                                    setLiveUrl(e.target.value);
                                    if (errors.liveUrl) setErrors(prev => ({ ...prev, liveUrl: undefined }));
                                }}
                                placeholder="https://example.com"
                                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none"
                            />
                        </div>
                        {errors.liveUrl && (
                            <p className="text-xs text-rose-400 px-1">{errors.liveUrl}</p>
                        )}
                    </div>

                    {/* Image upload field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Şəkil <span className="normal-case font-normal text-neutral-600">(könüllü, maks. 2MB)</span>
                        </label>

                        {imageBase64 ? (
                            <div className="relative rounded-2xl overflow-hidden border border-white/8 group">
                                <img
                                    src={imageBase64}
                                    alt="Seçilmiş şəkil"
                                    className="w-full max-h-48 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icon icon="mdi:close" className="text-sm" />
                                </button>
                                <div className="px-4 py-2 bg-white/3 border-t border-white/8">
                                    <p className="text-xs text-neutral-500 truncate">{imagePreviewName}</p>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex items-center justify-center gap-3 bg-white/3 border rounded-2xl px-4 py-5 hover:bg-white/5 hover:border-white/15 transition-all ${errors.image ? 'border-rose-500/40' : 'border-white/8 border-dashed'}`}
                            >
                                <Icon icon="mdi:image-plus-outline" className="text-2xl text-neutral-500" />
                                <span className="text-sm text-neutral-500">Şəkil seçin</span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {errors.image && (
                            <p className="text-xs text-rose-400 px-1">{errors.image}</p>
                        )}
                    </div>

                    {/* Description field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Açıqlama <span className="normal-case font-normal text-neutral-600">(könüllü, maks. 300 simvol)</span>
                        </label>
                        <div className={`bg-white/3 border rounded-2xl px-4 py-3 focus-within:border-white/20 transition-colors ${errors.description ? 'border-rose-500/40' : 'border-white/8'}`}>
                            <textarea
                                value={description}
                                onChange={e => {
                                    setDescription(e.target.value);
                                    if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                                }}
                                placeholder="Bu layihə haqqında qısa məlumat..."
                                className="w-full bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none resize-none min-h-[80px] leading-relaxed"
                            />
                        </div>
                        {/* Character counter */}
                        <div className="flex justify-end px-1">
                            <span className={`text-xs font-medium transition-colors ${isDescOverLimit ? 'text-rose-400' : 'text-neutral-600'}`}>
                                {descLength} / {MAX_DESCRIPTION_LENGTH}
                            </span>
                        </div>
                        {errors.description && (
                            <p className="text-xs text-rose-400 px-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3 mt-2">
                        <button
                            type="submit"
                            disabled={loading || isDescOverLimit}
                            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Icon icon="mdi:loading" className="text-base animate-spin" />
                                    Saxlanılır...
                                </span>
                            ) : (
                                'Saxla'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
                        >
                            Ləğv et
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
