import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { generateAndStoreCode } from '../services/verification';
import { sendVerificationEmail } from '../services/emailService';

export default function Login({ onNavigate }) {
    const { login } = useAuth();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [needsVerification, setNeedsVerification] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [resending, setResending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setNeedsVerification(false);

        const res = login(email, password);
        if (res.success) {
            onNavigate('dashboard');
        } else if (res.needsVerification) {
            // Account exists but not verified — show verification prompt
            setNeedsVerification(true);
            setPendingEmail(res.email || email);
        } else {
            setError(res.message);
        }
    };

    const handleGoToVerify = () => {
        onNavigate('verify-email', { email: pendingEmail });
    };

    const handleResendCode = async () => {
        setResending(true);
        const { code } = generateAndStoreCode(pendingEmail);
        await sendVerificationEmail(pendingEmail, code);
        setResending(false);
        onNavigate('verify-email', { email: pendingEmail });
    };

    return (
        <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 anim-up">
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/20">
                    <Icon icon="mdi:link-variant" className="text-white text-3xl" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('auth.welcomeBack')}</h1>
                <p className="text-neutral-400 text-sm">{t('auth.welcomeBackDesc')}</p>
            </div>

            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                {/* Unverified account banner */}
                {needsVerification ? (
                    <div className="space-y-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm p-4 rounded-lg" role="alert">
                            <div className="flex items-start gap-2 mb-3">
                                <Icon icon="mdi:email-alert-outline" className="text-lg mt-0.5 shrink-0" />
                                <p>{t('verification.notVerified')}</p>
                            </div>
                            <p className="text-xs text-amber-400/70 ml-6">
                                {t('verification.pageDesc')} <span className="font-medium">{pendingEmail}</span>
                            </p>
                        </div>

                        <button
                            onClick={handleGoToVerify}
                            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
                        >
                            <Icon icon="mdi:email-check-outline" />
                            {t('verification.goToVerify')}
                        </button>

                        <button
                            onClick={handleResendCode}
                            disabled={resending}
                            className="w-full py-2.5 text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {resending ? (
                                <><Icon icon="mdi:loading" className="animate-spin" /> Sending...</>
                            ) : (
                                <><Icon icon="mdi:email-sync-outline" /> {t('verification.resendLink')}</>
                            )}
                        </button>

                        <button
                            onClick={() => { setNeedsVerification(false); setError(''); }}
                            className="w-full text-xs text-neutral-500 hover:text-neutral-400 transition-colors"
                        >
                            ← {t('auth.backHome')}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                                <Icon icon="mdi:alert-circle-outline" /> {error}
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-neutral-400 mb-1.5 block">{t('auth.email')}</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder={t('auth.emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400 mb-1.5 block">{t('auth.password')}</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate('forgot-password')}
                            className="text-xs text-brand-400 hover:text-brand-300 transition-colors text-right w-full"
                        >
                            {t('forgotPassword.forgotLink')}
                        </button>
                        <button type="submit" className="btn-primary w-full py-3 mt-4 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30">
                            {t('auth.loginBtn')} <Icon icon="mdi:arrow-right" />
                        </button>
                    </form>
                )}

                {!needsVerification && (
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-neutral-500">
                            {t('auth.noAccount')}{' '}
                            <button onClick={() => onNavigate('register')} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                                {t('auth.signUp')}
                            </button>
                        </p>
                    </div>
                )}
            </div>

            <button onClick={() => onNavigate('landing')} className="mt-8 text-neutral-500 hover:text-neutral-300 transition-colors text-sm flex items-center justify-center gap-2 mx-auto">
                <Icon icon="mdi:chevron-left" /> {t('auth.backHome')}
            </button>
        </div>
    );
}
