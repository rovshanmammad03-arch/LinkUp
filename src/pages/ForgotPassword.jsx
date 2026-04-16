import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { generateResetToken, verifyToken, resetPassword } from '../services/db';

export default function ForgotPassword({ onNavigate }) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [success, setSuccess] = useState(false);

    // Step 1: Email submission
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = generateResetToken(email);
        if (result.success) {
            setGeneratedCode(result.token);
            setStep(2);
        } else if (result.error === 'not_found') {
            setError(t('forgotPassword.errors.emailNotFound'));
        }
        setLoading(false);
    };

    // Step 2: Token verification
    const handleTokenSubmit = (e) => {
        e.preventDefault();
        setError('');
        const result = verifyToken(email, token);
        if (result.success) {
            setStep(3);
        } else if (result.error === 'wrong_token') {
            setError(t('forgotPassword.errors.wrongToken'));
        } else if (result.error === 'expired') {
            setError(t('forgotPassword.errors.expiredToken'));
        }
    };

    // Step 3: Password reset
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 8) {
            setError(t('forgotPassword.errors.passwordTooShort'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t('forgotPassword.errors.passwordMismatch'));
            return;
        }
        const result = resetPassword(email, newPassword);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onNavigate('login');
            }, 2000);
        }
    };

    return (
        <div className="max-w-md mx-auto px-6 py-12 anim-up">
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/20">
                    <Icon icon="mdi:lock-reset" className="text-white text-3xl" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('forgotPassword.title')}</h1>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
                {success ? (
                    // Success state
                    <div className="text-center py-4">
                        <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:check-circle-outline" className="text-green-400 text-4xl" />
                        </div>
                        <p className="text-green-400 text-sm">{t('forgotPassword.successMsg')}</p>
                    </div>
                ) : step === 1 ? (
                    // Step 1: Email form
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                        <div className="mb-2">
                            <h2 className="text-lg font-semibold text-white">{t('forgotPassword.step1Title')}</h2>
                            <p className="text-neutral-400 text-sm mt-1">{t('forgotPassword.step1Desc')}</p>
                        </div>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                                <Icon icon="mdi:alert-circle-outline" /> {error}
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-neutral-400 mb-1.5 block">{t('forgotPassword.emailLabel')}</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 mt-4 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('forgotPassword.sendCodeBtn')} <Icon icon="mdi:arrow-right" />
                        </button>
                    </form>
                ) : step === 2 ? (
                    // Step 2: Token form
                    <form onSubmit={handleTokenSubmit} className="space-y-5">
                        <div className="mb-2">
                            <h2 className="text-lg font-semibold text-white">{t('forgotPassword.step2Title')}</h2>
                            <p className="text-neutral-400 text-sm mt-1">{t('forgotPassword.step2Desc')}</p>
                        </div>
                        <div className="bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs p-3 rounded-lg flex items-center gap-2">
                            <Icon icon="mdi:information-outline" />
                            {t('forgotPassword.demoCodeMsg', { code: generatedCode })}
                        </div>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                                <Icon icon="mdi:alert-circle-outline" /> {error}
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-neutral-400 mb-1.5 block">{t('forgotPassword.tokenLabel')}</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder={t('forgotPassword.tokenPlaceholder')}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full py-3 mt-4 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30"
                        >
                            {t('forgotPassword.verifyBtn')} <Icon icon="mdi:arrow-right" />
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setToken(''); setError(''); }}
                            className="w-full text-sm text-neutral-400 hover:text-neutral-200 transition-colors flex items-center justify-center gap-1 mt-2"
                        >
                            <Icon icon="mdi:chevron-left" /> {t('forgotPassword.backToEmail')}
                        </button>
                    </form>
                ) : (
                    // Step 3: New password form
                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <div className="mb-2">
                            <h2 className="text-lg font-semibold text-white">{t('forgotPassword.step3Title')}</h2>
                            <p className="text-neutral-400 text-sm mt-1">{t('forgotPassword.step3Desc')}</p>
                        </div>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                                <Icon icon="mdi:alert-circle-outline" /> {error}
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-neutral-400 mb-1.5 block">{t('forgotPassword.newPasswordLabel')}</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400 mb-1.5 block">{t('forgotPassword.confirmPasswordLabel')}</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full py-3 mt-4 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30"
                        >
                            {t('forgotPassword.resetBtn')} <Icon icon="mdi:check" />
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <button
                            type="button"
                            onClick={() => onNavigate('login')}
                            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                            <Icon icon="mdi:chevron-left" /> {t('forgotPassword.backToLogin')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
